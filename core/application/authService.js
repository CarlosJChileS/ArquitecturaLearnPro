const supabase = require('../../shared/utils/supabaseClient');

const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];

async function register({ email, password, fullName }) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  const user = data.user;
  if (user) {
    const role = ADMIN_EMAILS.includes(email) ? 'admin' : 'user';
    await supabase.from('users').insert({ id: user.id, email, full_name: fullName, role });
  }
  return user;
}

async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

module.exports = { register, login };
