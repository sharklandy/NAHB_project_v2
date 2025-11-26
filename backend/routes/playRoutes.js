const express = require('express');
const router = express.Router();
const playService = require('../services/playService');
const { authMiddleware } = require('../middleware/auth');

/**
 * POST /api/play/:storyId/start
 * Start playing a story
 */
router.post('/:storyId/start', authMiddleware, async (req, res) => {
  try {
    const result = await playService.startStory(req.params.storyId);
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
router.post('/:storyId/choose', authMiddleware, async (req, res) => {
  try {
    const { currentPageId, choiceIndex } = req.body;
    const result = await playService.makeChoice(
      req.params.storyId,
      req.user.id,
      currentPageId,
      choiceIndex
    );
    res.json(result);
  } catch (err) {
    const statusCode = err.message === 'story not available' || 
                       err.message === 'page not found' ||
                       err.message === 'choice not found' ? 404 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

module.exports = router;
