const express = require('express');
const router = express.Router();
const {
  getUserProgress,
  addProgress
} = require('../../core/application/progressService');

router.get('/:userId', async (req, res) => {
  try {
    const userProgress = await getUserProgress(req.params.userId);
    res.json(userProgress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const entry = await addProgress(req.body);
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
