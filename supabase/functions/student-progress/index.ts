import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Obtener estadísticas generales del estudiante
    const [enrollmentsResult, progressResult, subscriptionResult] = await Promise.all([
      // Cursos inscritos
      supabaseClient
        .from('course_enrollments')
        .select(`
          id,
          enrolled_at,
          status,
          progress_percentage,
          completed_at,
          courses (
            id,
            title,
            description,
            thumbnail_url,
            instructor_id,
            profiles (full_name)
          )
        `)
        .eq('user_id', userId)
        .order('enrolled_at', { ascending: false }),

      // Progreso de lecciones
      supabaseClient
        .from('lesson_progress')
        .select(`
          id,
          lesson_id,
          course_id,
          completed,
          progress,
          watch_time_seconds,
          completed_at,
          last_accessed,
          lessons (
            id,
            title,
            duration_minutes
          ),
          courses (
            id,
            title
          )
        `)
        .eq('user_id', userId)
        .order('last_accessed', { ascending: false }),

      // Suscripción activa
      supabaseClient
        .from('subscriptions')
        .select(`
          id,
          status,  
          start_date,
          end_date,
          subscription_plans (
            id,
            name,
            price,
            duration_months,
            features
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()
    ]);

    const enrollments = enrollmentsResult.data || [];
    const lessonProgress = progressResult.data || [];
    const subscription = subscriptionResult.data;

    // 2. Calcular estadísticas
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.status === 'completed').length;
    const inProgressCourses = enrollments.filter(e => e.status === 'active' && e.progress_percentage > 0).length;
    
    const totalLessons = lessonProgress.length;
    const completedLessons = lessonProgress.filter(p => p.completed).length;
    const totalWatchTime = lessonProgress.reduce((sum, p) => sum + (p.watch_time_seconds || 0), 0);

    // 3. Cursos recientes y próximos a completar
    const recentCourses = enrollments.slice(0, 5);
    const nearCompletion = enrollments
      .filter(e => e.progress_percentage >= 70 && e.progress_percentage < 100)
      .sort((a, b) => b.progress_percentage - a.progress_percentage)
      .slice(0, 3);

    // 4. Actividad reciente
    const recentActivity = lessonProgress
      .filter(p => p.last_accessed)
      .sort((a, b) => new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime())
      .slice(0, 10)
      .map(p => ({
        type: 'lesson_progress',
        lessonTitle: p.lessons?.title,
        courseTitle: p.courses?.title,
        progress: p.progress,
        completed: p.completed,
        timestamp: p.last_accessed
      }));

    // 5. Metas y logros
    const achievements = [];
    if (completedCourses >= 1) achievements.push({ name: 'Primera graduación', description: 'Completaste tu primer curso' });
    if (completedCourses >= 5) achievements.push({ name: 'Estudiante dedicado', description: 'Completaste 5 cursos' });
    if (totalWatchTime >= 3600) achievements.push({ name: 'Una hora de estudio', description: 'Acumulaste 1 hora de tiempo de estudio' });
    if (totalWatchTime >= 36000) achievements.push({ name: 'Maratonista del aprendizaje', description: 'Acumulaste 10 horas de estudio' });

    // 6. Recomendaciones
    const recommendations = enrollments
      .filter(e => e.progress_percentage === 0)
      .slice(0, 3)
      .map(e => ({
        courseId: e.courses?.id,
        title: e.courses?.title,
        instructor: e.courses?.profiles?.full_name,
        reason: 'Inscrito pero no iniciado'
      }));

    return new Response(JSON.stringify({
      overview: {
        totalCourses,
        completedCourses,
        inProgressCourses,
        totalLessons,
        completedLessons,
        completionRate: totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0,
        totalWatchTimeHours: Math.round(totalWatchTime / 3600 * 10) / 10
      },
      subscription: subscription ? {
        planName: subscription.subscription_plans?.name,
        status: subscription.status,
        expiresAt: subscription.end_date,
        daysRemaining: Math.max(0, Math.ceil((new Date(subscription.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      } : null,
      enrollments: enrollments.map(e => ({
        id: e.id,
        courseId: e.courses?.id,
        title: e.courses?.title,
        instructor: e.courses?.profiles?.full_name,
        thumbnail: e.courses?.thumbnail_url,
        progress: e.progress_percentage,
        status: e.status,
        enrolledAt: e.enrolled_at,
        completedAt: e.completed_at
      })),
      recentCourses,
      nearCompletion,
      recentActivity,
      achievements,
      recommendations
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in student-dashboard:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
