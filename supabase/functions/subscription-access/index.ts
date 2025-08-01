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

    const { userId, courseId } = await req.json();

    if (!userId || !courseId) {
      return new Response(JSON.stringify({ 
        hasAccess: false,
        error: 'userId and courseId are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Verificar suscripción activa del usuario
    const { data: subscription, error: subError } = await supabaseClient
      .from('subscriptions')
      .select(`
        id,
        status,
        start_date,
        end_date,
        subscription_plans (
          id,
          name,
          features
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())
      .single();

    if (subError || !subscription) {
      return new Response(JSON.stringify({ 
        hasAccess: false,
        reason: 'No active subscription found',
        requiresUpgrade: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Obtener información del curso
    const { data: course, error: courseError } = await supabaseClient
      .from('courses')
      .select('id, title, subscription_tier, is_published')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return new Response(JSON.stringify({ 
        hasAccess: false,
        reason: 'Course not found'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!course.is_published) {
      return new Response(JSON.stringify({ 
        hasAccess: false,
        reason: 'Course not published'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Verificar nivel de acceso según plan
    const planName = subscription.subscription_plans?.name.toLowerCase() || '';
    const courseTier = course.subscription_tier || 'basic';
    
    let hasAccess = false;
    
    // Lógica de control de acceso por niveles
    if (courseTier === 'free') {
      hasAccess = true; // Cursos gratuitos siempre accesibles
    } else if (courseTier === 'basic') {
      hasAccess = planName.includes('básico') || planName.includes('premium') || planName.includes('anual');
    } else if (courseTier === 'premium') {
      hasAccess = planName.includes('premium') || planName.includes('anual');
    }

    // 4. Registrar o actualizar enrollment si tiene acceso
    if (hasAccess) {
      const { error: enrollError } = await supabaseClient
        .from('course_enrollments')
        .upsert({
          user_id: userId,
          course_id: courseId,
          status: 'active',
          enrolled_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,course_id'
        });

      if (enrollError) {
        console.error('Error creating enrollment:', enrollError);
      }
    }

    return new Response(JSON.stringify({ 
      hasAccess,
      subscription: {
        planName: subscription.subscription_plans?.name,
        status: subscription.status,
        expiresAt: subscription.end_date
      },
      course: {
        title: course.title,
        tier: courseTier
      },
      reason: hasAccess ? 'Access granted' : `Plan ${planName} doesn't include ${courseTier} courses`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in subscription-access:', error);
    return new Response(JSON.stringify({ 
      hasAccess: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
