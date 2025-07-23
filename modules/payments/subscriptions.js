const express = require('express');
const router = express.Router();
const {
  getAllSubscriptions,
  getSubscription,
  addSubscription,
  updateSubscription,
  deleteSubscription,
} = require('../../core/application/subscriptionsService');
const subscriptions = require('../../core/domain/subscriptions');
const adminCheck = require('../../shared/middleware/adminCheck');

router.get('/', async (req, res) => {
  try {
    const all = await getAllSubscriptions();
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const subscription = await addSubscription(req.body);
    res.status(201).json(subscription);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const sub = await getSubscription(req.params.id);
    if (!sub) return res.status(404).json({ error: 'Not found' });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', adminCheck, async (req, res) => {
  try {
    const updated = await updateSubscription(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', adminCheck, async (req, res) => {
  try {
    const deleted = await deleteSubscription(req.params.id);
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router, subscriptions };
