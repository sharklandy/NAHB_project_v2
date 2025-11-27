const express = require('express');
const router = express.Router();
const playService = require('../services/playService');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth');

/**
 * POST /api/play/:storyId/start
 * Start playing a story
 */
router.post('/:storyId/start', optionalAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const result = await playService.startStory(req.params.storyId, userId);
    res.json(result);
  } catch (err) {
    const statusCode = err.message === 'story not available' ? 404 :
                       err.message === 'start page not set' ? 400 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

/**
 * POST /api/play/:storyId/choose
 * Make a choice in a story
 */
router.post('/:storyId/choose', optionalAuthMiddleware, async (req, res) => {
  try {
    const { currentPageId, choiceIndex, playId } = req.body;
    const userId = req.user ? req.user.id : null;
    const result = await playService.makeChoice(
      req.params.storyId,
      userId,
      currentPageId,
      choiceIndex,
      playId
    );
    res.json(result);
  } catch (err) {
    const statusCode = err.message === 'story not available' || 
                       err.message === 'page not found' ||
                       err.message === 'choice not found' ? 404 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

/**
 * GET /api/play/:storyId/statistics
 * Get statistics for a story
 */
router.get('/:storyId/statistics', async (req, res) => {
  try {
    const stats = await playService.getStoryStatistics(req.params.storyId);
    res.json(stats);
  } catch (err) {
    const statusCode = err.message === 'story not found' ? 404 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

/**
 * POST /api/play/:storyId/path-stats
 * Get path similarity statistics
 */
router.post('/:storyId/path-stats', optionalAuthMiddleware, async (req, res) => {
  try {
    const { endPageId, userPath } = req.body;
    const stats = await playService.getPathStatistics(
      req.params.storyId,
      endPageId,
      userPath
    );
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/play/:storyId/endings
 * Get user's unlocked endings for a story
 */
router.get('/:storyId/endings', optionalAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const endings = await playService.getUserEndings(req.params.storyId, userId);
    res.json(endings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
