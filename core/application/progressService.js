const progress = require('../domain/progress');
const supabase = require('../../shared/utils/supabaseClient');
const { getCourseById } = require('./coursesService');
const { addNotification } = require('./notificationsService');

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
    const course = await getCourseById(courseId);
    const title = course ? course.title : `curso ${courseId}`;
    const msg = completed
      ? `Has completado el curso ${title}`
      : `Te has inscrito en el curso ${title}`;
    await addNotification({ userId, message: msg });
    return data;
  }
  const entry = { id: progress.length + 1, userId, courseId, completed };
  progress.push(entry);
  const course = await getCourseById(courseId);
  const title = course ? course.title : `curso ${courseId}`;
  const msg = completed
    ? `Has completado el curso ${title}`
    : `Te has inscrito en el curso ${title}`;
  await addNotification({ userId, message: msg });
  return entry;
}

module.exports = { getUserProgress, addProgress };
