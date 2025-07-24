const notifications = require('../domain/notifications');
const supabase = require('../../shared/utils/supabaseClient');
const resend = require('../../shared/utils/resendClient');
const buildNotificationEmailHTML = require('../../shared/templates/notificationEmailTemplate');
const { getUserById } = require('./usersService');

async function sendEmailNotification(userId, message) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    const user = await getUserById(userId);
    if (user && user.email) {
      await resend.emails.send({
        from: 'no-reply@learnpro.com',
        to: user.email,
        subject: 'LearnPro Notification',
        text: message,
        html: buildNotificationEmailHTML(message)
      });
    }
  } catch (err) {
    console.error('Resend email error:', err.message);
  }
}

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
    await sendEmailNotification(userId, message);
    return data;
  }
  const note = { id: notifications.length + 1, userId, message };
  notifications.push(note);
  await sendEmailNotification(userId, message);
  return note;
}

module.exports = { getNotificationsByUser, addNotification };
