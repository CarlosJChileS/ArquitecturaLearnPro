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

    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')
    const { method } = req

    switch (method) {
      case 'GET':
        if (userId) {
          // Obtener un usuario específico
          const { data: user, error } = await supabaseClient
            .from('profiles')
            .select(`
              user_id,
              full_name,
              email,
              role,
              created_at,
              updated_at,
              avatar_url,
              phone,
              bio
            `)
            .eq('user_id', userId)
            .single()

          if (error) throw error

          return new Response(JSON.stringify({ data: user }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else {
          // Obtener todos los usuarios con estadísticas
          const { data: users, error } = await supabaseClient
            .from('profiles')
            .select(`
              user_id,
              full_name,
              email,
              role,
              created_at,
              updated_at,
              avatar_url
            `)
            .order('created_at', { ascending: false })

          if (error) throw error

          // Enriquecer con estadísticas de enrollments
          const enrichedUsers = []
          for (const user of users) {
            const { data: enrollments } = await supabaseClient
              .from('course_enrollments')
              .select('id, status')
              .eq('user_id', user.user_id)

            const { data: subscriptions } = await supabaseClient
              .from('user_subscriptions')
              .select('status, plan_id')
              .eq('user_id', user.user_id)
              .eq('status', 'active')
              .limit(1)

            enrichedUsers.push({
              ...user,
              total_courses: enrollments?.length || 0,
              completed_courses: enrollments?.filter(e => e.status === 'completed').length || 0,
              subscription_status: subscriptions?.[0] || null
            })
          }

          return new Response(JSON.stringify({ data: enrichedUsers }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

      case 'POST':
        const userData = await req.json()
        
        // Crear nuevo usuario (admin)
        const { data: newUser, error: createError } = await supabaseClient
          .from('profiles')
          .insert({
            user_id: userData.user_id || crypto.randomUUID(),
            full_name: userData.full_name,
            email: userData.email,
            role: userData.role || 'student',
            avatar_url: userData.avatar_url,
            phone: userData.phone,
            bio: userData.bio
          })
          .select()
          .single()

        if (createError) throw createError

        return new Response(JSON.stringify({ data: newUser }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'PUT':
        if (!userId) throw new Error('User ID required for update')
        
        const updateData = await req.json()
        
        const { data: updatedUser, error: updateError } = await supabaseClient
          .from('profiles')
          .update({
            full_name: updateData.full_name,
            email: updateData.email,
            role: updateData.role,
            avatar_url: updateData.avatar_url,
            phone: updateData.phone,
            bio: updateData.bio,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()
          .single()

        if (updateError) throw updateError

        return new Response(JSON.stringify({ data: updatedUser }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'DELETE':
        if (!userId) throw new Error('User ID required for delete')
        
        // Soft delete - cambiar role a 'inactive'
        const { data: deletedUser, error: deleteError } = await supabaseClient
          .from('profiles')
          .update({ role: 'inactive', updated_at: new Date().toISOString() })
          .eq('user_id', userId)
          .select()
          .single()

        if (deleteError) throw deleteError

        return new Response(JSON.stringify({ data: deletedUser }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      default:
        return new Response('Method not allowed', { status: 405, headers: corsHeaders })
    }

  } catch (error) {
    console.error('Error in admin-users function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
