const Story = require('../models/Story');
const Play = require('../models/Play');
const Rating = require('../models/Rating');

/**
 * Get all stories by an author with basic stats
 */
async function getAuthorStories(authorId) {
  const stories = await Story.find({ authorId }).sort({ createdAt: -1 });
  
  const storiesWithStats = await Promise.all(
    stories.map(async (story) => {
      const stats = await getStoryStats(story._id, false);
      return {
        ...story.toJSON(),
        stats
      };
    })
  );
  
  return storiesWithStats;
}

/**
 * Get detailed statistics for a specific story
 */
async function getStoryStats(storyId, includePreview = false) {
  // Query filter: exclude preview plays unless explicitly included
  const playFilter = { storyId, isPreview: includePreview ? undefined : false };
  
  // Total plays (completed and in progress, excluding abandoned)
  const totalPlays = await Play.countDocuments({
    ...playFilter,
    isAbandoned: false
  });
  
  // Completed plays
  const completedPlays = await Play.countDocuments({
    ...playFilter,
    isCompleted: true,
    isAbandoned: false
  });
  
  // Abandoned plays (started but not completed)
  const abandonedPlays = await Play.countDocuments({
    ...playFilter,
    isAbandoned: true
  });
  
  // In progress plays (not completed, not abandoned)
  const inProgressPlays = await Play.countDocuments({
    ...playFilter,
    isCompleted: false,
    isAbandoned: false
  });
  
  // Completion rate
  const completionRate = totalPlays > 0 ? (completedPlays / totalPlays) * 100 : 0;
  
  // Get average rating
  const ratings = await Rating.find({ storyId });
  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;
  
  // Distribution by ending
  const story = await Story.findById(storyId);
  const endPages = story ? story.pages.filter(p => p.isEnd) : [];
  
  const endDistribution = await Promise.all(
    endPages.map(async (endPage, idx) => {
      const count = await Play.countDocuments({
        ...playFilter,
        endPageId: endPage.pageId,
        isCompleted: true
      });
      // If author didn't provide an endLabel, generate a numbered label per story
      const generatedLabel = `Fin ${idx + 1}`;
      // Treat legacy placeholder 'Fin sans label' as empty and replace with generated label
      const rawLabel = endPage.endLabel ? endPage.endLabel.trim() : '';
      const isDefaultPlaceholder = rawLabel.toLowerCase() === 'fin sans label';
      return {
        endPageId: endPage.pageId,
        endLabel: (rawLabel && !isDefaultPlaceholder) ? rawLabel : generatedLabel,
        count,
        percentage: completedPlays > 0 ? (count / completedPlays) * 100 : 0
      };
    })
  );
  
  return {
    totalPlays,
    completedPlays,
    abandonedPlays,
    inProgressPlays,
    completionRate: Math.round(completionRate * 100) / 100,
    avgRating: Math.round(avgRating * 10) / 10,
    totalRatings: ratings.length,
    endDistribution: endDistribution.sort((a, b) => b.count - a.count)
  };
}

/**
 * Get advanced statistics for a story (detailed analysis)
 */
async function getAdvancedStoryStats(storyId, authorId) {
  const story = await Story.findById(storyId);
  
  if (!story) {
    throw new Error('Story not found');
  }
  
  if (story.authorId !== authorId) {
    throw new Error('Not authorized');
  }
  
  const basicStats = await getStoryStats(storyId, false);
  
  // Get most visited pages
  const allPlays = await Play.find({ storyId, isPreview: false });
  const pageVisits = {};
  
  allPlays.forEach(play => {
    play.path.forEach(pageId => {
      pageVisits[pageId] = (pageVisits[pageId] || 0) + 1;
    });
  });
  
  const mostVisitedPages = Object.entries(pageVisits)
    .map(([pageId, visits]) => {
      const page = story.pages.find(p => p.pageId === pageId);
      return {
        pageId,
        // Return full content so front-end can decide how to display it (no forced truncation)
        content: page ? page.content : 'Page supprimée',
        visits
      };
    })
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10);
  
  // Get average path length
  const pathLengths = allPlays
    .filter(p => p.isCompleted)
    .map(p => p.path.length);
  
  const avgPathLength = pathLengths.length > 0
    ? pathLengths.reduce((sum, len) => sum + len, 0) / pathLengths.length
    : 0;
  
  // Get play duration (for completed plays)
  const completedWithDuration = allPlays
    .filter(p => p.isCompleted && p.completedAt)
    .map(p => {
      const duration = (new Date(p.completedAt) - new Date(p.createdAt)) / 1000 / 60; // minutes
      return duration;
    });
  
  const avgDuration = completedWithDuration.length > 0
    ? completedWithDuration.reduce((sum, d) => sum + d, 0) / completedWithDuration.length
    : 0;
  
  return {
    ...basicStats,
    mostVisitedPages,
    avgPathLength: Math.round(avgPathLength * 10) / 10,
    avgDuration: Math.round(avgDuration * 10) / 10, // in minutes
    totalUniqueReaders: new Set(allPlays.map(p => p.userId)).size
  };
}

module.exports = {
  getAuthorStories,
  getStoryStats,
  getAdvancedStoryStats
};
