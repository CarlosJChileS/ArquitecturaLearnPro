import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[LESSON-PROGRESS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization") ?? "" },
      },
    }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { lesson_id, course_id, watch_time_seconds, is_completed } = await req.json();
    
    if (!lesson_id || !course_id) {
      throw new Error("lesson_id and course_id are required");
    }
    logStep("Request data received", { lessonId: lesson_id, courseId: course_id, watchTime: watch_time_seconds, completed: is_completed });

    // Check if user is enrolled in the course
    const { data: enrollment } = await supabaseClient
      .from('course_enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', course_id)
      .single();

    if (!enrollment) {
      throw new Error("User not enrolled in this course");
    }
    logStep("Enrollment verified");

    // Upsert lesson progress
    const progressData = {
      user_id: user.id,
      lesson_id,
      course_id,
      watch_time_seconds: watch_time_seconds || 0,
      is_completed: is_completed || false,
      updated_at: new Date().toISOString(),
      ...(is_completed && { completed_at: new Date().toISOString() })
    };

    const { data: progress, error: progressError } = await supabaseClient
      .from('lesson_progress')
      .upsert(progressData, {
        onConflict: 'user_id,lesson_id,course_id'
      })
      .select()
      .single();

    if (progressError) {
      throw new Error(`Failed to update progress: ${progressError.message}`);
    }
    logStep("Progress updated", { progressId: progress.id });

    // Calculate course progress
    const { data: totalLessons } = await supabaseClient
      .from('lessons')
      .select('id')
      .eq('course_id', course_id);

    const { data: completedLessons } = await supabaseClient
      .from('lesson_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', course_id)
      .eq('is_completed', true);

    const courseProgress = totalLessons && totalLessons.length > 0 
      ? Math.round((completedLessons?.length || 0) / totalLessons.length * 100)
      : 0;

    logStep("Course progress calculated", { totalLessons: totalLessons?.length, completedLessons: completedLessons?.length, progress: courseProgress });

    // Update course enrollment progress
    const { error: enrollmentError } = await supabaseClient
      .from('course_enrollments')
      .update({
        progress_percentage: courseProgress,
        ...(courseProgress === 100 && { completed_at: new Date().toISOString() })
      })
      .eq('user_id', user.id)
      .eq('course_id', course_id);

    if (enrollmentError) {
      console.error("Failed to update enrollment progress:", enrollmentError);
    } else {
      logStep("Enrollment progress updated");
    }

    return new Response(JSON.stringify({
      success: true,
      lesson_progress: progress,
      course_progress: courseProgress,
      message: "Progress updated successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in lesson-progress", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});