import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WEBHOOK-STRIPE] ${step}${detailsStr}`);
};

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        persistSession: false
      }
    }
  );

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16"
    });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    logStep("Event verified", { type: event.type, id: event.id });

    // Log webhook for debugging
    await supabaseClient.from("webhook_logs").insert({
      webhook_type: event.type,
      payload: event.data
    });

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as any, supabaseClient);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object as any, supabaseClient);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as any, supabaseClient);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as any, supabaseClient);
        break;
      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook", { message: errorMessage });

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
});

async function handleSubscriptionChange(subscription: any, supabaseClient: any) {
  logStep("Processing subscription change", {
    subscriptionId: subscription.id,
    status: subscription.status
  });

  const customerId = subscription.customer;
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16"
  });

  const customer = await stripe.customers.retrieve(customerId) as any;

  if (!customer.email) {
    logStep("No email found for customer", { customerId });
    return;
  }

  const isActive = subscription.status === 'active';
  const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();

  // Determine tier from price
  const priceId = subscription.items.data[0].price.id;
  const price = await stripe.prices.retrieve(priceId);
  const interval = price.recurring?.interval || 'month';
  const subscriptionTier = interval === 'month' ? 'Mensual' : 'Anual';

  // Update subscriber record
  await supabaseClient.from("subscribers").upsert({
    email: customer.email,
    user_id: customer.metadata?.user_id || null,
    stripe_customer_id: customerId,
    subscribed: isActive,
    subscription_tier: isActive ? subscriptionTier : null,
    subscription_end: isActive ? subscriptionEnd : null,
    updated_at: new Date().toISOString()
  }, {
    onConflict: 'email'
  });

  // Create payment record
  if (isActive) {
    await supabaseClient.from("payments").insert({
      user_id: customer.metadata?.user_id,
      amount: (subscription.items.data[0].price.unit_amount || 0) / 100,
      currency: subscription.currency.toUpperCase(),
      status: 'completed',
      payment_method: 'stripe',
      payment_provider: 'stripe',
      provider_payment_id: subscription.id,
      subscription_id: subscription.id
    });
  }

  logStep("Subscription updated in database", {
    email: customer.email,
    isActive,
    subscriptionTier
  });
}

async function handleSubscriptionCancellation(subscription: any, supabaseClient: any) {
  logStep("Processing subscription cancellation", {
    subscriptionId: subscription.id
  });

  const customerId = subscription.customer;
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16"
  });

  const customer = await stripe.customers.retrieve(customerId) as any;

  if (customer.email) {
    await supabaseClient.from("subscribers").upsert({
      email: customer.email,
      user_id: customer.metadata?.user_id || null,
      stripe_customer_id: customerId,
      subscribed: false,
      subscription_tier: null,
      subscription_end: null,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'email'
    });

    logStep("Subscription cancelled in database", { email: customer.email });
  }
}

async function handlePaymentSucceeded(invoice: any, supabaseClient: any) {
  logStep("Processing payment success", {
    invoiceId: invoice.id,
    amount: invoice.amount_paid
  });

  if (invoice.subscription) {
    // Payment for subscription - handled in subscription events
    return;
  }

  // Handle one-time payments if needed
  logStep("One-time payment processed", { invoiceId: invoice.id });
}

async function handlePaymentFailed(invoice: any, supabaseClient: any) {
  logStep("Processing payment failure", {
    invoiceId: invoice.id,
    amount: invoice.amount_due
  });

  // You could implement retry logic or notifications here
  logStep("Payment failure processed", { invoiceId: invoice.id });
}
