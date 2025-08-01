import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

interface HealthCheck {
  database: boolean
  storage: boolean
  auth: boolean
  functions: boolean
  external_services: {
    stripe: boolean
    resend: boolean
    paypal: boolean
  }
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

    if (req.method === 'GET') {
      const startTime = Date.now()
      const healthStatus: HealthCheck = {
        database: false,
        storage: false,
        auth: false,
        functions: false,
        external_services: {
          stripe: false,
          resend: false,
          paypal: false
        }
      }

      // Verificar base de datos
      try {
        const { data, error } = await supabaseClient
          .from('profiles')
          .select('count')
          .limit(1)
        
        healthStatus.database = !error
      } catch (err) {
        console.error('Database health check failed:', err)
      }

      // Verificar storage
      try {
        const { data, error } = await supabaseClient.storage
          .from('course-materials')
          .list('', { limit: 1 })
        
        healthStatus.storage = !error
      } catch (err) {
        console.error('Storage health check failed:', err)
      }

      // Verificar auth
      try {
        const { data, error } = await supabaseClient.auth.admin.listUsers({
          page: 1,
          perPage: 1
        })
        
        healthStatus.auth = !error
      } catch (err) {
        console.error('Auth health check failed:', err)
      }

      // Verificar funciones (intentar llamar a una función simple)
      try {
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/health-check`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ test: true })
        })
        
        healthStatus.functions = response.ok
      } catch (err) {
        console.error('Functions health check failed:', err)
      }

      // Verificar servicios externos
      if (Deno.env.get('STRIPE_SECRET_KEY')) {
        try {
          const stripeResponse = await fetch('https://api.stripe.com/v1/account', {
            headers: {
              'Authorization': `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`
            }
          })
          healthStatus.external_services.stripe = stripeResponse.ok
        } catch (err) {
          console.error('Stripe health check failed:', err)
        }
      }

      if (Deno.env.get('RESEND_API_KEY')) {
        try {
          const resendResponse = await fetch('https://api.resend.com/domains', {
            headers: {
              'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`
            }
          })
          healthStatus.external_services.resend = resendResponse.ok
        } catch (err) {
          console.error('Resend health check failed:', err)
        }
      }

      if (Deno.env.get('PAYPAL_CLIENT_SECRET')) {
        try {
          const paypalResponse = await fetch('https://api.sandbox.paypal.com/v1/oauth2/token', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Accept-Language': 'en_US',
              'Authorization': `Basic ${btoa(`${Deno.env.get('PAYPAL_CLIENT_ID')}:${Deno.env.get('PAYPAL_CLIENT_SECRET')}`)}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
          })
          healthStatus.external_services.paypal = paypalResponse.ok
        } catch (err) {
          console.error('PayPal health check failed:', err)
        }
      }

      const responseTime = Date.now() - startTime
      const allHealthy = Object.values(healthStatus).every(status => 
        typeof status === 'boolean' ? status : Object.values(status).every(s => s)
      )

      const response = {
        status: allHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        response_time_ms: responseTime,
        checks: healthStatus,
        version: '1.0',
        environment: Deno.env.get('SUPABASE_URL')?.includes('localhost') ? 'local' : 'production'
      }

      return new Response(
        JSON.stringify(response),
        { 
          status: allHealthy ? 200 : 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Método no permitido' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in health-check:', error)
    return new Response(
      JSON.stringify({ 
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
