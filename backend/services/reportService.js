const Report = require('../models/Report');
const Story = require('../models/Story');

/**
 * Create a report for a story
 */
async function createReport(storyId, userId, reason, description) {
  // Verify story exists
  const story = await Story.findById(storyId);
  if (!story) {
    throw new Error('story not found');
  }
  
  const validReasons = ['inappropriate', 'offensive', 'spam', 'copyright', 'other'];
  if (!validReasons.includes(reason)) {
    throw new Error('invalid reason');
  }
  
  // Check if user already reported this story
  const existingReport = await Report.findOne({ 
    storyId, 
    userId,
    status: { $in: ['pending', 'reviewed'] }
  });
  
  if (existingReport) {
    throw new Error('already reported');
  }
  
  const report = await Report.create({
    storyId,
    userId,
    reason,
    description: description || ''
  });
  
  return report.toJSON();
}

/**
 * Get all reports (admin only)
 */
async function getAllReports(status) {
  let query = {};
  if (status) {
    query.status = status;
  }
  
  const reports = await Report.find(query)
    .sort({ createdAt: -1 })
    .populate('storyId', 'title description');
  
  return reports.map(r => r.toJSON());
}

/**
 * Get reports for a specific story (admin only)
 */
async function getReportsForStory(storyId) {
  const reports = await Report.find({ storyId }).sort({ createdAt: -1 });
  return reports.map(r => r.toJSON());
}

/**
 * Update report status (admin only)
 */
async function updateReportStatus(reportId, status, reviewedBy) {
  const validStatuses = ['pending', 'reviewed', 'resolved', 'dismissed'];
  if (!validStatuses.includes(status)) {
    throw new Error('invalid status');
  }
  
  const report = await Report.findById(reportId);
  if (!report) {
    throw new Error('report not found');
  }
  
  report.status = status;
  report.reviewedAt = new Date();
  report.reviewedBy = reviewedBy;
  
  await report.save();
  return report.toJSON();
}

/**
 * Get report count by story
 */
async function getReportCountForStory(storyId) {
  const count = await Report.countDocuments({ 
    storyId,
    status: { $in: ['pending', 'reviewed'] }
  });
  return count;
}

module.exports = {
  createReport,
  getAllReports,
  getReportsForStory,
  updateReportStatus,
  getReportCountForStory
};
