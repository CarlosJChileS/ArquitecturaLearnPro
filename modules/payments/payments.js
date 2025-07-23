const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const paypal = require('@paypal/checkout-server-sdk');
const supabase = require('../../shared/utils/supabaseClient');
const { addPayment } = require('../../core/application/paymentsService');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10',
});

const paypalEnv = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID || '',
  process.env.PAYPAL_CLIENT_SECRET || ''
);
const paypalClient = new paypal.core.PayPalHttpClient(paypalEnv);

/**
 * Verify a Stripe checkout session after the user is redirected back from the
 * Stripe hosted payment page. The client sends the `sessionId` received in the
 * success URL and the backend retrieves the session from Stripe to confirm the
 * payment status.
 */
async function verifyStripeSession(req, res) {
  const { sessionId } = req.params;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const subId = session.metadata ? session.metadata.subscription_id : null;
      if (subId) {
        try {
          await addPayment({
            subscriptionId: parseInt(subId, 10),
            amount: session.amount_total / 100,
            currency: session.currency.toUpperCase(),
            provider: 'stripe',
            status: 'paid',
          });
        } catch (err) {
          console.error('Payment record error:', err.message);
        }
      }
    }

    res.json({ payment_status: session.payment_status });
  } catch (err) {
    console.error('Stripe verify error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

router.post('/stripe', async (req, res) => {
  try {
    if (process.env.SUPABASE_URL) {
      const { data, error } = await supabase.functions.invoke('stripe-payment', {
        body: req.body,
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      });
      if (error) throw error;
      return res.json(data);
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: req.body.planId || 'plan' },
            unit_amount: Math.round(req.body.amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/cancel`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/paypal', async (req, res) => {
  try {
    if (process.env.SUPABASE_URL) {
      const { data, error } = await supabase.functions.invoke('paypal-payment', {
        body: req.body,
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      });
      if (error) throw error;
      return res.json(data);
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: 'USD', value: req.body.amount },
        },
      ],
    });

    const order = await paypalClient.execute(request);
    const approve = order.result.links.find((l) => l.rel === 'approve');
    res.json({ approvalUrl: approve.href });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/stripe/session/:sessionId', verifyStripeSession);

module.exports = router;
module.exports.verifyStripeSession = verifyStripeSession;
