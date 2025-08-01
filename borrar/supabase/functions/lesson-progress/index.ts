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

    // Use optimized SQL function for lesson progress update
    const { data: progressResult, error: progressError } = await supabaseClient
      .rpc('update_lesson_progress', {
        user_id_param: user.id,
        lesson_id_param: lesson_id,
        course_id_param: course_id,
        is_completed_param: is_completed || false,
        watch_time_seconds_param: watch_time_seconds || 0
      });

    if (progressError) {
      throw new Error(`Failed to update progress: ${progressError.message}`);
    }
    logStep("Progress updated using SQL function", progressResult);

    // Track student event for analytics
    const { error: trackingError } = await supabaseClient
      .rpc('track_student_event', {
        user_id_param: user.id,
        event_type_param: is_completed ? 'lesson_completed' : 'lesson_progress_updated',
        event_data_param: {
          course_id: course_id,
          lesson_id: lesson_id,
          watch_time_seconds: watch_time_seconds || 0,
          is_completed: is_completed || false
        }
      });

    if (trackingError) {
      console.warn("Failed to track student event:", trackingError);
    } else {
      logStep("Student event tracked");
    }

    return new Response(JSON.stringify({
      success: true,
      lesson_progress: progressResult,
      course_progress: progressResult?.course_progress_percentage || 0,
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