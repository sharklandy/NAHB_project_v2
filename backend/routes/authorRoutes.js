const express = require('express');
const router = express.Router();
const authorStatsService = require('../services/authorStatsService');
const { authMiddleware } = require('../middleware/auth');

/**
 * GET /api/author/stories
 * Get all stories by the authenticated author with basic stats
 */
router.get('/stories', authMiddleware, async (req, res) => {
  try {
    const authorId = req.user.id || req.user._id;
    const stories = await authorStatsService.getAuthorStories(authorId);
    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/author/stories/:storyId/stats
 * Get basic statistics for a specific story
 */
router.get('/stories/:storyId/stats', authMiddleware, async (req, res) => {
  try {
    const stats = await authorStatsService.getStoryStats(req.params.storyId, false);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/author/stories/:storyId/advanced-stats
 * Get advanced statistics for a specific story (author only)
 */
router.get('/stories/:storyId/advanced-stats', authMiddleware, async (req, res) => {
  try {
    const authorId = req.user.id || req.user._id;
    const stats = await authorStatsService.getAdvancedStoryStats(req.params.storyId, authorId);
    res.json(stats);
  } catch (err) {
    const statusCode = err.message === 'Story not found' ? 404 : 
                       err.message === 'Not authorized' ? 403 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

module.exports = router;
