const courses = require('../../domain/courses');
const supabase = require('../../../shared/utils/supabaseClient');

class CourseRepository {
  async getAll() {
    if (process.env.SUPABASE_URL) {
      const { data, error } = await supabase.from('courses').select('*');
      if (error) throw error;
      return data;
    }
    return courses;
  }

  async getById(id) {
    if (process.env.SUPABASE_URL) {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return data;
    }
    return courses.find((c) => c.id === id);
  }

  async add({ title, description }) {
    if (process.env.SUPABASE_URL) {
      const { data, error } = await supabase
        .from('courses')
        .insert({ title, description })
        .single();
      if (error) throw error;
      return data;
    }
    const course = { id: courses.length + 1, title, description };
    courses.push(course);
    return course;
  }

  async update(id, { title, description }) {
    if (process.env.SUPABASE_URL) {
      const { data, error } = await supabase
        .from('courses')
        .update({ title, description })
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    }
    const course = courses.find((c) => c.id === id);
    if (!course) return null;
    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    return course;
  }

  async remove(id) {
    if (process.env.SUPABASE_URL) {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
    const index = courses.findIndex((c) => c.id === id);
    if (index === -1) return false;
    courses.splice(index, 1);
    return true;
  }
}

module.exports = new CourseRepository();
