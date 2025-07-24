const subscriptions = require('../domain/subscriptions');
const supabase = require('../../shared/utils/supabaseClient');
const { addNotification } = require('./notificationsService');

async function getAllSubscriptions() {
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase.from('subscriptions').select('*');
    if (error) throw error;
    return data;
  }
  return subscriptions;
}

async function getSubscription(id) {
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }
  return subscriptions.find((s) => s.id === parseInt(id));
}

async function addSubscription({ userId, plan, active = true }) {
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({ user_id: userId, plan_id: plan, status: active ? 'active' : 'inactive' })
      .single();
    if (error) throw error;
    await addNotification({ userId, message: 'Suscripción activada' });
    return data;
  }
  const subscription = { id: subscriptions.length + 1, userId, plan, active };
  subscriptions.push(subscription);
  await addNotification({ userId, message: 'Suscripción activada' });
  return subscription;
}

async function getActiveSubscriptionByUserId(userId) {
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    if (error) return null;
    return data;
  }
  return subscriptions.find(s => s.userId === userId && s.active) || null;
}

async function updateSubscription(id, updates) {
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        plan_id: updates.plan,
        status: updates.active ? 'active' : 'inactive',
        start_date: updates.startDate,
        end_date: updates.endDate,
      })
      .eq('id', id)
      .single();
    if (error) throw error;
    if (data && data.user_id) {
      await addNotification({ userId: data.user_id, message: 'Suscripción actualizada' });
    }
    return data;
  }
  const sub = subscriptions.find((s) => s.id === parseInt(id));
  if (!sub) throw new Error('Subscription not found');
  Object.assign(sub, updates);
  await addNotification({ userId: sub.userId, message: 'Suscripción actualizada' });
  return sub;
}

async function deleteSubscription(id) {
  if (process.env.SUPABASE_URL) {
    const { error } = await supabase.from('subscriptions').delete().eq('id', id);
    if (error) throw error;
    return { id };
  }
  const index = subscriptions.findIndex((s) => s.id === parseInt(id));
  if (index === -1) throw new Error('Subscription not found');
  const [deleted] = subscriptions.splice(index, 1);
  return deleted;
}

module.exports = {
  getAllSubscriptions,
  getSubscription,
  addSubscription,
  getActiveSubscriptionByUserId,
  updateSubscription,
  deleteSubscription,
};
