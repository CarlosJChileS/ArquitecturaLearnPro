const express = require('express');
const router = express.Router();
const { getAllCategories } = require('../../core/application/categoriesService');

router.get('/', async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
