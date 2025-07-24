const payments = require('../domain/payments');
const supabase = require('../../shared/utils/supabaseClient');

async function addPayment({ subscriptionId, amount, currency = 'USD', provider, status }) {
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        subscription_id: subscriptionId,
        amount,
        currency,
        provider,
        status
      })
      .single();
    if (error) throw error;
    return data;
  }
  const payment = {
    id: payments.length + 1,
    subscriptionId,
    amount,
    currency,
    provider,
    status,
    paidAt: new Date()
  };
  payments.push(payment);
  return payment;
}

module.exports = { addPayment };
