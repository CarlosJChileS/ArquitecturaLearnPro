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

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { method } = req;
    const url = new URL(req.url);
    const notificationId = url.searchParams.get('notificationId');

    switch (method) {
      case 'GET': {
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const includeRead = url.searchParams.get('includeRead') === 'true';

        const { data: notifications, error: notificationsError } = await supabaseClient
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_read', includeRead ? undefined : false)
          .is('expires_at', null)
          .or(`expires_at.gt.${new Date().toISOString()}`)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (notificationsError) {
          return new Response(JSON.stringify({ error: notificationsError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Contar notificaciones no leídas
        const { count: unreadCount } = await supabaseClient
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false)
          .is('expires_at', null)
          .or(`expires_at.gt.${new Date().toISOString()}`);

        return new Response(JSON.stringify({
          notifications,
          unread_count: unreadCount || 0,
          total: notifications?.length || 0
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'PUT': {
        if (!notificationId) {
          return new Response(JSON.stringify({ error: 'Notification ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const updateData = await req.json();
        const { is_read } = updateData;

        const { data: updatedNotification, error: updateError } = await supabaseClient
          .from('notifications')
          .update({ is_read })
          .eq('id', notificationId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) {
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify(updatedNotification), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'POST': {
        // Marcar todas las notificaciones como leídas
        const { error: markAllReadError } = await supabaseClient
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', user.id)
          .eq('is_read', false);

        if (markAllReadError) {
          return new Response(JSON.stringify({ error: markAllReadError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ message: 'All notifications marked as read' }), {
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
