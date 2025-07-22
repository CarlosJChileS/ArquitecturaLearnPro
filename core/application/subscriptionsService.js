const subscriptions = require('../domain/subscriptions');
const supabase = require('../../shared/utils/supabaseClient');

async function getAllSubscriptions() {
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase.from('subscriptions').select('*');
    if (error) throw error;
    return data;
  }
  return subscriptions;
}

async function addSubscription({ userId, plan, active = true }) {
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({ user_id: userId, plan_id: plan, status: active ? 'active' : 'inactive' })
      .single();
    if (error) throw error;
    return data;
  }
  const subscription = { id: subscriptions.length + 1, userId, plan, active };
  subscriptions.push(subscription);
  return subscription;
}

module.exports = { getAllSubscriptions, addSubscription };
