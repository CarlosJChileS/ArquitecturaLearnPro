import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[INSTRUCTOR-ANALYTICS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    // Verify user is instructor
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'instructor' && profile?.role !== 'admin') {
      throw new Error("Unauthorized: Only instructors can access analytics");
    }

    const { courseId, period = 'month' } = await req.json();

    logStep("Generating analytics for instructor", { 
      instructorId: user.id, 
      courseId, 
      period 
    });

    let analytics;

    if (courseId) {
      // Single course analytics
      analytics = await getCourseAnalytics(supabaseClient, user.id, courseId, period);
    } else {
      // General instructor analytics
      analytics = await getInstructorAnalytics(supabaseClient, user.id, period);
    }

    return new Response(JSON.stringify(analytics), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    logStep("ERROR in instructor-analytics", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

async function getCourseAnalytics(supabaseClient: any, instructorId: string, courseId: string, period: string) {
  const periodDays = getPeriodDays(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  // Verify instructor owns this course
  const { data: course } = await supabaseClient
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .eq('instructor_id', instructorId)
    .single();

  if (!course) {
    throw new Error("Course not found or not owned by instructor");
  }

  // Get enrollment statistics
  const { data: enrollments } = await supabaseClient
    .from('course_enrollments')
    .select(`
      *,
      profiles (full_name, email)
    `)
    .eq('course_id', courseId);

  const totalEnrollments = enrollments?.length || 0;
  const completedEnrollments = enrollments?.filter(e => e.completed_at)?.length || 0;
  const recentEnrollments = enrollments?.filter(e => 
    new Date(e.enrolled_at) >= startDate
  )?.length || 0;

  // Calculate average progress
  const averageProgress = enrollments?.length 
    ? enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / enrollments.length 
    : 0;

  // Get lesson analytics
  const { data: lessonProgress } = await supabaseClient
    .from('lesson_progress')
    .select(`
      lesson_id,
      lessons (title),
      is_completed,
      watch_time_seconds
    `)
    .eq('course_id', courseId)
    .gte('created_at', startDate.toISOString());

  // Calculate lesson completion rates
  const lessonStats = lessonProgress?.reduce((acc: any, item: any) => {
    const lessonId = item.lesson_id;
    if (!acc[lessonId]) {
      acc[lessonId] = {
        title: item.lessons?.title,
        totalViews: 0,
        completions: 0,
        totalWatchTime: 0
      };
    }
    acc[lessonId].totalViews++;
    if (item.is_completed) acc[lessonId].completions++;
    acc[lessonId].totalWatchTime += item.watch_time_seconds || 0;
    return acc;
  }, {});

  // Get course reviews
  const { data: reviews } = await supabaseClient
    .from('course_reviews')
    .select('rating, review_text, created_at')
    .eq('course_id', courseId)
    .eq('is_published', true);

  const averageRating = reviews?.length 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  // Get exam analytics if course has exams
  let examAnalytics = null;
  if (course.has_final_exam) {
    const { data: examAttempts } = await supabaseClient
      .from('exam_attempts')
      .select(`
        *,
        exams!inner (course_id)
      `)
      .eq('exams.course_id', courseId)
      .gte('created_at', startDate.toISOString());

    if (examAttempts && examAttempts.length > 0) {
      const totalAttempts = examAttempts.length;
      const passedAttempts = examAttempts.filter(a => a.passed).length;
      const averageScore = examAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts || 0;

      examAnalytics = {
        totalAttempts,
        passedAttempts,
        passRate: totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0,
        averageScore: Math.round(averageScore * 100) / 100
      };
    }
  }

  return {
    course: {
      id: course.id,
      title: course.title,
      description: course.description
    },
    period,
    enrollments: {
      total: totalEnrollments,
      completed: completedEnrollments,
      recent: recentEnrollments,
      completion_rate: totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0,
      students: enrollments?.slice(0, 10) || []
    },
    progress: {
      average_progress: Math.round(averageProgress * 100) / 100
    },
    lessons: {
      stats: Object.values(lessonStats || {}),
      total_lessons: Object.keys(lessonStats || {}).length
    },
    reviews: {
      total: reviews?.length || 0,
      average_rating: Math.round(averageRating * 100) / 100,
      recent: reviews?.slice(0, 5) || []
    },
    exams: examAnalytics,
    generated_at: new Date().toISOString()
  };
}

async function getInstructorAnalytics(supabaseClient: any, instructorId: string, period: string) {
  const periodDays = getPeriodDays(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  // Get instructor's courses
  const { data: courses } = await supabaseClient
    .from('courses')
    .select(`
      id,
      title,
      is_published,
      created_at,
      price
    `)
    .eq('instructor_id', instructorId)
    .order('created_at', { ascending: false });

  const totalCourses = courses?.length || 0;
  const publishedCourses = courses?.filter(c => c.is_published)?.length || 0;

  // Get all enrollments for instructor's courses
  const courseIds = courses?.map(c => c.id) || [];
  let totalEnrollments = 0;
  let totalCompletions = 0;
  let totalRevenue = 0;

  if (courseIds.length > 0) {
    const { data: allEnrollments } = await supabaseClient
      .from('course_enrollments')
      .select('course_id, enrolled_at, completed_at')
      .in('course_id', courseIds);

    totalEnrollments = allEnrollments?.length || 0;
    totalCompletions = allEnrollments?.filter(e => e.completed_at)?.length || 0;

    // Calculate revenue
    totalRevenue = courses?.reduce((sum, course) => {
      const courseCompletions = allEnrollments?.filter(e => 
        e.course_id === course.id && e.completed_at
      )?.length || 0;
      return sum + (course.price || 0) * courseCompletions;
    }, 0) || 0;

    // Get recent activity
    const { data: recentEnrollments } = await supabaseClient
      .from('course_enrollments')
      .select(`
        *,
        courses!inner (title, instructor_id),
        profiles (full_name, email)
      `)
      .eq('courses.instructor_id', instructorId)
      .gte('enrolled_at', startDate.toISOString())
      .order('enrolled_at', { ascending: false })
      .limit(20);

    // Get recent reviews
    const { data: recentReviews } = await supabaseClient
      .from('course_reviews')
      .select(`
        *,
        courses!inner (title, instructor_id),
        profiles (full_name)
      `)
      .eq('courses.instructor_id', instructorId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate course performance
    const coursePerformance = courses?.map(course => {
      const courseEnrollments = allEnrollments?.filter(e => e.course_id === course.id)?.length || 0;
      const courseCompletions = allEnrollments?.filter(e => 
        e.course_id === course.id && e.completed_at
      )?.length || 0;

      return {
        id: course.id,
        title: course.title,
        published: course.is_published,
        enrollments: courseEnrollments,
        completions: courseCompletions,
        completion_rate: courseEnrollments > 0 ? (courseCompletions / courseEnrollments) * 100 : 0,
        revenue: (course.price || 0) * courseCompletions
      };
    }) || [];

    return {
      instructor: {
        id: instructorId,
        period
      },
      overview: {
        total_courses: totalCourses,
        published_courses: publishedCourses,
        total_enrollments: totalEnrollments,
        total_completions: totalCompletions,
        completion_rate: totalEnrollments > 0 ? (totalCompletions / totalEnrollments) * 100 : 0,
        total_revenue: totalRevenue
      },
      courses: {
        performance: coursePerformance
      },
      activity: {
        recent_enrollments: recentEnrollments || [],
        recent_reviews: recentReviews || []
      },
      generated_at: new Date().toISOString()
    };
  }

  return {
    instructor: {
      id: instructorId,
      period
    },
    overview: {
      total_courses: 0,
      published_courses: 0,
      total_enrollments: 0,
      total_completions: 0,
      completion_rate: 0,
      total_revenue: 0
    },
    message: "No courses found for this instructor"
  };
}

function getPeriodDays(period: string): number {
  switch (period) {
    case 'week':
      return 7;
    case 'month':
      return 30;
    case 'quarter':
      return 90;
    case 'year':
      return 365;
    default:
      return 30;
  }
}
