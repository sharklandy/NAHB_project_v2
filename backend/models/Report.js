const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true },
  userId: { type: String, required: true, ref: 'User' },
  reason: { 
    type: String, 
    required: true,
    enum: ['inappropriate', 'offensive', 'spam', 'copyright', 'other']
  },
  description: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date, default: null },
  reviewedBy: { type: String, ref: 'User', default: null }
});

// Index pour recherche rapide
reportSchema.index({ storyId: 1, status: 1 });
reportSchema.index({ status: 1, createdAt: -1 });

// Transform to JSON
reportSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Report', reportSchema);
