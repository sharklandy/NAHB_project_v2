const Rating = require('../models/Rating');
const Story = require('../models/Story');
const User = require('../models/User');

/**
 * Add or update a rating for a story
 */
async function addOrUpdateRating(storyId, userId, rating, comment) {
  // Verify story exists
  const story = await Story.findById(storyId);
  if (!story) {
    throw new Error('story not found');
  }
  
  if (rating < 1 || rating > 5) {
    throw new Error('rating must be between 1 and 5');
  }
  
  // Check if user already rated this story
  let existingRating = await Rating.findOne({ storyId, userId });
  
  if (existingRating) {
    // Update existing rating
    existingRating.rating = rating;
    existingRating.comment = comment || '';
    existingRating.updatedAt = new Date();
    await existingRating.save();
    return existingRating.toJSON();
  } else {
    // Create new rating
    const newRating = await Rating.create({
      storyId,
      userId,
      rating,
      comment: comment || ''
    });
    return newRating.toJSON();
  }
}

/**
 * Get ratings for a story with user information
 */
async function getRatingsForStory(storyId) {
  const ratings = await Rating.find({ storyId }).sort({ createdAt: -1 });
  
  // Get user information for each rating
  const ratingsWithUsers = await Promise.all(
    ratings.map(async (rating) => {
      const user = await User.findById(rating.userId);
      const ratingObj = rating.toJSON();
      ratingObj.username = user ? user.username : 'Utilisateur inconnu';
      return ratingObj;
    })
  );
  
  return ratingsWithUsers;
}

/**
 * Get rating statistics for a story
 */
async function getRatingStatistics(storyId) {
  const ratings = await Rating.find({ storyId });
  
  if (ratings.length === 0) {
    return {
      averageRating: 0,
      totalRatings: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
  
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  const average = sum / ratings.length;
  
  // Calculate distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach(r => {
    distribution[r.rating]++;
  });
  
  return {
    averageRating: parseFloat(average.toFixed(1)),
    totalRatings: ratings.length,
    distribution
  };
}

/**
 * Get user's rating for a story
 */
async function getUserRating(storyId, userId) {
  const rating = await Rating.findOne({ storyId, userId });
  return rating ? rating.toJSON() : null;
}

/**
 * Delete a rating
 */
async function deleteRating(storyId, userId) {
  const result = await Rating.findOneAndDelete({ storyId, userId });
  if (!result) {
    throw new Error('rating not found');
  }
  return { ok: true };
}

/**
 * Get all ratings from a user with story information
 */
async function getUserAllRatings(userId) {
  const ratings = await Rating.find({ userId })
    .populate('storyId', 'title description theme')
    .sort({ createdAt: -1 });
  
  return ratings;
}

/**
 * Get all ratings with user and story information (admin)
 */
async function getAllRatings() {
  const ratings = await Rating.find()
    .populate('storyId', 'title description theme')
    .populate('userId', 'username email')
    .sort({ createdAt: -1 });
  
  return ratings;
}

module.exports = {
  addOrUpdateRating,
  getRatingsForStory,
  getRatingStatistics,
  getUserRating,
  deleteRating,
  getUserAllRatings,
  getAllRatings
};
