import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader!.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("Usuario no autenticado");
    }

    const { planId, successUrl, cancelUrl } = await req.json();

    // Obtener el plan de suscripción
    const { data: plan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      throw new Error("Plan de suscripción no encontrado");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16"
    });

    // Buscar o crear cliente de Stripe
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    let customerId = "";
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id
        }
      });
      customerId = customer.id;
    }

    // Crear producto y precio en Stripe si no existe
    const products = await stripe.products.list({ limit: 100 });
    let product = products.data.find(p => p.name === plan.name);

    if (!product) {
      product = await stripe.products.create({
        name: plan.name,
        description: plan.description
      });
    }

    // Crear precio recurrente
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(plan.price * 100),
      currency: 'usd',
      recurring: {
        interval: plan.duration_months === 1 ? 'month' : 'year'
      }
    });

    // Crear sesión de checkout para suscripción
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{
        price: price.id,
        quantity: 1
      }],
      mode: "subscription",
      success_url: successUrl || `${req.headers.get("origin")}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/subscription-cancel`,
      metadata: {
        user_id: user.id,
        plan_id: planId
      }
    });

    console.log(`Sesión de suscripción creada: ${session.id} para usuario: ${user.id}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    console.error("Error al crear suscripción:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
