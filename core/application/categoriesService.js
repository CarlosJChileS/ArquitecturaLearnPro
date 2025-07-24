const categories = require('../domain/categories');
const supabase = require('../../shared/utils/supabaseClient');

async function getAllCategories() {
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    return data;
  }
  return categories;
}

module.exports = { getAllCategories };
