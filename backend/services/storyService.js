const Story = require('../models/Story');
const { nanoid } = require('nanoid');
const mongoose = require('mongoose');

/**
 * Get all stories with optional filters
 */
async function getAllStories(publishedOnly, searchQuery, themeFilter) {
  let query = {};
  if (publishedOnly) {
    query.status = 'published';
  }
  
  let stories = await Story.find(query).sort({ createdAt: -1 });
  
  // Apply theme filter (case-insensitive)
  if (themeFilter) {
    const themeLower = themeFilter.toLowerCase();
    stories = stories.filter(s => s.theme && s.theme.toLowerCase() === themeLower);
  }
  
  // Apply search query
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    stories = stories.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      (s.tags || []).join(' ').toLowerCase().includes(q)
    );
  }
  
  return stories.map(s => s.toJSON());
}

/**
 * Get a single story by ID
 */
async function getStoryById(storyId) {
  const story = await Story.findById(storyId);
  if (!story) {
    throw new Error('not found');
  }
  return story.toJSON();
}

/**
 * Create a new story
 */
async function createStory(authorId, title, description, tags) {
  const story = await Story.create({
    title: title || 'Untitled',
    description: description || '',
    tags: tags || [],
    authorId,
    status: 'draft',
    pages: [],
    startPageId: null
  });
  
  console.log('Created story with _id:', story._id, 'toJSON:', story.toJSON());
  return story.toJSON();
}

/**
 * Update an existing story
 */
async function updateStory(storyId, userId, updates) {
  const story = await Story.findById(storyId);
  if (!story) {
    throw new Error('not found');
  }
  
  if (story.authorId !== userId) {
    throw new Error('not owner');
  }
  
  const { title, description, tags, status, startPageId, theme } = updates;
  if (title !== undefined) story.title = title;
  if (description !== undefined) story.description = description;
  if (tags !== undefined) story.tags = tags;
  if (status !== undefined) story.status = status;
  if (startPageId !== undefined) story.startPageId = startPageId;
  if (theme !== undefined) story.theme = theme;
  
  await story.save();
  return story.toJSON();
}

/**
 * Delete a story (owner or admin)
 */
async function deleteStory(storyId, userId, isAdmin) {
  const story = await Story.findById(storyId);
  if (!story) {
    throw new Error('not found');
  }
  
  if (story.authorId !== userId && !isAdmin) {
    throw new Error('not owner');
  }
  
  await Story.findByIdAndDelete(storyId);
  return { ok: true };
}

/**
 * Add a page to a story
 */
async function addPage(storyId, userId, content, isEnd, endLabel) {
  const story = await Story.findById(storyId);
  if (!story) {
    throw new Error('not found');
  }
  
  if (story.authorId !== userId) {
    throw new Error('not owner');
  }
  
  const page = {
    pageId: nanoid(),
    content: content || '',
    isEnd: !!isEnd,
    endLabel: endLabel || '',
    choices: []
  };
  
  story.pages.push(page);
  if (!story.startPageId) {
    story.startPageId = page.pageId;
  }
  
  await story.save();
  return page;
}

/**
 * Update a page in a story
 */
async function updatePage(storyId, pageId, userId, isAdmin, content, isEnd) {
  const story = await Story.findById(storyId);
  if (!story) {
    throw new Error('not found');
  }
  
  if (story.authorId !== userId && !isAdmin) {
    throw new Error('not owner');
  }
  
  const page = story.pages.find(p => p.pageId === pageId);
  if (!page) {
    throw new Error('page not found');
  }
  
  if (content !== undefined) page.content = content;
  if (isEnd !== undefined) page.isEnd = !!isEnd;
  
  await story.save();
  return page;
}

/**
 * Delete a page from a story
 */
async function deletePage(storyId, pageId, userId) {
  const story = await Story.findById(storyId);
  if (!story) {
    throw new Error('not found');
  }
  
  if (story.authorId !== userId) {
    throw new Error('not owner');
  }
  
  story.pages = story.pages.filter(p => p.pageId !== pageId);
  
  // Remove choices pointing to this page
  story.pages.forEach(p => {
    p.choices = p.choices.filter(c => c.to !== pageId);
  });
  
  if (story.startPageId === pageId) {
    story.startPageId = story.pages[0]?.pageId || null;
  }
  
  await story.save();
  return { ok: true };
}

/**
 * Add a choice to a page
 */
async function addChoice(storyId, pageId, userId, text, to) {
  const story = await Story.findById(storyId);
  if (!story) {
    throw new Error('not found');
  }
  
  if (story.authorId !== userId) {
    throw new Error('not owner');
  }
  
  const page = story.pages.find(p => p.pageId === pageId);
  if (!page) {
    throw new Error('page not found');
  }
  
  if (to && !story.pages.find(p => p.pageId === to)) {
    throw new Error('target page not found in this story');
  }
  
  const choice = {
    _id: new mongoose.Types.ObjectId(),
    text: text || '...',
    to: to || null
  };
  
  page.choices.push(choice);
  await story.save();
  return choice;
}

/**
 * Delete a choice from a page
 */
async function deleteChoice(storyId, pageId, choiceId, userId) {
  const story = await Story.findById(storyId);
  if (!story) {
    throw new Error('not found');
  }
  
  if (story.authorId !== userId) {
    throw new Error('not owner');
  }
  
  const page = story.pages.find(p => p.pageId === pageId);
  if (!page) {
    throw new Error('page not found');
  }
  
  page.choices = page.choices.filter(c => c._id.toString() !== choiceId);
  
  await story.save();
  return { ok: true };
}

module.exports = {
  getAllStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
  addPage,
  updatePage,
  deletePage,
  addChoice,
  deleteChoice
};
