import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar que el usuario es admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Access denied. Admin role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { method } = req
    const url = new URL(req.url)
    const courseId = url.searchParams.get('courseId')

    switch (method) {
      case 'GET':
        if (courseId) {
          // Obtener curso específico con lecciones
          const { data: course, error: courseError } = await supabaseClient
            .from('courses')
            .select(`
              *,
              categories(name),
              lessons(*),
              profiles:instructor_id(full_name, email)
            `)
            .eq('id', courseId)
            .single()

          if (courseError) {
            return new Response(
              JSON.stringify({ error: courseError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify(course),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          // Obtener todos los cursos con estadísticas
          const { data: courses, error: coursesError } = await supabaseClient
            .from('courses')
            .select(`
              *,
              categories(name),
              profiles:instructor_id(full_name, email),
              enrollments:course_enrollments(count),
              lessons(count)
            `)
            .order('created_at', { ascending: false })

          if (coursesError) {
            return new Response(
              JSON.stringify({ error: coursesError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify(courses),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

      case 'POST':
        const courseData = await req.json()
        const { data: newCourse, error: createError } = await supabaseClient
          .from('courses')
          .insert({
            ...courseData,
            instructor_id: courseData.instructor_id || user.id
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating course:', createError)
          return new Response(
            JSON.stringify({ error: createError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(newCourse),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'PUT':
        if (!courseId) {
          return new Response(
            JSON.stringify({ error: 'Course ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const updateData = await req.json()
        const { data: updatedCourse, error: updateError } = await supabaseClient
          .from('courses')
          .update(updateData)
          .eq('id', courseId)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating course:', updateError)
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(updatedCourse),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'DELETE':
        if (!courseId) {
          return new Response(
            JSON.stringify({ error: 'Course ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Verificar si hay inscripciones activas
        const { data: enrollments } = await supabaseClient
          .from('course_enrollments')
          .select('id')
          .eq('course_id', courseId)

        if (enrollments && enrollments.length > 0) {
          return new Response(
            JSON.stringify({ error: 'Cannot delete course with active enrollments' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Primero eliminar lecciones relacionadas
        await supabaseClient
          .from('lessons')
          .delete()
          .eq('course_id', courseId)

        // Luego eliminar el curso
        const { error: deleteError } = await supabaseClient
          .from('courses')
          .delete()
          .eq('id', courseId)

        if (deleteError) {
          console.error('Error deleting course:', deleteError)
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ message: 'Course deleted successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
