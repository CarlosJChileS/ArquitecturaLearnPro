const progress = require('../domain/progress');
const supabase = require('../../shared/utils/supabaseClient');

async function getUserProgress(userId) {
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }
  return progress.filter(p => p.userId === userId);
}

async function addProgress({ userId, courseId, completed }) {
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase
      .from('progress')
      .insert({ user_id: userId, course_id: courseId, completed })
      .single();
    if (error) throw error;
    return data;
  }
  const entry = { id: progress.length + 1, userId, courseId, completed };
  progress.push(entry);
  return entry;
}

module.exports = { getUserProgress, addProgress };
