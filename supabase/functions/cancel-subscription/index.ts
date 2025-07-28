import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.21.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        persistSession: false
      }
    }
  )

  try {
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      throw new Error('Token de autorización requerido')
    }

    const { data } = await supabaseClient.auth.getUser(token)
    const user = data.user

    if (!user?.email) {
      throw new Error('Usuario no autenticado')
    }

    const { reason, feedback } = await req.json()

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16'
    })

    // Buscar cliente en Stripe
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    })

    if (customers.data.length === 0) {
      throw new Error('No se encontró cliente de Stripe')
    }

    const customerId = customers.data[0].id

    // Buscar suscripción activa
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    })

    if (subscriptions.data.length === 0) {
      throw new Error('No se encontró suscripción activa para cancelar')
    }

    const subscription = subscriptions.data[0]

    // Cancelar suscripción al final del período actual
    const cancelledSubscription = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
      metadata: {
        cancellation_reason: reason || 'user_requested',
        cancellation_feedback: feedback || '',
        cancelled_by: user.id,
        cancelled_at: new Date().toISOString()
      }
    })

    console.log(`Suscripción marcada para cancelación: ${subscription.id} para usuario: ${user.id}`)

    // Actualizar estado en Supabase
    await supabaseClient
      .from('subscribers')
      .update({
        subscription_tier: `${subscription.items.data[0]?.price?.nickname || 'Premium'} (Cancelando)`,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    // Registrar evento de cancelación
    await supabaseClient
      .from('user_events')
      .insert({
        user_id: user.id,
        event_type: 'subscription_cancelled',
        event_data: {
          subscription_id: subscription.id,
          reason: reason,
          feedback: feedback,
          cancel_at_period_end: new Date(cancelledSubscription.current_period_end * 1000).toISOString(),
          cancelled_at: new Date().toISOString()
        }
      })

    // Crear notificación
    await supabaseClient.rpc('create_notification', {
      target_user_id: user.id,
      notification_title: 'Suscripción cancelada',
      notification_message: `Tu suscripción se cancelará el ${new Date(cancelledSubscription.current_period_end * 1000).toLocaleDateString()}. Seguirás teniendo acceso hasta esa fecha.`,
      notification_type: 'info'
    })

    // Programar recordatorio antes del final del período
    const reminderDate = new Date(cancelledSubscription.current_period_end * 1000)
    reminderDate.setDate(reminderDate.getDate() - 3) // 3 días antes

    await supabaseClient.rpc('create_reminder', {
      target_user_id: user.id,
      reminder_type: 'subscription_ending',
      reminder_title: 'Tu suscripción termina pronto',
      reminder_message: 'Tu suscripción terminará en 3 días. Renueva para mantener el acceso a todos los cursos.',
      scheduled_for: reminderDate.toISOString()
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Suscripción cancelada exitosamente',
        cancellation_date: new Date(cancelledSubscription.current_period_end * 1000).toISOString(),
        access_until: new Date(cancelledSubscription.current_period_end * 1000).toLocaleDateString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error en cancel-subscription:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
