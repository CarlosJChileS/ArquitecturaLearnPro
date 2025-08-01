import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create a Supabase client using the anon key for authentication
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError) throw new Error(`Authentication error: ${userError.message}`);

    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    logStep("User authenticated", { userId: user.id, email: user.email });

    const { planType = 'monthly', planName, priceId, mode = 'hosted' } = await req.json();

    logStep("Request data received", { planType, planName, priceId, mode });

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16"
    });

    // Check if customer exists
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer found");
    }

    // Get dynamic pricing from subscription_plans table
    const { data: subscriptionPlans, error: plansError } = await supabaseClient
      .from('subscription_plans')
      .select('*');

    if (plansError) {
      throw new Error(`Error fetching subscription plans: ${plansError.message}`);
    }

    logStep("Subscription plans fetched", { count: subscriptionPlans?.length });

    // Find the plan based on planName or duration
    let selectedPlan;
    if (planName) {
      selectedPlan = subscriptionPlans?.find(p => p.name === planName);
    } else {
      // Fallback to duration-based selection
      const duration = planType === 'monthly' ? 1 : 12;
      selectedPlan = subscriptionPlans?.find(p => p.duration_months === duration);
    }

    if (!selectedPlan) {
      throw new Error(`Plan not found: ${planName || planType}`);
    }

    logStep("Plan selected from database", { 
      name: selectedPlan.name, 
      price: selectedPlan.price, 
      duration: selectedPlan.duration_months 
    });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: selectedPlan.name,
            description: selectedPlan.description || `Acceso completo a todos los cursos de LearnPro - ${selectedPlan.name}`
          },
          unit_amount: Math.round(selectedPlan.price * 100), // Convert to cents
          recurring: {
            interval: selectedPlan.duration_months === 1 ? 'month' : 'year'
          }
        },
        quantity: 1
      }],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?success=true`,
      cancel_url: `${req.headers.get("origin")}/pricing?canceled=true`,
      ui_mode: mode === 'embedded' ? 'embedded' : 'hosted',
      return_url: mode === 'embedded' ? `${req.headers.get("origin")}/dashboard?success=true` : undefined,
      metadata: {
        user_id: user.id,
        plan_type: planType,
        plan_name: selectedPlan.name,
        plan_id: selectedPlan.id
      }
    });

    logStep("Checkout session created", { 
      sessionId: session.id, 
      url: session.url,
      mode: mode || 'hosted'
    });

    // Return different response based on mode
    if (mode === 'embedded') {
      return new Response(JSON.stringify({ 
        sessionId: session.id,
        clientSecret: session.client_secret
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    } else {
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-checkout", { message: errorMessage });

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
