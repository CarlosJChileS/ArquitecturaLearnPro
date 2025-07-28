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
    const token = authHeader!.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    const { courseId, startDate, endDate, instructorOnly } = await req.json();

    // Verificar rol del usuario
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      throw new Error("Perfil de usuario no encontrado");
    }

    let analytics = {};

    if (courseId) {
      // Analytics específicos de un curso
      const { data: courseAnalytics, error: courseError } = await supabaseClient
        .rpc('get_course_analytics', { target_course_id: courseId });

      if (courseError) {
        throw new Error(`Error obteniendo analytics del curso: ${courseError.message}`);
      }

      analytics = courseAnalytics;

      // Datos adicionales para instructores
      if (profile.role === 'instructor' || profile.role === 'admin') {
        // Obtener progreso de estudiantes
        const { data: studentProgress } = await supabaseClient
          .from('course_enrollments')
          .select(`
            user_id,
            progress_percentage,
            enrolled_at,
            completed_at,
            profiles:user_id (full_name, email)
          `)
          .eq('course_id', courseId);

        // Obtener eventos de analytics del curso
        let analyticsQuery = supabaseClient
          .from('student_analytics')
          .select('*')
          .eq('course_id', courseId);

        if (startDate) {
          analyticsQuery = analyticsQuery.gte('created_at', startDate);
        }
        if (endDate) {
          analyticsQuery = analyticsQuery.lte('created_at', endDate);
        }

        const { data: events } = await analyticsQuery;

        // Calcular métricas avanzadas
        const completionsByWeek: Record<string, number> = {};
        const enrollmentsByWeek: Record<string, number> = {};
        const watchTimeByLesson: Record<string, number> = {};

        events?.forEach(event => {
          const week = new Date(event.created_at).toISOString().split('T')[0];
          
          if (event.event_type === 'course_completed') {
            completionsByWeek[week] = (completionsByWeek[week] || 0) + 1;
          }
          if (event.event_type === 'course_started') {
            enrollmentsByWeek[week] = (enrollmentsByWeek[week] || 0) + 1;
          }
          if (event.event_type === 'lesson_completed' && event.event_data?.watch_time_seconds) {
            const lessonId = event.event_data.lesson_id;
            watchTimeByLesson[lessonId] = (watchTimeByLesson[lessonId] || 0) + 
              event.event_data.watch_time_seconds / 60; // en minutos
          }
        });

        analytics = {
          ...analytics,
          student_progress: studentProgress,
          completions_by_week: completionsByWeek,
          enrollments_by_week: enrollmentsByWeek,
          watch_time_by_lesson: watchTimeByLesson,
          total_events: events?.length || 0
        };
      }

    } else if (profile.role === 'instructor') {
      // Analytics generales del instructor
      const { data: instructorStats, error: statsError } = await supabaseClient
        .rpc('get_instructor_stats', { instructor_uuid: user.id });

      if (statsError) {
        throw new Error(`Error obteniendo estadísticas: ${statsError.message}`);
      }

      // Obtener cursos del instructor
      const { data: courses } = await supabaseClient
        .from('courses')
        .select(`
          id,
          title,
          created_at,
          is_published,
          average_rating,
          total_reviews,
          course_enrollments:course_enrollments (count)
        `)
        .eq('instructor_id', user.id);

      analytics = {
        ...instructorStats,
        courses: courses,
        total_courses_created: courses?.length || 0
      };

    } else if (profile.role === 'admin') {
      // Analytics globales para administradores
      const { data: globalStats } = await supabaseClient
        .from('profiles')
        .select('role');
      
      const { data: totalCourses } = await supabaseClient
        .from('courses')
        .select('count');
      
      const { data: totalEnrollments } = await supabaseClient
        .from('course_enrollments')
        .select('count');
      
      const { data: recentActivity } = await supabaseClient
        .from('student_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      const usersByRole = globalStats?.reduce((acc: Record<string, number>, user: any) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      analytics = {
        total_users: globalStats?.length || 0,
        users_by_role: usersByRole,
        total_courses: totalCourses?.[0]?.count || 0,
        total_enrollments: totalEnrollments?.[0]?.count || 0,
        recent_activity: recentActivity
      };

    } else {
      // Analytics del estudiante
      const { data: userDashboard, error: dashboardError } = await supabaseClient
        .rpc('get_user_dashboard', { target_user_id: user.id });

      if (dashboardError) {
        throw new Error(`Error obteniendo dashboard: ${dashboardError.message}`);
      }

      // Obtener progreso detallado
      const { data: enrollments } = await supabaseClient
        .from('course_enrollments')
        .select(`
          *,
          courses:course_id (title, instructor_id, profiles:instructor_id (full_name))
        `)
        .eq('user_id', user.id);

      // Obtener eventos recientes del usuario
      const { data: recentEvents } = await supabaseClient
        .from('student_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      analytics = {
        ...userDashboard,
        enrollments: enrollments,
        recent_activity: recentEvents
      };
    }

    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    console.error("Error en get-course-analytics:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
