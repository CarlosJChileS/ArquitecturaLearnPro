const notifications = require('../domain/notifications');
const supabase = require('../../shared/utils/supabaseClient');

async function getNotificationsByUser(userId) {
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }
  return notifications.filter(n => n.userId === userId);
}

async function addNotification({ userId, message }) {
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({ user_id: userId, message })
      .single();
    if (error) throw error;
    return data;
  }
  const note = { id: notifications.length + 1, userId, message };
  notifications.push(note);
  return note;
}

module.exports = { getNotificationsByUser, addNotification };
