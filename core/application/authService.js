const supabase = require('../../shared/utils/supabaseClient');
const supabaseAuthClient = require('../../shared/utils/supabaseAuthClient');

const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];

async function register({ email, password, fullName }) {
  const { data, error } = await supabaseAuthClient.auth.signUp({ email, password });
  if (error) throw error;
  const user = data.user;
  if (user) {
    const role = ADMIN_EMAILS.includes(email) ? 'admin' : 'user';
    const { error: insertError } = await supabase
      .from('users')
      .insert({ id: user.id, email, full_name: fullName, role });
    if (insertError) throw insertError;
  }
  return user;
}

async function login({ email, password }) {
  const { data, error } = await supabaseAuthClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

module.exports = { register, login };
