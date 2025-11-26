const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

/**
 * Register a new user
 */
async function register(username, email, password) {
  if (!email || !password) {
    throw new Error('email and password required');
  }
  
  const exists = await User.findOne({ email });
  if (exists) {
    throw new Error('email exists');
  }
  
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    username: username || email.split('@')[0],
    email,
    password: hashed
  });
  
  const token = jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET);
  
  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email
    }
  };
}

/**
 * Login existing user
 */
async function login(email, password) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('invalid credentials');
  }
  
  if (user.banned) {
    throw new Error('user is banned');
  }
  
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    throw new Error('invalid credentials');
  }
  
  // Track login
  user.lastLogin = new Date();
  user.loginCount = (user.loginCount || 0) + 1;
  await user.save();
  
  const token = jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET);
  
  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email
    }
  };
}

module.exports = {
  register,
  login
};
