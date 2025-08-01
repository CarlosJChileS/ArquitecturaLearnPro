import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-COURSE-ANALYTICS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        persistSession: false,
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

    const requestData = await req.json();
    logStep("Analytics request received", requestData);

    // Verify user permissions
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isInstructor = profile?.role === 'instructor';
    const isAdmin = profile?.role === 'admin';

    if (!isInstructor && !isAdmin) {
      throw new Error("Unauthorized: Only instructors and admins can access analytics");
    }

    // Build time filter
    const timeFilter = buildTimeFilter(requestData.timeRange);
    logStep("Time filter applied", { timeRange: requestData.timeRange, filter: timeFilter });

    let analytics = {};

    if (requestData.courseId) {
      // Single course analytics
      analytics = await generateCourseAnalytics(
        supabaseClient, 
        requestData.courseId, 
        user.id, 
        isAdmin, 
        timeFilter, 
        requestData.includeDetails
      );
    } else if (requestData.instructorId || isInstructor) {
      // Instructor analytics
      const instructorId = requestData.instructorId || user.id;
      analytics = await generateInstructorAnalytics(
        supabaseClient, 
        instructorId, 
        user.id, 
        isAdmin, 
        timeFilter, 
        requestData.includeDetails
      );
    } else if (isAdmin) {
      // Platform-wide analytics
      analytics = await generatePlatformAnalytics(
        supabaseClient, 
        timeFilter, 
        requestData.includeDetails
      );
    }

    logStep("Analytics generated successfully", { type: 'summary' });

    return new Response(JSON.stringify(analytics), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    logStep("ERROR in generate-course-analytics", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

function buildTimeFilter(timeRange: string): string {
  switch (timeRange) {
    case 'week':
      return "AND created_at >= now() - interval '7 days'";
    case 'month':
      return "AND created_at >= now() - interval '30 days'";
    case 'quarter':
      return "AND created_at >= now() - interval '90 days'";
    case 'year':
      return "AND created_at >= now() - interval '365 days'";
    default:
      return "";
  }
}

async function generateCourseAnalytics(
  supabaseClient: any, 
  courseId: string, 
  userId: string, 
  isAdmin: boolean, 
  timeFilter: string, 
  includeDetails: boolean
) {
  // Verify access to this course
  if (!isAdmin) {
    const { data: course } = await supabaseClient
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single();

    if (!course || course.instructor_id !== userId) {
      throw new Error("Unauthorized: You can only view analytics for your own courses");
    }
  }

  // Basic course info
  const { data: courseInfo } = await supabaseClient
    .from('courses')
    .select('title, created_at, is_published, price')
    .eq('id', courseId)
    .single();

  // Enrollment statistics
  const { data: enrollmentStats } = await supabaseClient
    .from('course_enrollments')
    .select('id, enrolled_at, completed_at, progress_percentage')
    .eq('course_id', courseId);

  const totalEnrollments = enrollmentStats?.length || 0;
  const completedEnrollments = enrollmentStats?.filter(e => e.completed_at)?.length || 0;
  const averageProgress = enrollmentStats?.length 
    ? enrollmentStats.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / enrollmentStats.length 
    : 0;

  // Reviews and ratings
  const { data: reviewStats } = await supabaseClient
    .from('course_reviews')
    .select('rating, created_at')
    .eq('course_id', courseId)
    .eq('is_published', true);

  const averageRating = reviewStats?.length 
    ? reviewStats.reduce((sum, r) => sum + r.rating, 0) / reviewStats.length 
    : 0;

  // Revenue calculation
  const revenue = courseInfo?.price ? courseInfo.price * completedEnrollments : 0;

  const analytics = {
    course: {
      id: courseId,
      title: courseInfo?.title,
      published: courseInfo?.is_published,
      price: courseInfo?.price,
      created_at: courseInfo?.created_at
    },
    enrollments: {
      total: totalEnrollments,
      completed: completedEnrollments,
      completion_rate: totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0,
      average_progress: Math.round(averageProgress * 100) / 100
    },
    reviews: {
      total_reviews: reviewStats?.length || 0,
      average_rating: Math.round(averageRating * 100) / 100
    },
    revenue: {
      total: revenue,
      per_completion: courseInfo?.price || 0
    }
  };

  if (includeDetails) {
    analytics.details = {
      enrollment_timeline: await getEnrollmentTimeline(supabaseClient, courseId, timeFilter),
      student_progress_distribution: await getProgressDistribution(supabaseClient, courseId)
    };
  }

  return analytics;
}

async function generateInstructorAnalytics(
  supabaseClient: any, 
  instructorId: string, 
  requestingUserId: string, 
  isAdmin: boolean, 
  timeFilter: string, 
  includeDetails: boolean
) {
  if (!isAdmin && instructorId !== requestingUserId) {
    throw new Error("Unauthorized: You can only view your own instructor analytics");
  }

  // Get instructor's courses
  const { data: courses } = await supabaseClient
    .from('courses')
    .select('id, title, created_at, is_published, price')
    .eq('instructor_id', instructorId);

  const courseIds = courses?.map(c => c.id) || [];

  if (courseIds.length === 0) {
    return {
      instructor_id: instructorId,
      courses: { total: 0, published: 0 },
      enrollments: { total: 0 },
      revenue: { total: 0 },
      message: "No courses found for this instructor"
    };
  }

  // Get all enrollments for instructor's courses
  const { data: allEnrollments } = await supabaseClient
    .from('course_enrollments')
    .select('course_id, enrolled_at, completed_at, progress_percentage')
    .in('course_id', courseIds);

  const totalEnrollments = allEnrollments?.length || 0;
  const totalCompletions = allEnrollments?.filter(e => e.completed_at)?.length || 0;

  // Calculate total revenue
  const totalRevenue = courses.reduce((sum, course) => {
    const courseCompletions = allEnrollments?.filter(e => 
      e.course_id === course.id && e.completed_at
    )?.length || 0;
    return sum + (course.price || 0) * courseCompletions;
  }, 0);

  return {
    instructor_id: instructorId,
    courses: {
      total: courses.length,
      published: courses.filter(c => c.is_published).length,
      draft: courses.length - courses.filter(c => c.is_published).length
    },
    enrollments: {
      total: totalEnrollments,
      completed: totalCompletions,
      completion_rate: totalEnrollments > 0 ? (totalCompletions / totalEnrollments) * 100 : 0
    },
    revenue: {
      total: totalRevenue,
      average_per_course: courses.length > 0 ? totalRevenue / courses.length : 0
    }
  };
}

async function generatePlatformAnalytics(
  supabaseClient: any, 
  timeFilter: string, 
  includeDetails: boolean
) {
  // Platform-wide statistics
  const { data: totalCourses } = await supabaseClient
    .from('courses')
    .select('id', { count: 'exact' });

  const { data: totalUsers } = await supabaseClient
    .from('profiles')
    .select('id', { count: 'exact' });

  const { data: totalEnrollments } = await supabaseClient
    .from('course_enrollments')
    .select('id', { count: 'exact' });

  return {
    platform: {
      total_courses: totalCourses?.length || 0,
      total_users: totalUsers?.length || 0,
      total_enrollments: totalEnrollments?.length || 0
    }
  };
}

// Helper functions
async function getEnrollmentTimeline(supabaseClient: any, courseId: string, timeFilter: string) {
  return [];
}

async function getProgressDistribution(supabaseClient: any, courseId: string) {
  return {};
}
