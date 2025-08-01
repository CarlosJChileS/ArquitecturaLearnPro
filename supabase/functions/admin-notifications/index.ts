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
    const notificationId = url.searchParams.get('notificationId')
    const userId = url.searchParams.get('userId')
    const { method } = req

    switch (method) {
      case 'GET':
        if (notificationId) {
          // Obtener una notificación específica
          const { data: notification, error } = await supabaseClient
            .from('notifications')
            .select('*')
            .eq('id', notificationId)
            .single()

          if (error) throw error
          return new Response(JSON.stringify({ data: notification }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else if (userId) {
          // Obtener notificaciones de un usuario específico
          const { data: notifications, error } = await supabaseClient
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

          if (error) throw error
          return new Response(JSON.stringify({ data: notifications }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else {
          // Obtener todas las notificaciones (admin)
          const { data: notifications, error } = await supabaseClient
            .from('notifications')
            .select(`
              *,
              profiles(full_name, email)
            `)
            .order('created_at', { ascending: false })

          if (error) throw error
          return new Response(JSON.stringify({ data: notifications }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

      case 'POST':
        const notificationData = await req.json()
        
        if (notificationData.broadcast) {
          // Enviar notificación masiva
          const { data: users } = await supabaseClient
            .from('profiles')
            .select('user_id')
            .neq('role', 'inactive')

          const notifications = users?.map(user => ({
            user_id: user.user_id,
            title: notificationData.title,
            message: notificationData.message,
            type: notificationData.type || 'info',
            action_url: notificationData.action_url,
            is_read: false,
            created_at: new Date().toISOString()
          })) || []

          const { data: createdNotifications, error: createError } = await supabaseClient
            .from('notifications')
            .insert(notifications)
            .select()

          if (createError) throw createError

          return new Response(JSON.stringify({ 
            data: createdNotifications,
            message: `${notifications.length} notificaciones enviadas`
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else {
          // Crear notificación individual
          const { data: newNotification, error: createError } = await supabaseClient
            .from('notifications')
            .insert({
              user_id: notificationData.user_id,
              title: notificationData.title,
              message: notificationData.message,
              type: notificationData.type || 'info',
              action_url: notificationData.action_url,
              is_read: false,
              created_at: new Date().toISOString()
            })
            .select()
            .single()

          if (createError) throw createError

          return new Response(JSON.stringify({ data: newNotification }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

      case 'PUT':
        if (!notificationId) throw new Error('Notification ID required for update')
        
        const updateData = await req.json()
        
        const { data: updatedNotification, error: updateError } = await supabaseClient
          .from('notifications')
          .update({
            is_read: updateData.is_read,
            updated_at: new Date().toISOString()
          })
          .eq('id', notificationId)
          .select()
          .single()

        if (updateError) throw updateError

        return new Response(JSON.stringify({ data: updatedNotification }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'DELETE':
        if (!notificationId) throw new Error('Notification ID required for delete')
        
        const { data: deletedNotification, error: deleteError } = await supabaseClient
          .from('notifications')
          .delete()
          .eq('id', notificationId)
          .select()
          .single()

        if (deleteError) throw deleteError

        return new Response(JSON.stringify({ data: deletedNotification }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      default:
        return new Response('Method not allowed', { status: 405, headers: corsHeaders })
    }

  } catch (error) {
    console.error('Error in notifications function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
});
