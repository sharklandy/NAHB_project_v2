const express = require('express');
const router = express.Router();
const reportService = require('../services/reportService');
const { authMiddleware, isAdmin } = require('../middleware/auth');

/**
 * POST /api/reports/:storyId
 * Create a report for a story
 */
router.post('/:storyId', authMiddleware, async (req, res) => {
  try {
    const { reason, description } = req.body;
    const report = await reportService.createReport(
      req.params.storyId,
      req.user.id,
      reason,
      description
    );
    res.json(report);
  } catch (err) {
    const statusCode = err.message === 'story not found' ? 404 :
                       err.message === 'invalid reason' ? 400 :
                       err.message === 'already reported' ? 409 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

/**
 * GET /api/reports
 * Get all reports (admin only)
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const admin = await isAdmin(req.user.email);
    if (!admin) {
      return res.status(403).json({ error: 'admin only' });
    }
    
    const status = req.query.status;
    const reports = await reportService.getAllReports(status);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/reports/story/:storyId
 * Get reports for a specific story (admin only)
 */
router.get('/story/:storyId', authMiddleware, async (req, res) => {
  try {
    const admin = await isAdmin(req.user.email);
    if (!admin) {
      return res.status(403).json({ error: 'admin only' });
    }
    
    const reports = await reportService.getReportsForStory(req.params.storyId);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/reports/:reportId
 * Update report status (admin only)
 */
router.put('/:reportId', authMiddleware, async (req, res) => {
  try {
    const admin = await isAdmin(req.user.email);
    if (!admin) {
      return res.status(403).json({ error: 'admin only' });
    }
    
    const { status } = req.body;
    const report = await reportService.updateReportStatus(
      req.params.reportId,
      status,
      req.user.id
    );
    res.json(report);
  } catch (err) {
    const statusCode = err.message === 'report not found' ? 404 :
                       err.message === 'invalid status' ? 400 : 500;
    res.status(statusCode).json({ error: err.message });
  }
});

module.exports = router;
