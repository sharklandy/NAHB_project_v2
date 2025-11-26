const express = require('express');
const router = express.Router();
const storyService = require('../services/storyService');
const { authMiddleware, isAdmin } = require('../middleware/auth');

/**
 * GET /api/stories
 * Get all stories (with optional filters)
 */
router.get('/', async (req, res) => {
  try {
    const publishedOnly = req.query.published === '1';
    const searchQuery = req.query.q || '';
    const stories = await storyService.getAllStories(publishedOnly, searchQuery);
    console.log('GET /api/stories - returning', stories.length, 'stories. First story has _id:', stories[0]?._id);
    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/stories/:id
 * Get a single story by ID
 */
router.get('/:id', async (req, res) => {
  try {
    console.log('GET /api/stories/:id - Param ID:', req.params.id);
    const story = await storyService.getStoryById(req.params.id);
    console.log('Story found:', story ? story.title : 'null');
    res.json(story);
  } catch (err) {
    console.log('Error in GET /api/stories/:id:', err.message);
    const statusCode = err.message === 'not found' ? 404 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

/**
 * POST /api/stories
 * Create a new story
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const story = await storyService.createStory(req.user.id, title, description, tags);
    res.json(story);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/stories/:id
 * Update a story
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const story = await storyService.updateStory(req.params.id, req.user.id, req.body);
    res.json(story);
  } catch (err) {
    const statusCode = err.message === 'not found' ? 404 : 
                       err.message === 'not owner' ? 403 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

/**
 * DELETE /api/stories/:id
 * Delete a story (owner or admin)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  console.log('\n=== DELETE STORY REQUEST ===');
  console.log('Story ID:', req.params.id);
  try {
    console.log('Delete story - User:', req.user);
    console.log('Delete story - User email:', req.user.email);
    
    const admin = await isAdmin(req.user.email);
    console.log('Is admin:', admin);
    
    const userId = req.user.id || req.user._id;
    const result = await storyService.deleteStory(req.params.id, userId, admin);
    res.json(result);
  } catch (err) {
    console.error('Error deleting story:', err);
    const statusCode = err.message === 'not found' ? 404 : 
                       err.message === 'not owner' ? 403 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

/**
 * POST /api/stories/:id/pages
 * Add a page to a story
 */
router.post('/:id/pages', authMiddleware, async (req, res) => {
  try {
    const { content, isEnd } = req.body;
    const page = await storyService.addPage(req.params.id, req.user.id, content, isEnd);
    res.json(page);
  } catch (err) {
    const statusCode = err.message === 'not found' ? 404 : 
                       err.message === 'not owner' ? 403 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

/**
 * PUT /api/stories/:id/pages/:pageId
 * Update a page in a story
 */
router.put('/:id/pages/:pageId', authMiddleware, async (req, res) => {
  try {
    const admin = await isAdmin(req.user.email);
    const { content, isEnd } = req.body;
    const page = await storyService.updatePage(
      req.params.id,
      req.params.pageId,
      req.user.id,
      admin,
      content,
      isEnd
    );
    res.json(page);
  } catch (err) {
    const statusCode = err.message === 'not found' || err.message === 'page not found' ? 404 : 
                       err.message === 'not owner' ? 403 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

/**
 * DELETE /api/stories/:id/pages/:pageId
 * Delete a page from a story
 */
router.delete('/:id/pages/:pageId', authMiddleware, async (req, res) => {
  try {
    const result = await storyService.deletePage(req.params.id, req.params.pageId, req.user.id);
    res.json(result);
  } catch (err) {
    const statusCode = err.message === 'not found' ? 404 : 
                       err.message === 'not owner' ? 403 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

/**
 * POST /api/stories/:id/pages/:pageId/choices
 * Add a choice to a page
 */
router.post('/:id/pages/:pageId/choices', authMiddleware, async (req, res) => {
  try {
    const { text, to } = req.body;
    const choice = await storyService.addChoice(req.params.id, req.params.pageId, req.user.id, text, to);
    res.json(choice);
  } catch (err) {
    const statusCode = err.message === 'not found' || err.message === 'page not found' ? 404 : 
                       err.message === 'not owner' ? 403 :
                       err.message === 'target page not found in this story' ? 400 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

/**
 * DELETE /api/stories/:id/pages/:pageId/choices/:choiceId
 * Delete a choice from a page
 */
router.delete('/:id/pages/:pageId/choices/:choiceId', authMiddleware, async (req, res) => {
  try {
    const result = await storyService.deleteChoice(
      req.params.id,
      req.params.pageId,
      req.params.choiceId,
      req.user.id
    );
    res.json(result);
  } catch (err) {
    const statusCode = err.message === 'not found' || err.message === 'page not found' ? 404 : 
                       err.message === 'not owner' ? 403 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

module.exports = router;
