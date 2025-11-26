const Story = require('../models/Story');
const Play = require('../models/Play');

/**
 * Start playing a story
 */
async function startStory(storyId) {
  const story = await Story.findById(storyId);
  console.log('Story found:', story ? `${story.title} (status: ${story.status})` : 'null');
  
  if (!story || story.status !== 'published') {
    throw new Error('story not available');
  }
  
  const start = story.pages.find(p => p.pageId === story.startPageId);
  if (!start) {
    throw new Error('start page not set');
  }
  
  return { page: start };
}

/**
 * Make a choice in a story
 */
async function makeChoice(storyId, userId, currentPageId, choiceIndex) {
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
  
  // Register play if reaching an end
  if (next && next.isEnd) {
    await Play.create({
      storyId: story._id,
      userId: userId,
      endPageId: next.pageId
    });
  }
  
  return { page: next || null };
}

module.exports = {
  startStory,
  makeChoice
};
