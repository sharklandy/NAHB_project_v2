const Story = require('../models/Story');
const Play = require('../models/Play');

/**
 * Start playing a story
 */
async function startStory(storyId, userId) {
  const story = await Story.findById(storyId);
  console.log('Story found:', story ? `${story.title} (status: ${story.status})` : 'null');
  
  if (!story || story.status !== 'published') {
    throw new Error('story not available');
  }
  
  const start = story.pages.find(p => p.pageId === story.startPageId);
  if (!start) {
    throw new Error('start page not set');
  }
  
  // Si pas d'utilisateur connecté, retourner juste la première page sans sauvegarder
  if (!userId) {
    return { page: start, savedGame: false, playId: null };
  }
  
  // Check for existing saved game
  const savedGame = await Play.findOne({
    storyId: story._id,
    userId: userId,
    isCompleted: false
  }).sort({ createdAt: -1 });
  
  if (savedGame && savedGame.currentPageId) {
    const savedPage = story.pages.find(p => p.pageId === savedGame.currentPageId);
    if (savedPage) {
      return { page: savedPage, savedGame: true, playId: savedGame._id };
    }
  }
  
  // Create new play session
  const newPlay = await Play.create({
    storyId: story._id,
    userId: userId,
    path: [story.startPageId],
    currentPageId: story.startPageId,
    isCompleted: false
  });
  
  return { page: start, savedGame: false, playId: newPlay._id };
}

/**
 * Make a choice in a story
 */
async function makeChoice(storyId, userId, currentPageId, choiceIndex, playId) {
  const story = await Story.findById(storyId);
  
  if (!story || story.status !== 'published') {
    throw new Error('story not available');
  }
  
  const page = story.pages.find(p => p.pageId === currentPageId);
  if (!page) {
    throw new Error('page not found');
  }
  
  if (choiceIndex < 0 || choiceIndex >= page.choices.length) {
    throw new Error('choice not found');
  }
  
  const choice = page.choices[choiceIndex];
  const next = story.pages.find(p => p.pageId === choice.to);
  
  if (!next) {
    throw new Error('next page not found');
  }
  
  // Si pas d'utilisateur connecté, retourner juste la page suivante
  if (!userId) {
    return { page: next };
  }
  
  // Update or create play session
  let play = playId ? await Play.findById(playId) : null;
  
  if (!play) {
    play = await Play.create({
      storyId: story._id,
      userId: userId,
      path: [currentPageId, next.pageId],
      currentPageId: next.pageId,
      isCompleted: false
    });
  } else {
    play.path.push(next.pageId);
    play.currentPageId = next.pageId;
    
    // If reaching an end, mark as completed
    if (next.isEnd) {
      play.isCompleted = true;
      play.endPageId = next.pageId;
      play.completedAt = new Date();
    }
    
    await play.save();
  }
  
  return { page: next, playId: play._id };
}

/**
 * Get statistics for a story
 */
async function getStoryStatistics(storyId) {
  const story = await Story.findById(storyId);
  if (!story) {
    throw new Error('story not found');
  }
  
  // Total plays completed
  const totalPlays = await Play.countDocuments({ storyId: story._id, isCompleted: true });
  
  // Statistics by ending
  const endings = story.pages.filter(p => p.isEnd);
  const endingStats = await Promise.all(
    endings.map(async (ending) => {
      const count = await Play.countDocuments({
        storyId: story._id,
        endPageId: ending.pageId,
        isCompleted: true
      });
      
      // Create a better label for endings without endLabel
      let label = ending.endLabel;
      if (!label || label.trim() === '') {
        // Use first 50 characters of content as label
        label = ending.content ? ending.content.substring(0, 50).trim() + '...' : 'Fin alternative';
      }
      
      return {
        pageId: ending.pageId,
        label: label,
        count: count,
        percentage: totalPlays > 0 ? ((count / totalPlays) * 100).toFixed(1) : 0
      };
    })
  );
  
  return {
    totalPlays,
    endings: endingStats
  };
}

/**
 * Get path statistics for a specific ending
 */
async function getPathStatistics(storyId, endPageId, userPath) {
  const plays = await Play.find({
    storyId: storyId,
    endPageId: endPageId,
    isCompleted: true
  });
  
  if (plays.length === 0) {
    return { similarityPercentage: 0, totalPlays: 0 };
  }
  
  // Calculate similarity
  let totalSimilarity = 0;
  plays.forEach(play => {
    const commonPages = userPath.filter(pageId => play.path.includes(pageId));
    const similarity = (commonPages.length / userPath.length) * 100;
    totalSimilarity += similarity;
  });
  
  const avgSimilarity = totalSimilarity / plays.length;
  
  return {
    similarityPercentage: avgSimilarity.toFixed(1),
    totalPlays: plays.length
  };
}

/**
 * Get user's unlocked endings for a story
 */
async function getUserEndings(storyId, userId) {
  // Si pas d'utilisateur connecté, retourner un tableau vide
  if (!userId) {
    return [];
  }
  
  const plays = await Play.find({
    storyId: storyId,
    userId: userId,
    isCompleted: true
  }).distinct('endPageId');
  
  const story = await Story.findById(storyId);
  if (!story) {
    return [];
  }
  
  return story.pages
    .filter(p => p.isEnd && plays.includes(p.pageId))
    .map(p => ({
      pageId: p.pageId,
      label: p.endLabel || 'Fin sans nom',
      content: p.content
    }));
}

module.exports = {
  startStory,
  makeChoice,
  getStoryStatistics,
  getPathStatistics,
  getUserEndings
};
