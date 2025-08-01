import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
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

    const url = new URL(req.url)
    const lessonId = url.searchParams.get('lessonId')
    const courseId = url.searchParams.get('courseId')
    const { method } = req

    switch (method) {
      case 'GET':
        if (lessonId) {
          // Obtener una lección específica
          const { data: lesson, error } = await supabaseClient
            .from('lessons')
            .select(`
              *,
              courses(title, instructor_id)
            `)
            .eq('id', lessonId)
            .single()

          if (error) throw error
          return new Response(JSON.stringify({ data: lesson }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else if (courseId) {
          // Obtener lecciones de un curso específico
          const { data: lessons, error } = await supabaseClient
            .from('lessons')
            .select('*')
            .eq('course_id', courseId)
            .order('order_index', { ascending: true })

          if (error) throw error
          return new Response(JSON.stringify({ data: lessons }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else {
          // Obtener todas las lecciones
          const { data: lessons, error } = await supabaseClient
            .from('lessons')
            .select(`
              *,
              courses(title, instructor_id)
            `)
            .order('created_at', { ascending: false })

          if (error) throw error
          return new Response(JSON.stringify({ data: lessons }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

      case 'POST':
        const lessonData = await req.json()
        
        // Crear nueva lección
        const { data: newLesson, error: createError } = await supabaseClient
          .from('lessons')
          .insert({
            title: lessonData.title,
            description: lessonData.description,
            course_id: lessonData.course_id,
            video_url: lessonData.video_url,
            duration_minutes: lessonData.duration_minutes,
            order_index: lessonData.order_index,
            is_free: lessonData.is_free || false,
            content: lessonData.content,
            resources: lessonData.resources || [],
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) throw createError

        return new Response(JSON.stringify({ data: newLesson }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'PUT':
        if (!lessonId) throw new Error('Lesson ID required for update')
        
        const updateData = await req.json()
        
        const { data: updatedLesson, error: updateError } = await supabaseClient
          .from('lessons')
          .update({
            title: updateData.title,
            description: updateData.description,
            video_url: updateData.video_url,
            duration_minutes: updateData.duration_minutes,
            order_index: updateData.order_index,
            is_free: updateData.is_free,
            content: updateData.content,
            resources: updateData.resources,
            updated_at: new Date().toISOString()
          })
          .eq('id', lessonId)
          .select()
          .single()

        if (updateError) throw updateError

        return new Response(JSON.stringify({ data: updatedLesson }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'DELETE':
        if (!lessonId) throw new Error('Lesson ID required for delete')
        
        const { data: deletedLesson, error: deleteError } = await supabaseClient
          .from('lessons')
          .delete()
          .eq('id', lessonId)
          .select()
          .single()

        if (deleteError) throw deleteError

        return new Response(JSON.stringify({ data: deletedLesson }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      default:
        return new Response('Method not allowed', { status: 405, headers: corsHeaders })
    }

  } catch (error) {
    console.error('Error in admin-lessons function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
});
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
