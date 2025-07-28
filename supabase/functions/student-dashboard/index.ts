import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STUDENT-DASHBOARD] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Use anon key for authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError) throw new Error(`Authentication error: ${userError.message}`);

    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id });

    // Get dashboard data using the database function
    const { data: dashboardData, error: dashboardError } = await supabaseClient
      .rpc("get_user_dashboard", { target_user_id: user.id });

    if (dashboardError) {
      logStep("Error getting dashboard data", { error: dashboardError });
      throw new Error("Failed to get dashboard data");
    }

    // Get recent activity
    const recentActivity = await getRecentActivity(supabaseClient, user.id);

    // Get active courses with progress
    const activeCourses = await getActiveCourses(supabaseClient, user.id);

    // Get upcoming reminders
    const upcomingReminders = await getUpcomingReminders(supabaseClient, user.id);

    // Get recent notifications
    const recentNotifications = await getRecentNotifications(supabaseClient, user.id);

    // Get certificates
    const certificates = await getUserCertificates(supabaseClient, user.id);

    const response = {
      user_id: user.id,
      summary: dashboardData,
      recent_activity: recentActivity,
      active_courses: activeCourses,
      upcoming_reminders: upcomingReminders,
      recent_notifications: recentNotifications,
      certificates: certificates
    };

    logStep("Dashboard data compiled successfully", {
      userId: user.id,
      activeCourses: activeCourses.length,
      notifications: recentNotifications.length
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in student-dashboard", { message: errorMessage });

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});

async function getRecentActivity(supabase: any, userId: string) {
  logStep("Getting recent activity", { userId });

  const { data: activities, error } = await supabase
    .from("student_analytics")
    .select(`
      event_type,
      event_data,
      created_at,
      courses (
        title,
        thumbnail_url
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    logStep("Error getting recent activity", { error });
    return [];
  }

  return activities || [];
}

async function getActiveCourses(supabase: any, userId: string) {
  logStep("Getting active courses", { userId });

  const { data: enrollments, error } = await supabase
    .from("course_enrollments")
    .select(`
      progress_percentage,
      enrolled_at,
      completed_at,
      courses!inner (
        id,
        title,
        description,
        thumbnail_url,
        duration_hours,
        average_rating,
        instructor_id,
        profiles!courses_instructor_id_fkey (
          full_name
        )
      )
    `)
    .eq("user_id", userId)
    .is("completed_at", null)
    .order("enrolled_at", { ascending: false });

  if (error) {
    logStep("Error getting active courses", { error });
    return [];
  }

  // Get next lesson for each course
  const coursesWithNextLesson = await Promise.all(
    (enrollments || []).map(async (enrollment: any) => {
      const nextLesson = await getNextLesson(supabase, enrollment.courses.id, userId);
      return {
        ...enrollment,
        next_lesson: nextLesson
      };
    })
  );

  return coursesWithNextLesson;
}

async function getNextLesson(supabase: any, courseId: string, userId: string) {
  // Get the next uncompleted lesson
  const { data: lessons, error } = await supabase
    .from("lessons")
    .select(`
      id,
      title,
      order_index,
      duration_minutes,
      lesson_progress!left (
        is_completed
      )
    `)
    .eq("course_id", courseId)
    .or(`lesson_progress.user_id.is.null,lesson_progress.user_id.eq.${userId}`)
    .order("order_index", { ascending: true });

  if (error || !lessons) return null;

  // Find first uncompleted lesson
  const nextLesson = lessons.find((lesson: any) => {
    const progress = lesson.lesson_progress.find((p: any) => p.user_id === userId);
    return !progress || !progress.is_completed;
  });

  return nextLesson ? {
    id: nextLesson.id,
    title: nextLesson.title,
    order_index: nextLesson.order_index,
    duration_minutes: nextLesson.duration_minutes
  } : null;
}

async function getUpcomingReminders(supabase: any, userId: string) {
  logStep("Getting upcoming reminders", { userId });

  const { data: reminders, error } = await supabase
    .from("reminders")
    .select(`
      id,
      title,
      message,
      scheduled_for,
      reminder_type,
      courses (
        title
      )
    `)
    .eq("user_id", userId)
    .eq("is_active", true)
    .is("sent_at", null)
    .gte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(5);

  if (error) {
    logStep("Error getting upcoming reminders", { error });
    return [];
  }

  return reminders || [];
}

async function getRecentNotifications(supabase: any, userId: string) {
  logStep("Getting recent notifications", { userId });

  const { data: notifications, error } = await supabase
    .rpc("get_user_notifications", {
      target_user_id: userId,
      limit_count: 5,
      offset_count: 0,
      include_read: true
    });

  if (error) {
    logStep("Error getting recent notifications", { error });
    return [];
  }

  return notifications || [];
}

async function getUserCertificates(supabase: any, userId: string) {
  logStep("Getting user certificates", { userId });

  const { data: certificates, error } = await supabase
    .from("certificates")
    .select(`
      id,
      certificate_number,
      score,
      issued_at,
      courses!inner (
        title,
        thumbnail_url
      )
    `)
    .eq("user_id", userId)
    .order("issued_at", { ascending: false });

  if (error) {
    logStep("Error getting certificates", { error });
    return [];
  }

  return certificates || [];
}
