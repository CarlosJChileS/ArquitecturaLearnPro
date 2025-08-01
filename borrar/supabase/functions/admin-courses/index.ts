import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log(`🚀 Function called with method: ${req.method}`)
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { method } = req
    const url = new URL(req.url)
    const courseId = url.searchParams.get('courseId')
    
    console.log(`📝 Method: ${method}, CourseId: ${courseId}`)

    if (method === 'GET') {
      if (courseId) {
        console.log(`🔍 Getting course with ID: ${courseId}`)
        const { data, error } = await supabaseClient
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single()

        if (error) {
          console.error('❌ GET Error:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        console.log('✅ GET Success')
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } else {
        console.log('📋 Getting all courses')
        const { data, error } = await supabaseClient
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('❌ GET All Error:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        console.log('✅ GET All Success')
        return new Response(JSON.stringify(data || []), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    if (method === 'POST') {
      console.log('➕ Creating new course')
      const postData = await req.json()
      console.log('📝 POST Data:', JSON.stringify(postData, null, 2))
      
      const { data: newCourse, error: createError } = await supabaseClient
        .from('courses')
        .insert(postData)
        .select('*')
        .single()

      if (createError) {
        console.error('❌ POST Error:', createError)
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('✅ POST Success')
      return new Response(JSON.stringify(newCourse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (method === 'PUT') {
      console.log('✏️ Updating course')
      console.log('🆔 Course ID from URL:', courseId)
      
      if (!courseId || courseId.trim() === '') {
        console.error('❌ Missing course ID')
        return new Response(JSON.stringify({ error: 'Course ID is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const putData = await req.json()
      console.log('📝 PUT Data:', JSON.stringify(putData, null, 2))
      
      const { data: updatedCourse, error: updateError } = await supabaseClient
        .from('courses')
        .update(putData)
        .eq('id', courseId)
        .select('*')
        .single()

      if (updateError) {
        console.error('❌ PUT Error:', updateError)
        console.error('📋 Error Details:', JSON.stringify(updateError, null, 2))
        return new Response(JSON.stringify({ 
          error: updateError.message, 
          details: updateError,
          sentData: putData,
          courseId: courseId 
        }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('✅ PUT Success')
      return new Response(JSON.stringify(updatedCourse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (method === 'DELETE') {
      console.log('🗑️ Deleting course')
      
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
        console.error('❌ DELETE Error:', deleteError)
        return new Response(JSON.stringify({ error: deleteError.message }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('✅ DELETE Success')
      return new Response(JSON.stringify({ message: 'Course deleted successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Method not allowed
    console.error(`❌ Method ${method} not allowed`)
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('💥 Function Error:', error)
    console.error('📋 Error Stack:', error.stack)
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message,
      stack: error.stack 
    }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
