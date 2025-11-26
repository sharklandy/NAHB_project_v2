const Story = require('../models/Story');
const User = require('../models/User');
const Play = require('../models/Play');

/**
 * Get admin dashboard statistics
 */
async function getStats() {
  const stories = await Story.find();
  const users = await User.find();
  const plays = await Play.find();
  
  console.log('Stats - Stories:', stories.length);
  console.log('Stats - Plays:', plays.length);
  
  const playsByStory = {};
  plays.forEach(p => {
    const id = p.storyId.toString();
    console.log('Play for story:', id);
    playsByStory[id] = (playsByStory[id] || 0) + 1;
  });
  
  console.log('PlaysByStory:', playsByStory);
  
  const storyStats = stories.map(story => {
    const count = playsByStory[story._id.toString()] || 0;
    console.log(`Story ${story.title}: ${count} plays`);
    return {
      id: story._id,
      title: story.title,
      authorId: story.authorId,
      status: story.status,
      playsCount: count
    };
  });
  
  const activeUsers = users.filter(u => !u.banned).length;
  const bannedUsers = users.filter(u => u.banned).length;
  const publishedStories = stories.filter(s => s.status === 'published').length;
  const draftStories = stories.filter(s => s.status === 'draft').length;
  const suspendedStories = stories.filter(s => s.status === 'suspended').length;
  
  return {
    storiesCount: stories.length,
    publishedStories,
    draftStories,
    suspendedStories,
    usersCount: users.length,
    activeUsers,
    bannedUsers,
    playsCount: plays.length,
    playsByStory,
    storyStats
  };
}

/**
 * Get all users with their stats
 */
async function getAllUsers() {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  const stories = await Story.find();
  const plays = await Play.find();
  
  const usersWithStats = users.map(user => {
    const userStories = stories.filter(s => s.authorId === user._id.toString());
    const userPlays = plays.filter(p => p.userId === user._id.toString());
    
    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      banned: user.banned || false,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin || null,
      loginCount: user.loginCount || 0,
      storiesCreated: userStories.length,
      publishedStories: userStories.filter(s => s.status === 'published').length,
      playsCompleted: userPlays.length
    };
  });
  
  return usersWithStats;
}

/**
 * Get detailed user information
 */
async function getUserDetails(userId) {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('user not found');
  }
  
  const stories = await Story.find({ authorId: user._id.toString() });
  const plays = await Play.find({ userId: user._id.toString() });
  
  return {
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      banned: user.banned || false,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin || null,
      loginCount: user.loginCount || 0
    },
    stories: stories.map(s => ({
      _id: s._id,
      title: s.title,
      status: s.status,
      createdAt: s.createdAt,
      pagesCount: s.pages.length
    })),
    playsCount: plays.length,
    recentPlays: plays.slice(-10).reverse()
  };
}

/**
 * Suspend a story
 */
async function suspendStory(storyId) {
  const story = await Story.findById(storyId);
  if (!story) {
    throw new Error('not found');
  }
  
  story.status = 'suspended';
  await story.save();
  return { ok: true };
}

/**
 * Unsuspend a story (publish it)
 */
async function unsuspendStory(storyId) {
  const story = await Story.findById(storyId);
  if (!story) {
    throw new Error('not found');
  }
  
  story.status = 'published';
  await story.save();
  return { ok: true };
}

/**
 * Delete a story (admin action)
 */
async function deleteStory(storyId) {
  const story = await Story.findById(storyId);
  if (!story) {
    throw new Error('not found');
  }
  
  console.log('Deleting story:', story.title);
  await Story.findByIdAndDelete(storyId);
  console.log('Story deleted successfully');
  
  return { ok: true };
}

/**
 * Toggle user ban status
 */
async function toggleUserBan(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('user not found');
  }
  
  user.banned = !user.banned;
  user.bannedAt = user.banned ? new Date() : null;
  await user.save();
  
  return { ok: true, banned: user.banned };
}

/**
 * Delete a user and all their content
 */
async function deleteUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('user not found');
  }
  
  // Delete user's stories and plays
  await Story.deleteMany({ authorId: user._id.toString() });
  await Play.deleteMany({ userId: user._id.toString() });
  await User.findByIdAndDelete(userId);
  
  return { ok: true };
}

module.exports = {
  getStats,
  getAllUsers,
  getUserDetails,
  suspendStory,
  unsuspendStory,
  deleteStory,
  toggleUserBan,
  deleteUser
};
