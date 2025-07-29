import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    if (!authHeader) {
      throw new Error("No authorization header");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { planType, planName } = await req.json();
    console.log(`Received request: planType=${planType}, planName=${planName}`);

    // Normalize plan name to handle accents/casing
    const normalized = planName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const canonicalName =
      normalized.includes('premium')
        ? 'Premium'
        : normalized.includes('basico') || normalized.includes('basic')
          ? 'Basic'
          : planName; // Use original name if not recognized

    console.log(`Normalized name: ${normalized} -> canonical: ${canonicalName}`);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2023-10-16" 
    });

    // Check if customer already exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log(`Existing customer found: ${customerId}`);
    } else {
      console.log(`No existing customer found for: ${user.email}`);
    }

    // Get plan pricing from database
    const { data: plans, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('id, name, price, duration_months')
      .ilike('name', `%${canonicalName}%`);

    if (planError) {
      console.error('Database error:', planError);
      throw new Error(`Database error: ${planError.message}`);
    }

    if (!plans || plans.length === 0) {
      console.error(`No plans found for: ${canonicalName}`);
      throw new Error(`Plan ${canonicalName} not found in database`);
    }

    console.log(`Found ${plans.length} plans for ${canonicalName}:`, plans);

    // Find the correct plan based on duration
    const targetDuration = planType === 'annual' ? 12 : 1;
    let selectedPlan = plans.find(p => p.duration_months === targetDuration);
    
    // If specific duration not found, use the first available plan and calculate price
    if (!selectedPlan) {
      console.log(`Plan with duration ${targetDuration} not found, using first available plan:`, plans[0]);
      selectedPlan = plans[0];
    } else {
      console.log(`Selected plan:`, selectedPlan);
    }

    // Calculate the correct amount in cents for Stripe
    let amount;
    if (selectedPlan.duration_months === 12 && planType === 'monthly') {
      // If we have annual price but need monthly, divide by 12
      amount = Math.round((selectedPlan.price * 100) / 12);
      console.log(`Calculated monthly price from annual: $${selectedPlan.price} / 12 = $${amount/100}`);
    } else if (selectedPlan.duration_months === 1 && planType === 'annual') {
      // If we have monthly price but need annual, multiply by 12
      amount = Math.round(selectedPlan.price * 100 * 12);
      console.log(`Calculated annual price from monthly: $${selectedPlan.price} * 12 = $${amount/100}`);
    } else {
      // Direct conversion to cents
      amount = Math.round(selectedPlan.price * 100);
      console.log(`Direct price conversion: $${selectedPlan.price} = ${amount} cents`);
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `${canonicalName} Plan (${planType})`,
              description: `LearnPro ${canonicalName} subscription - ${planType} billing`
            },
            unit_amount: amount,
            recurring: { interval: planType === 'monthly' ? 'month' : 'year' },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?success=true&plan=${canonicalName}&type=${planType}`,
      cancel_url: `${req.headers.get("origin")}/subscription?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_name: canonicalName,
        plan_type: planType
      }
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Detailed error in create-checkout:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Error creating checkout session' 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});