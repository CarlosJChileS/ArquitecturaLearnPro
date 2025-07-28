import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[COURSE-ANALYTICS] ${step}${detailsStr}`);
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

    const url = new URL(req.url);
    const courseId = url.searchParams.get("course_id");
    const action = url.searchParams.get("action") || "overview";

    if (!courseId) {
      throw new Error("course_id parameter is required");
    }

    // Verify user is instructor of this course
    const { data: course, error: courseError } = await supabaseClient
      .from("courses")
      .select("instructor_id, title")
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      throw new Error("Course not found");
    }

    if (course.instructor_id !== user.id) {
      throw new Error("Unauthorized: You are not the instructor of this course");
    }

    logStep("User authorized for course analytics", {
      courseId,
      instructorId: user.id,
      courseTitle: course.title
    });

    let analytics;

    switch (action) {
      case "overview":
        analytics = await getCourseOverview(supabaseClient, courseId);
        break;
      case "students":
        analytics = await getStudentAnalytics(supabaseClient, courseId);
        break;
      case "progress":
        analytics = await getProgressAnalytics(supabaseClient, courseId);
        break;
      case "engagement":
        analytics = await getEngagementAnalytics(supabaseClient, courseId);
        break;
      default:
        throw new Error("Invalid action parameter");
    }

    return new Response(JSON.stringify({
      course_id: courseId,
      course_title: course.title,
      action,
      data: analytics
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in course-analytics", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

async function getCourseOverview(supabase: any, courseId: string) {
  logStep("Getting course overview", { courseId });

  // Get basic course metrics
  const [enrollmentsResult, completionsResult, avgProgressResult, reviewsResult] = await Promise.all([
    // Total enrollments
    supabase.from("course_enrollments").select("id", { count: "exact" }).eq("course_id", courseId),
    // Total completions
    supabase.from("course_enrollments").select("id", { count: "exact" }).eq("course_id", courseId).not("completed_at", "is", null),
    // Average progress
    supabase.from("course_enrollments").select("progress_percentage").eq("course_id", courseId),
    // Reviews
    supabase.from("course_reviews").select("rating").eq("course_id", courseId).eq("is_published", true)
  ]);

  const totalEnrollments = enrollmentsResult.count || 0;
  const totalCompletions = completionsResult.count || 0;
  const completionRate = totalEnrollments > 0 ? (totalCompletions / totalEnrollments) * 100 : 0;

  const progressData = avgProgressResult.data || [];
  const avgProgress = progressData.length > 0 
    ? progressData.reduce((sum, item) => sum + (item.progress_percentage || 0), 0) / progressData.length 
    : 0;

  const reviewsData = reviewsResult.data || [];
  const avgRating = reviewsData.length > 0 
    ? reviewsData.reduce((sum, item) => sum + item.rating, 0) / reviewsData.length 
    : 0;

  return {
    total_enrollments: totalEnrollments,
    total_completions: totalCompletions,
    completion_rate: Math.round(completionRate * 100) / 100,
    average_progress: Math.round(avgProgress * 100) / 100,
    average_rating: Math.round(avgRating * 100) / 100,
    total_reviews: reviewsData.length
  };
}

async function getStudentAnalytics(supabase: any, courseId: string) {
  logStep("Getting student analytics", { courseId });

  // Get enrolled students with their progress
  const { data: students, error } = await supabase
    .from("course_enrollments")
    .select(`
      enrolled_at,
      progress_percentage,
      completed_at,
      profiles!inner (
        full_name,
        email
      )
    `)
    .eq("course_id", courseId)
    .order("enrolled_at", { ascending: false });

  if (error) throw error;

  // Group by enrollment date for chart data
  const enrollmentsByDate: Record<string, number> = {};
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  students.forEach((student) => {
    const enrollDate = new Date(student.enrolled_at);
    if (enrollDate >= thirtyDaysAgo) {
      const dateKey = enrollDate.toISOString().split('T')[0];
      enrollmentsByDate[dateKey] = (enrollmentsByDate[dateKey] || 0) + 1;
    }
  });

  return {
    recent_students: students.slice(0, 10),
    enrollments_by_date: enrollmentsByDate,
    active_students_last_30_days: Object.values(enrollmentsByDate).reduce((a, b) => a + b, 0)
  };
}

async function getProgressAnalytics(supabase: any, courseId: string) {
  logStep("Getting progress analytics", { courseId });

  // Get progress distribution
  const { data: progressData, error } = await supabase
    .from("course_enrollments")
    .select("progress_percentage")
    .eq("course_id", courseId);

  if (error) throw error;

  // Create progress buckets
  const progressBuckets = {
    "0-25%": 0,
    "26-50%": 0,
    "51-75%": 0,
    "76-100%": 0
  };

  progressData.forEach((item) => {
    const progress = item.progress_percentage || 0;
    if (progress <= 25) progressBuckets["0-25%"]++;
    else if (progress <= 50) progressBuckets["26-50%"]++;
    else if (progress <= 75) progressBuckets["51-75%"]++;
    else progressBuckets["76-100%"]++;
  });

  // Get lesson completion rates
  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select(`
      id,
      title,
      order_index,
      lesson_progress!inner (
        is_completed
      )
    `)
    .eq("course_id", courseId)
    .order("order_index");

  if (lessonsError) throw lessonsError;

  const lessonCompletionRates = lessons.map((lesson) => {
    const totalProgress = lesson.lesson_progress.length;
    const completed = lesson.lesson_progress.filter((p: any) => p.is_completed).length;
    const completionRate = totalProgress > 0 ? (completed / totalProgress) * 100 : 0;

    return {
      lesson_id: lesson.id,
      lesson_title: lesson.title,
      order_index: lesson.order_index,
      completion_rate: Math.round(completionRate * 100) / 100
    };
  });

  return {
    progress_distribution: progressBuckets,
    lesson_completion_rates: lessonCompletionRates
  };
}

async function getEngagementAnalytics(supabase: any, courseId: string) {
  logStep("Getting engagement analytics", { courseId });

  // Get total watch time and engagement events
  const [watchTimeResult, eventsResult, commentsResult] = await Promise.all([
    // Total watch time
    supabase.from("lesson_progress").select("watch_time_seconds").eq("course_id", courseId),
    // Recent analytics events
    supabase.from("student_analytics").select("event_type, created_at")
      .eq("course_id", courseId)
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false }),
    // Course reviews as engagement indicator
    supabase.from("course_reviews").select("rating, review_text, created_at")
      .eq("course_id", courseId)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(5)
  ]);

  const totalWatchTime = watchTimeResult.data?.reduce((sum: number, item: any) => 
    sum + (item.watch_time_seconds || 0), 0) || 0;
  const totalWatchHours = Math.round(totalWatchTime / 3600 * 100) / 100;

  // Group events by type
  const eventsByType: Record<string, number> = {};
  eventsResult.data?.forEach((event: any) => {
    eventsByType[event.event_type] = (eventsByType[event.event_type] || 0) + 1;
  });

  return {
    total_watch_hours: totalWatchHours,
    recent_events_by_type: eventsByType,
    recent_reviews: commentsResult.data || [],
    engagement_score: calculateEngagementScore(eventsByType, totalWatchHours)
  };
}

function calculateEngagementScore(events: Record<string, number>, watchHours: number): number {
  // Simple engagement score calculation
  const lessonCompletions = events["lesson_completed"] || 0;
  const courseStarts = events["course_started"] || 0;

  let score = 0;
  score += lessonCompletions * 10; // 10 points per lesson completion
  score += courseStarts * 5; // 5 points per course start
  score += Math.min(watchHours * 2, 100); // Up to 100 points for watch time

  return Math.min(Math.round(score), 100); // Cap at 100
}
