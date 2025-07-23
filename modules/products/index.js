const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourseById,
  addCourse,
  updateCourse,
  deleteCourse
} = require('../../core/application/coursesService');
const { getActiveSubscriptionByUserId } = require('../../core/application/subscriptionsService');
const adminAccess = require('../../shared/middleware/adminAccess');

router.get('/', async (req, res) => {
  try {
    const userId = req.header('x-user-id');
    const subscription = await getActiveSubscriptionByUserId(userId);
    const plan = subscription ? subscription.plan_id || subscription.plan : undefined;
    const courses = await getAllCourses(plan);
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const course = await getCourseById(parseInt(req.params.id, 10));
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', adminAccess, async (req, res) => {
  try {
    const { title, description, plan } = req.body;
    const course = await addCourse({ title, description, plan });
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', adminAccess, async (req, res) => {
  try {
    const course = await updateCourse(parseInt(req.params.id, 10), req.body);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', adminAccess, async (req, res) => {
  try {
    const success = await deleteCourse(parseInt(req.params.id, 10));
    if (!success) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
