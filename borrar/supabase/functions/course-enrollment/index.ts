import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[COURSE-ENROLLMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  // Create service role client for database operations that bypass RLS
  const supabaseServiceClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
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

    const requestBody = await req.json();
    const course_id = requestBody.course_id || requestBody.courseId;
    if (!course_id) throw new Error("course_id is required");
    logStep("Course ID received", { courseId: course_id });

    // Check if course exists and is published
    const { data: course, error: courseError } = await supabaseServiceClient
      .from('courses')
      .select('id, title, price, is_published')
      .eq('id', course_id)
      .eq('is_published', true)
      .single();

    if (courseError || !course) {
      throw new Error("Course not found or not published");
    }
    logStep("Course found", { courseTitle: course.title, price: course.price });

    // Check if user is already enrolled
    const { data: existingEnrollment } = await supabaseServiceClient
      .from('course_enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', course_id)
      .single();

    if (existingEnrollment) {
      logStep("User already enrolled");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Already enrolled in this course" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // For paid courses, check if user has active subscription
    if (course.price && course.price > 0) {
      const { data: subscription } = await supabaseServiceClient
        .from('subscribers')
        .select('subscribed, subscription_end')
        .eq('user_id', user.id)
        .eq('subscribed', true)
        .single();

      if (!subscription || new Date(subscription.subscription_end) < new Date()) {
        throw new Error("Active subscription required for paid courses");
      }
      logStep("Subscription verified");
    }

    // Create enrollment using service role client to bypass RLS
    const { data: enrollment, error: enrollmentError } = await supabaseServiceClient
      .from('course_enrollments')
      .insert({
        user_id: user.id,
        course_id: course_id,
        enrolled_at: new Date().toISOString(),
        progress_percentage: 0
      })
      .select()
      .single();

    if (enrollmentError) {
      logStep("Enrollment error details", { 
        error: enrollmentError,
        message: enrollmentError.message,
        code: enrollmentError.code,
        details: enrollmentError.details 
      });
      
      throw new Error(`Failed to create enrollment: ${enrollmentError.message}`);
    }

    logStep("Enrollment created successfully", { enrollmentId: enrollment.id });

    // Track student enrollment event for analytics
    const { error: trackingError } = await supabaseServiceClient
      .rpc('track_student_event', {
        user_id_param: user.id,
        event_type_param: 'course_enrolled',
        event_data_param: {
          course_id: course_id,
          course_title: course.title,
          course_price: course.price,
          enrollment_id: enrollment.id
        }
      });

    if (trackingError) {
      console.warn("Failed to track enrollment event:", trackingError);
    } else {
      logStep("Enrollment event tracked");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      enrollment_id: enrollment.id,
      message: "Successfully enrolled in course" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in course-enrollment", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});