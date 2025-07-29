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
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
    apiVersion: "2023-10-16" 
  });

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature || !webhookSecret) {
      throw new Error("Missing stripe signature or webhook secret");
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log(`Received Stripe event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session, supabaseClient);
        break;
      
      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription, supabaseClient);
        break;
      
      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(updatedSubscription, supabaseClient);
        break;
      
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(deletedSubscription, supabaseClient);
        break;
      
      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice, supabaseClient);
        break;
      
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(failedInvoice, supabaseClient);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Webhook error' 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabaseClient: any) {
  console.log('Handling checkout completed:', session.id);
  
  const userId = session.metadata?.user_id;
  const planName = session.metadata?.plan_name;
  const planType = session.metadata?.plan_type;
  
  if (!userId || !planName || !planType) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // Get plan details from database to calculate correct end date
  const { data: plans } = await supabaseClient
    .from('subscription_plans')
    .select('id, name, duration_months')
    .ilike('name', `%${planName}%`)
    .limit(1);

  let durationMonths = planType === 'annual' ? 12 : 1;
  if (plans && plans.length > 0) {
    durationMonths = plans[0].duration_months;
  }

  // Calculate end date based on actual plan duration
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + durationMonths);

  // Create subscription record
  const { error } = await supabaseClient
    .from('subscriptions')
    .insert({
      user_id: userId,
      stripe_subscription_id: session.subscription,
      stripe_customer_id: session.customer,
      plan_type: planName,
      plan_period: planType,
      active: true,
      start_date: new Date().toISOString(),
      end_date: endDate.toISOString(),
      plan_id: plans && plans.length > 0 ? plans[0].id : `${planName}_${planType}`
    });

  if (error) {
    console.error('Error creating subscription:', error);
  } else {
    console.log('Subscription created successfully');
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabaseClient: any) {
  console.log('Handling subscription created:', subscription.id);
  
  // Update subscription record with Stripe subscription details
  const { error } = await supabaseClient
    .from('subscriptions')
    .update({
      stripe_subscription_id: subscription.id,
      active: subscription.status === 'active',
      start_date: new Date(subscription.current_period_start * 1000).toISOString(),
      end_date: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('stripe_customer_id', subscription.customer);

  if (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabaseClient: any) {
  console.log('Handling subscription updated:', subscription.id);
  
  const { error } = await supabaseClient
    .from('subscriptions')
    .update({
      active: subscription.status === 'active',
      start_date: new Date(subscription.current_period_start * 1000).toISOString(),
      end_date: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabaseClient: any) {
  console.log('Handling subscription deleted:', subscription.id);
  
  const { error } = await supabaseClient
    .from('subscriptions')
    .update({
      active: false,
      end_date: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error deactivating subscription:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, supabaseClient: any) {
  console.log('Handling payment succeeded:', invoice.id);
  // Here you could update payment records, extend subscription, etc.
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabaseClient: any) {
  console.log('Handling payment failed:', invoice.id);
  // Here you could notify user, update subscription status, etc.
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/stripe-webhook' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
