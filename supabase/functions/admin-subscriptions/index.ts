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
    const subscriptionId = url.searchParams.get('subscriptionId')
    const planId = url.searchParams.get('planId')
    const userId = url.searchParams.get('userId')
    const { method } = req

    switch (method) {
      case 'GET':
        if (subscriptionId) {
          // Obtener una suscripción específica
          const { data: subscription, error } = await supabaseClient
            .from('subscriptions')
            .select(`
              *,
              subscription_plans(name, price, duration_months, features),
              profiles(full_name, email)
            `)
            .eq('id', subscriptionId)
            .single()

          if (error) throw error
          return new Response(JSON.stringify({ data: subscription }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else if (planId) {
          // Obtener plan de suscripción específico
          const { data: plan, error } = await supabaseClient
            .from('subscription_plans')
            .select('*')
            .eq('id', planId)
            .single()

          if (error) throw error
          return new Response(JSON.stringify({ data: plan }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else if (userId) {
          // Obtener suscripciones de un usuario específico
          const { data: subscriptions, error } = await supabaseClient
            .from('subscriptions')
            .select(`
              *,
              subscription_plans(name, price, duration_months, features)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

          if (error) throw error
          return new Response(JSON.stringify({ data: subscriptions }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else {
          // Obtener todas las suscripciones y planes (admin)
          const action = url.searchParams.get('action')
          
          if (action === 'plans') {
            const { data: plans, error } = await supabaseClient
              .from('subscription_plans')
              .select('*')
              .order('price', { ascending: true })

            if (error) throw error
            return new Response(JSON.stringify({ data: plans }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
          } else {
            const { data: subscriptions, error } = await supabaseClient
              .from('subscriptions')
              .select(`
                *,
                subscription_plans(name, price, duration_months, features),
                profiles(full_name, email)
              `)
              .order('created_at', { ascending: false })

            if (error) throw error
            return new Response(JSON.stringify({ data: subscriptions }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
          }
        }

      case 'POST':
        const postData = await req.json()
        
        if (postData.type === 'plan') {
          // Crear nuevo plan de suscripción
          const { data: newPlan, error: createError } = await supabaseClient
            .from('subscription_plans')
            .insert({
              name: postData.name,
              description: postData.description,
              price: postData.price,
              duration_months: postData.duration_months,
              features: postData.features,
              is_active: postData.is_active ?? true,
              stripe_price_id: postData.stripe_price_id,
              created_at: new Date().toISOString()
            })
            .select()
            .single()

          if (createError) throw createError

          return new Response(JSON.stringify({ data: newPlan }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else {
          // Crear nueva suscripción
          const { data: newSubscription, error: createError } = await supabaseClient
            .from('subscriptions')
            .insert({
              user_id: postData.user_id,
              plan_id: postData.plan_id,
              status: postData.status || 'active',
              start_date: postData.start_date || new Date().toISOString(),
              end_date: postData.end_date,
              stripe_subscription_id: postData.stripe_subscription_id,
              stripe_customer_id: postData.stripe_customer_id,
              created_at: new Date().toISOString()
            })
            .select(`
              *,
              subscription_plans(name, price, duration_months, features),
              profiles(full_name, email)
            `)
            .single()

          if (createError) throw createError

          return new Response(JSON.stringify({ data: newSubscription }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

      case 'PUT':
        const putData = await req.json()
        
        if (putData.type === 'plan' && planId) {
          // Actualizar plan de suscripción
          const { data: updatedPlan, error: updateError } = await supabaseClient
            .from('subscription_plans')
            .update({
              name: putData.name,
              description: putData.description,
              price: putData.price,
              duration_months: putData.duration_months,
              features: putData.features,
              is_active: putData.is_active,
              stripe_price_id: putData.stripe_price_id,
              updated_at: new Date().toISOString()
            })
            .eq('id', planId)
            .select()
            .single()

          if (updateError) throw updateError

          return new Response(JSON.stringify({ data: updatedPlan }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else if (subscriptionId) {
          // Actualizar suscripción
          const updateFields: any = {
            updated_at: new Date().toISOString()
          }

          if (putData.status) updateFields.status = putData.status
          if (putData.end_date) updateFields.end_date = putData.end_date
          if (putData.plan_id) updateFields.plan_id = putData.plan_id

          // Lógica especial para renovación
          if (putData.action === 'renew') {
            const { data: currentSub } = await supabaseClient
              .from('subscriptions')
              .select('end_date, subscription_plans(duration_months)')
              .eq('id', subscriptionId)
              .single()

            if (currentSub) {
              const currentEndDate = new Date(currentSub.end_date)
              const newEndDate = new Date(currentEndDate)
              newEndDate.setMonth(newEndDate.getMonth() + (currentSub.subscription_plans?.duration_months || 1))
              
              updateFields.end_date = newEndDate.toISOString()
              updateFields.status = 'active'
            }
          }

          const { data: updatedSubscription, error: updateError } = await supabaseClient
            .from('subscriptions')
            .update(updateFields)
            .eq('id', subscriptionId)
            .select(`
              *,
              subscription_plans(name, price, duration_months, features),
              profiles(full_name, email)
            `)
            .single()

          if (updateError) throw updateError

          return new Response(JSON.stringify({ data: updatedSubscription }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else {
          throw new Error('Invalid update request')
        }

      case 'DELETE':
        if (planId) {
          // Eliminar plan de suscripción (soft delete)
          const { data: deletedPlan, error: deleteError } = await supabaseClient
            .from('subscription_plans')
            .update({ 
              is_active: false,
              updated_at: new Date().toISOString()
            })
            .eq('id', planId)
            .select()
            .single()

          if (deleteError) throw deleteError

          return new Response(JSON.stringify({ data: deletedPlan }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else if (subscriptionId) {
          // Cancelar suscripción
          const { data: cancelledSubscription, error: deleteError } = await supabaseClient
            .from('subscriptions')
            .update({ 
              status: 'cancelled',
              updated_at: new Date().toISOString()
            })
            .eq('id', subscriptionId)
            .select(`
              *,
              subscription_plans(name, price, duration_months, features),
              profiles(full_name, email)
            `)
            .single()

          if (deleteError) throw deleteError

          return new Response(JSON.stringify({ data: cancelledSubscription }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else {
          throw new Error('Invalid delete request')
        }

      default:
        return new Response('Method not allowed', { status: 405, headers: corsHeaders })
    }

  } catch (error) {
    console.error('Error in subscriptions function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
});
