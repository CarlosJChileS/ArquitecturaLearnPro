import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
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
    if (!authHeader) throw new Error("Authorization required");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    console.log(`[DASHBOARD-STATS] Getting stats for user ${user.id}`);

    // Get user's enrollments and progress
    const { data: enrollments, error: enrollmentsError } = await supabaseClient
      .from("course_enrollments")
      .select(`
        *,
        courses (
          id,
          title,
          thumbnail_url,
          duration_hours,
          instructor_id,
          profiles!courses_instructor_id_fkey (full_name)
        )
      `)
      .eq("user_id", user.id);

    if (enrollmentsError) throw enrollmentsError;

    // Get lesson progress for enrolled courses
    const courseIds = enrollments?.map(e => e.course_id) || [];
    const { data: lessonsProgress, error: progressError } = await supabaseClient
      .from("lesson_progress")
      .select("*")
      .eq("user_id", user.id)
      .in("course_id", courseIds);

    if (progressError) throw progressError;

    // Get certificates
    const { data: certificates, error: certificatesError } = await supabaseClient
      .from("certificates")
      .select(`
        *,
        courses (title, thumbnail_url)
      `)
      .eq("user_id", user.id);

    if (certificatesError) throw certificatesError;

    // Get recent exam attempts
    const { data: examAttempts, error: examError } = await supabaseClient
      .from("exam_attempts")
      .select(`
        *,
        exams (
          title,
          courses (title)
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (examError) throw examError;

    // Calculate statistics
    const totalCourses = enrollments?.length || 0;
    const completedCourses = enrollments?.filter(e => e.completed_at).length || 0;
    const totalCertificates = certificates?.length || 0;
    const totalStudyHours = enrollments?.reduce((acc, enrollment) => {
      return acc + (enrollment.courses?.duration_hours || 0);
    }, 0) || 0;

    // Calculate overall progress
    const overallProgress = totalCourses > 0 
      ? enrollments?.reduce((acc, enrollment) => acc + (enrollment.progress_percentage || 0), 0) / totalCourses 
      : 0;

    // Get current month activity
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthlyProgress, error: monthlyError } = await supabaseClient
      .from("lesson_progress")
      .select("*")
      .eq("user_id", user.id)
      .gte("updated_at", startOfMonth.toISOString());

    if (monthlyError) throw monthlyError;

    const monthlyLessonsCompleted = monthlyProgress?.filter(p => p.is_completed).length || 0;

    // Prepare course progress details
    const courseProgress = enrollments?.map(enrollment => {
      const courseId = enrollment.course_id;
      const courseLessons = lessonsProgress?.filter(lp => lp.course_id === courseId) || [];
      const completedLessons = courseLessons.filter(lp => lp.is_completed).length;
      const totalLessons = courseLessons.length;

      return {
        courseId,
        courseName: enrollment.courses?.title,
        thumbnail: enrollment.courses?.thumbnail_url,
        instructor: enrollment.courses?.profiles?.full_name,
        progress: enrollment.progress_percentage || 0,
        completedLessons,
        totalLessons,
        enrolledAt: enrollment.enrolled_at,
        completedAt: enrollment.completed_at,
        lastActivity: courseLessons
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0]?.updated_at
      };
    }) || [];

    const stats = {
      summary: {
        totalCourses,
        completedCourses,
        totalCertificates,
        totalStudyHours: Math.round(totalStudyHours),
        overallProgress: Math.round(overallProgress),
        monthlyLessonsCompleted
      },
      courseProgress,
      certificates: certificates?.map(cert => ({
        id: cert.id,
        courseName: cert.courses?.title,
        courseImage: cert.courses?.thumbnail_url,
        certificateNumber: cert.certificate_number,
        issuedAt: cert.issued_at,
        score: cert.score
      })) || [],
      recentExams: examAttempts?.map(attempt => ({
        id: attempt.id,
        examTitle: attempt.exams?.title,
        courseName: attempt.exams?.courses?.title,
        score: attempt.score,
        maxScore: attempt.max_score,
        percentage: attempt.percentage,
        passed: attempt.passed,
        completedAt: attempt.completed_at
      })) || []
    };

    console.log(`[DASHBOARD-STATS] Stats calculated for user ${user.id}:`, {
      totalCourses,
      completedCourses,
      totalCertificates
    });

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[DASHBOARD-STATS] Error:", errorMessage);
    
    return new Response(JSON.stringify({
      error: errorMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
