import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[COURSE-MANAGEMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false
        }
      }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { action, ...requestData } = await req.json();

    logStep("Request received", { action, userId: user.id });

    switch (action) {
      case 'enroll_user': {
        const { courseId } = requestData;

        // Check if course exists and is published
        const { data: course, error: courseError } = await supabaseClient
          .from('courses')
          .select('id, title, price, is_published')
          .eq('id', courseId)
          .single();

        if (courseError || !course) {
          throw new Error('Course not found');
        }

        if (!course.is_published) {
          throw new Error('Course is not available for enrollment');
        }

        // Check subscription status for paid courses
        if (course.price && course.price > 0) {
          const { data: subscription } = await supabaseClient
            .from('subscribers')
            .select('subscribed, subscription_end')
            .eq('user_id', user.id)
            .eq('subscribed', true)
            .single();

          if (!subscription || new Date(subscription.subscription_end) <= new Date()) {
            throw new Error('Active subscription required for this course');
          }
        }

        // Check if already enrolled
        const { data: existingEnrollment } = await supabaseClient
          .from('course_enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single();

        if (existingEnrollment) {
          return new Response(JSON.stringify({
            success: true,
            message: 'Already enrolled',
            enrollment_id: existingEnrollment.id
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          });
        }

        // Create enrollment
        const { data: enrollment, error: enrollmentError } = await supabaseClient
          .from('course_enrollments')
          .insert({
            user_id: user.id,
            course_id: courseId,
            progress_percentage: 0
          })
          .select()
          .single();

        if (enrollmentError) {
          throw new Error(`Failed to enroll: ${enrollmentError.message}`);
        }

        logStep("User enrolled successfully", { enrollmentId: enrollment.id });

        return new Response(JSON.stringify({
          success: true,
          enrollment: enrollment
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
      }

      case 'update_progress': {
        const { lessonId, courseId, completed, watchTime } = requestData;

        // Update lesson progress
        const { data: progress, error: progressError } = await supabaseClient
          .from('lesson_progress')
          .upsert({
            user_id: user.id,
            lesson_id: lessonId,
            course_id: courseId,
            is_completed: completed,
            watch_time_seconds: watchTime || 0,
            completed_at: completed ? new Date().toISOString() : null
          })
          .select()
          .single();

        if (progressError) {
          throw new Error(`Failed to update progress: ${progressError.message}`);
        }

        // Calculate overall course progress
        const { data: totalLessons } = await supabaseClient
          .from('lessons')
          .select('id')
          .eq('course_id', courseId);

        const { data: completedLessons } = await supabaseClient
          .from('lesson_progress')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .eq('is_completed', true);

        const progressPercentage = totalLessons && totalLessons.length > 0 
          ? Math.round(((completedLessons?.length || 0) / totalLessons.length) * 100)
          : 0;

        // Update course enrollment progress
        await supabaseClient
          .from('course_enrollments')
          .update({
            progress_percentage: progressPercentage
          })
          .eq('user_id', user.id)
          .eq('course_id', courseId);

        logStep("Progress updated", { lessonId, progressPercentage });

        return new Response(JSON.stringify({
          success: true,
          progress: progress,
          course_progress_percentage: progressPercentage
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
      }

      case 'complete_course': {
        const { courseId } = requestData;

        // Use the existing completion function
        const { data: result, error: completionError } = await supabaseClient
          .rpc('complete_course_with_exam', {
            course_id_param: courseId,
            user_id_param: user.id
          });

        if (completionError) {
          throw new Error(`Failed to complete course: ${completionError.message}`);
        }

        logStep("Course completion processed", result);

        return new Response(JSON.stringify({
          success: true,
          result: result
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
      }

      case 'get_dashboard': {
        // Get user dashboard data
        const { data: dashboardData, error: dashboardError } = await supabaseClient
          .rpc('get_user_dashboard', {
            target_user_id: user.id
          });

        if (dashboardError) {
          throw new Error(`Failed to get dashboard data: ${dashboardError.message}`);
        }

        // Get recent notifications
        const { data: notifications, error: notificationsError } = await supabaseClient
          .rpc('get_user_notifications', {
            target_user_id: user.id,
            limit_count: 5,
            include_read: false
          });

        logStep("Dashboard data retrieved", { 
          dashboard: dashboardData, 
          notificationCount: notifications?.length || 0 
        });

        return new Response(JSON.stringify({
          success: true,
          dashboard: dashboardData,
          recent_notifications: notifications || []
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in course-management", { message: errorMessage });
    
    return new Response(JSON.stringify({
      error: errorMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
