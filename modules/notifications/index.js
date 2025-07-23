const express = require('express');
const router = express.Router();
const {
  getNotificationsByUser,
  addNotification
} = require('../../core/application/notificationsService');

router.get('/:userId', async (req, res) => {
  try {
    const notes = await getNotificationsByUser(req.params.userId);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const note = await addNotification(req.body);
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
