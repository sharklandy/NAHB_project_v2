const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  banned: { type: Boolean, default: false },
  bannedAt: { type: Date, default: null },
  lastLogin: { type: Date, default: null },
  loginCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Transform _id to id in JSON
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password; // Never expose password
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
