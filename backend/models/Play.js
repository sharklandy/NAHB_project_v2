const mongoose = require('mongoose');

const playSchema = new mongoose.Schema({
  storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true },
  userId: { type: String, required: true, ref: 'User' },
  endPageId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Play', playSchema);
