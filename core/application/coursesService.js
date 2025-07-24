const courses = require('../domain/courses');
const supabase = require('../../shared/utils/supabaseClient');

async function getAllCourses(plan) {
  if (process.env.SUPABASE_URL) {
    let query = supabase.from('courses').select('*');
    if (plan) query = query.eq('plan_id', plan);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
  return plan ? courses.filter(c => c.plan === plan) : courses;
}

async function getCourseById(id) {
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase.from('courses').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  }
  return courses.find(c => c.id === id);
}

async function addCourse({ title, description, plan }) {
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase
      .from('courses')
      .insert({ title, description, plan_id: plan })
      .single();
    if (error) throw error;
    return data;
  }
  const course = { id: courses.length + 1, title, description, plan };
  courses.push(course);
  return course;
}

async function updateCourse(id, { title, description, plan }) {
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase
      .from('courses')
      .update({ title, description, plan_id: plan })
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }
  const course = courses.find(c => c.id === id);
  if (!course) return null;
  if (title !== undefined) course.title = title;
  if (description !== undefined) course.description = description;
  if (plan !== undefined) course.plan = plan;
  return course;
}

async function deleteCourse(id) {
  if (process.env.SUPABASE_URL) {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
  const index = courses.findIndex(c => c.id === id);
  if (index === -1) return false;
  courses.splice(index, 1);
  return true;
}

module.exports = {
  getAllCourses,
  getCourseById,
  addCourse,
  updateCourse,
  deleteCourse
};
