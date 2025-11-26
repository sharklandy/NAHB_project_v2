const express = require('express');
const router = express.Router();
const adminService = require('../services/adminService');
const { authMiddleware, requireAdmin } = require('../middleware/auth');

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics
 */
router.get('/stats', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const stats = await adminService.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/users
 * Get all users with their stats
 */
router.get('/users', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const users = await adminService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/users/:id
 * Get detailed user information
 */
router.get('/users/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const userDetails = await adminService.getUserDetails(req.params.id);
    res.json(userDetails);
  } catch (err) {
    const statusCode = err.message === 'user not found' ? 404 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

/**
 * POST /api/admin/suspend-story/:id
 * Suspend a story
 */
router.post('/suspend-story/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const result = await adminService.suspendStory(req.params.id);
    res.json(result);
  } catch (err) {
    const statusCode = err.message === 'not found' ? 404 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

/**
 * POST /api/admin/unsuspend-story/:id
 * Unsuspend a story (publish it)
 */
router.post('/unsuspend-story/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const result = await adminService.unsuspendStory(req.params.id);
    res.json(result);
  } catch (err) {
    const statusCode = err.message === 'not found' ? 404 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

/**
 * POST /api/admin/delete-story/:id
 * Delete a story (admin action)
 */
router.post('/delete-story/:id', authMiddleware, requireAdmin, async (req, res) => {
  console.log('\n=== ADMIN DELETE STORY REQUEST ===');
  console.log('Story ID:', req.params.id);
  console.log('User email:', req.user.email);
  
  try {
    const result = await adminService.deleteStory(req.params.id);
    res.json(result);
  } catch (err) {
    console.error('Error in admin delete:', err);
    const statusCode = err.message === 'not found' ? 404 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

/**
 * POST /api/admin/ban-user/:id
 * Toggle user ban status
 */
router.post('/ban-user/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const result = await adminService.toggleUserBan(req.params.id);
    res.json(result);
  } catch (err) {
    const statusCode = err.message === 'user not found' ? 404 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user and all their content
 */
router.delete('/users/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const result = await adminService.deleteUser(req.params.id);
    res.json(result);
  } catch (err) {
    const statusCode = err.message === 'user not found' ? 404 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

module.exports = router;
