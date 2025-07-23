const express = require('express');
const router = express.Router();
const { register, login } = require('../../core/application/authService');

router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    const user = await register({ email, password, fullName });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const session = await login({ email, password });
    res.json(session);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

module.exports = router;
