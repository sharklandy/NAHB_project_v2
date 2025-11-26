const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const result = await authService.register(username, email, password);
    res.json(result);
  } catch (err) {
    const statusCode = err.message === 'email and password required' || err.message === 'email exists' ? 400 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

/**
 * POST /api/auth/login
 * Login existing user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    const statusCode = err.message === 'invalid credentials' ? 400 : 
                       err.message === 'user is banned' ? 403 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

module.exports = router;
