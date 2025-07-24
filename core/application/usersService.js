const users = require('../domain/users');
const supabase = require('../../shared/utils/supabaseClient');

async function getUserById(id) {
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, created_at')
      .eq('id', id)
      .single();
    if (error) throw error;
    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      role: data.role,
      createdAt: data.created_at,
    };
  }
  return users.find((u) => u.id === id);
}

module.exports = { getUserById };
