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

    const { method } = req
    const url = new URL(req.url)
    const courseId = url.searchParams.get('courseId')

    console.log(`Processing ${method} request for courseId: ${courseId}`)

    switch (method) {
      case 'GET':
        if (courseId) {
          const { data, error } = await supabaseClient
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single()

          if (error) {
            console.error('GET Error:', error)
            return new Response(JSON.stringify({ error: error.message }), {
              status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else {
          const { data, error } = await supabaseClient
            .from('courses')
            .select('*')
            .order('created_at', { ascending: false })

          if (error) {
            console.error('GET All Error:', error)
            return new Response(JSON.stringify({ error: error.message }), {
              status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          return new Response(JSON.stringify(data || []), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

      case 'POST':
        const postData = await req.json()
        console.log('POST data received:', postData)
        
        const { data: newCourse, error: createError } = await supabaseClient
          .from('courses')
          .insert(postData)
          .select('*')
          .single()

        if (createError) {
          console.error('POST Error:', createError)
          return new Response(JSON.stringify({ error: createError.message }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        console.log('Course created:', newCourse)
        return new Response(JSON.stringify(newCourse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'PUT':
        if (!courseId) {
          return new Response(JSON.stringify({ error: 'Course ID is required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const putData = await req.json()
        console.log('PUT data received:', putData)
        
        const { data: updatedCourse, error: updateError } = await supabaseClient
          .from('courses')
          .update(putData)
          .eq('id', courseId)
          .select('*')
          .single()

        if (updateError) {
          console.error('PUT Error:', updateError)
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        console.log('Course updated:', updatedCourse)
        return new Response(JSON.stringify(updatedCourse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'DELETE':
        if (!courseId) {
          return new Response(JSON.stringify({ error: 'Course ID is required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { error: deleteError } = await supabaseClient
          .from('courses')
          .delete()
          .eq('id', courseId)

        if (deleteError) {
          console.error('DELETE Error:', deleteError)
          return new Response(JSON.stringify({ error: deleteError.message }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ message: 'Course deleted successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
