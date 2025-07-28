import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
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

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verificar que el usuario es admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Access denied. Admin role required.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { method } = req;
    const url = new URL(req.url);
    const lessonId = url.searchParams.get('lessonId');
    const courseId = url.searchParams.get('courseId');

    switch (method) {
      case 'GET': {
        if (lessonId) {
          // Obtener lección específica
          const { data: lesson, error: lessonError } = await supabaseClient
            .from('lessons')
            .select('*')
            .eq('id', lessonId)
            .single();

          if (lessonError) {
            return new Response(JSON.stringify({ error: lessonError.message }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          return new Response(JSON.stringify(lesson), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });

        } else if (courseId) {
          // Obtener lecciones de un curso
          const { data: lessons, error: lessonsError } = await supabaseClient
            .from('lessons')
            .select('*')
            .eq('course_id', courseId)
            .order('order_index', { ascending: true });

          if (lessonsError) {
            return new Response(JSON.stringify({ error: lessonsError.message }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          return new Response(JSON.stringify(lessons), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });

        } else {
          return new Response(JSON.stringify({ error: 'Course ID or Lesson ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      case 'POST': {
        const lessonData = await req.json();

        const { data: newLesson, error: createError } = await supabaseClient
          .from('lessons')
          .insert(lessonData)
          .select()
          .single();

        if (createError) {
          console.error('Error creating lesson:', createError);
          return new Response(JSON.stringify({ error: createError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify(newLesson), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'PUT': {
        if (!lessonId) {
          return new Response(JSON.stringify({ error: 'Lesson ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const updateData = await req.json();

        const { data: updatedLesson, error: updateError } = await supabaseClient
          .from('lessons')
          .update(updateData)
          .eq('id', lessonId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating lesson:', updateError);
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify(updatedLesson), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'DELETE': {
        if (!lessonId) {
          return new Response(JSON.stringify({ error: 'Lesson ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { error: deleteError } = await supabaseClient
          .from('lessons')
          .delete()
          .eq('id', lessonId);

        if (deleteError) {
          console.error('Error deleting lesson:', deleteError);
          return new Response(JSON.stringify({ error: deleteError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ message: 'Lesson deleted successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
