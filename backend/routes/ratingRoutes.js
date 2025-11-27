const express = require('express');
const router = express.Router();
const ratingService = require('../services/ratingService');
const { authMiddleware } = require('../middleware/auth');

/**
 * POST /api/ratings/:storyId
 * Add or update a rating for a story
 */
router.post('/:storyId', authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const result = await ratingService.addOrUpdateRating(
      req.params.storyId,
      req.user.id,
      rating,
      comment
    );
    res.json(result);
  } catch (err) {
    const statusCode = err.message === 'story not found' ? 404 :
                       err.message === 'rating must be between 1 and 5' ? 400 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

/**
 * GET /api/ratings/:storyId
 * Get all ratings for a story
 */
router.get('/:storyId', async (req, res) => {
  try {
    const ratings = await ratingService.getRatingsForStory(req.params.storyId);
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/ratings/:storyId/statistics
 * Get rating statistics for a story
 */
router.get('/:storyId/statistics', async (req, res) => {
  try {
    const stats = await ratingService.getRatingStatistics(req.params.storyId);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/ratings/:storyId/user
 * Get user's rating for a story
 */
router.get('/:storyId/user', authMiddleware, async (req, res) => {
  try {
    const rating = await ratingService.getUserRating(req.params.storyId, req.user.id);
    res.json(rating);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/ratings/:storyId
 * Delete user's rating for a story
 */
router.delete('/:storyId', authMiddleware, async (req, res) => {
  try {
    const result = await ratingService.deleteRating(req.params.storyId, req.user.id);
    res.json(result);
  } catch (err) {
    const statusCode = err.message === 'rating not found' ? 404 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

module.exports = router;
