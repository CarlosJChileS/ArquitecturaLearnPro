import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import Stripe from 'npm:stripe@14.19.0'; // Versión compatible con ESM

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Método no permitido'
    }), {
      status: 405
    });
  }

  const { amount, planId } = await req.json();
  const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY') || '';
  const stripe = new Stripe(stripeSecret, {
    apiVersion: '2024-04-10'
  });

  try {
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planId || 'plan'
            },
            unit_amount: Math.round(amount * 100)
          },
          quantity: 1
        }
      ],
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cancel`
    });

    return new Response(JSON.stringify({
      url: session.url
    }), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message
    }), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
