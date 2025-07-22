const courseRepository = require('../infrastructure/repositories/CourseRepository');

async function getAllCourses() {
  return courseRepository.getAll();
}

async function getCourseById(id) {
  return courseRepository.getById(id);
}

async function addCourse({ title, description }) {
  return courseRepository.add({ title, description });
}

async function updateCourse(id, update) {
  return courseRepository.update(id, update);
}

async function deleteCourse(id) {
  return courseRepository.remove(id);
}

module.exports = {
  getAllCourses,
  getCourseById,
  addCourse,
  updateCourse,
  deleteCourse
};
