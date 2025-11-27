const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

/**
 * Middleware to authenticate user via JWT token
 */
function authMiddleware(req, res, next) {
  console.log('AuthMiddleware - Method:', req.method, 'Path:', req.path);
  const header = req.headers.authorization;
  if (!header) {
    console.log('AuthMiddleware - Missing authorization header');
    return res.status(401).json({ error: 'Missing Authorization header' });
  }
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    console.log('AuthMiddleware - Token verified, payload:', payload);
    req.user = payload;
    next();
  } catch (e) {
    console.log('AuthMiddleware - Token verification failed:', e.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Middleware d'authentification optionnelle
 * N'échoue pas si pas de token, mais l'ajoute si présent
 */
function optionalAuthMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    req.user = null;
    return next();
  }
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
  } catch (e) {
    req.user = null;
  }
  next();
}

/**
 * Check if a user email is an admin
 */
async function isAdmin(email) {
  const admin = await Admin.findOne({ email });
  return !!admin;
}

/**
 * Middleware to require admin privileges
 */
async function requireAdmin(req, res, next) {
  try {
    const admin = await isAdmin(req.user.email);
    if (!admin) {
      return res.status(403).json({ error: 'admin only' });
    }
    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  isAdmin,
  requireAdmin,
  JWT_SECRET
};
