const mongoose = require('mongoose');

const choiceSchema = new mongoose.Schema({
  text: { type: String, required: true },
  to: { type: String, default: null } // pageId
}, { _id: true });

const pageSchema = new mongoose.Schema({
  pageId: { type: String, required: true },
  content: { type: String, required: true },
  isEnd: { type: Boolean, default: false },
  choices: [choiceSchema]
}, { _id: false });

const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  tags: [{ type: String }],
  authorId: { type: String, required: true, ref: 'User' },
  status: { type: String, enum: ['draft', 'published', 'suspended'], default: 'draft' },
  pages: [pageSchema],
  startPageId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

// Transform _id to id in JSON
storySchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Story', storySchema);
