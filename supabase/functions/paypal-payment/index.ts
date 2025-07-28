import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

serve(async (req) => {
  try {
    const body = await req.json();
    const amount = body.amount;
    
    const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
    const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');
    
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error('Missing PayPal credentials');
    }

    const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
    
    const response = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amount
            }
          }
        ]
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return new Response(text, {
        status: response.status
      });
    }

    const data = await response.json();
    const approve = data.links?.find((l) => l.rel === 'approve');
    
    return new Response(JSON.stringify({
      approvalUrl: approve?.href
    }), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error('PayPal function error:', err);
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500
    });
  }
});
