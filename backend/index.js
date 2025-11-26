const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');

const User = require('./models/User');
const Story = require('./models/Story');
const Play = require('./models/Play');
const Admin = require('./models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nahb';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('✅ Connected to MongoDB');
  
  // Create default admin if not exists
  const adminExists = await Admin.findOne({ email: 'admin@nahb.local' });
  if (!adminExists) {
    await Admin.create({ email: 'admin@nahb.local' });
    console.log('✅ Default admin created');
  }
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// --- Helpers ---
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

async function isAdmin(email) {
  const admin = await Admin.findOne({ email });
  return !!admin;
}

// --- Auth ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'email exists' });
    
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username || email.split('@')[0],
      email,
      password: hashed
    });
    
    const token = jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'invalid credentials' });
    if (user.banned) return res.status(403).json({ error: 'user is banned' });
    
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'invalid credentials' });
    
    // Track login
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();
    
    const token = jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Stories CRUD ---
app.post('/api/stories', authMiddleware, async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const story = await Story.create({
      title: title || 'Untitled',
      description: description || '',
      tags: tags || [],
      authorId: req.user.id,
      status: 'draft',
      pages: [],
      startPageId: null
    });
    console.log('Created story with _id:', story._id, 'toJSON:', story.toJSON());
    const storyJson = story.toJSON();
    res.json(storyJson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stories', async (req, res) => {
  try {
    const publishedOnly = req.query.published === '1';
    const q = (req.query.q || '').toLowerCase();
    
    let query = {};
    if (publishedOnly) query.status = 'published';
    
    let stories = await Story.find(query).sort({ createdAt: -1 });
    
    if (q) {
      stories = stories.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.tags || []).join(' ').toLowerCase().includes(q)
      );
    }
    
    console.log('GET /api/stories - returning', stories.length, 'stories. First story has _id:', stories[0]?._id);
    const storiesJson = stories.map(s => s.toJSON());
    res.json(storiesJson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stories/:id', async (req, res) => {
  try {
    console.log('GET /api/stories/:id - Param ID:', req.params.id);
    const story = await Story.findById(req.params.id);
    console.log('Story found:', story ? story.title : 'null');
    if (!story) return res.status(404).json({ error: 'not found' });
    const storyJson = story.toJSON();
    res.json(storyJson);
  } catch (err) {
    console.log('Error in GET /api/stories/:id:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/stories/:id', authMiddleware, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'not found' });
    if (story.authorId !== req.user.id) return res.status(403).json({ error: 'not owner' });
    
    const { title, description, tags, status, startPageId } = req.body;
    if (title !== undefined) story.title = title;
    if (description !== undefined) story.description = description;
    if (tags !== undefined) story.tags = tags;
    if (status !== undefined) story.status = status;
    if (startPageId !== undefined) story.startPageId = startPageId;
    
    await story.save();
    const storyJson = story.toJSON();
    res.json(storyJson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/stories/:id', authMiddleware, async (req, res) => {
  console.log('\n=== DELETE STORY REQUEST ===');
  console.log('Story ID:', req.params.id);
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      console.log('Story not found');
      return res.status(404).json({ error: 'not found' });
    }
    
    console.log('Delete story - User:', req.user);
    console.log('Delete story - Story authorId:', story.authorId);
    console.log('Delete story - User email:', req.user.email);
    
    // Autoriser l'admin à supprimer n'importe quelle histoire
    const admin = await isAdmin(req.user.email);
    console.log('Is admin:', admin);
    
    const userId = req.user.id || req.user._id;
    if (story.authorId !== userId && !admin) {
      return res.status(403).json({ error: 'not owner' });
    }
    
    await Story.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error deleting story:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Pages ---
app.post('/api/stories/:id/pages', authMiddleware, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'not found' });
    if (story.authorId !== req.user.id) return res.status(403).json({ error: 'not owner' });
    
    const { content, isEnd } = req.body;
    const page = {
      pageId: nanoid(),
      content: content || '',
      isEnd: !!isEnd,
      choices: []
    };
    
    story.pages.push(page);
    if (!story.startPageId) story.startPageId = page.pageId;
    
    await story.save();
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/stories/:id/pages/:pageId', authMiddleware, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'not found' });
    // Autoriser l'admin à modifier toutes les histoires
    const admin = await Admin.findOne({ userId: req.user.id });
    if (story.authorId !== req.user.id && !admin) return res.status(403).json({ error: 'not owner' });
    
    const page = story.pages.find(p => p.pageId === req.params.pageId);
    if (!page) return res.status(404).json({ error: 'page not found' });
    
    const { content, isEnd } = req.body;
    if (content !== undefined) page.content = content;
    if (isEnd !== undefined) page.isEnd = !!isEnd;
    
    await story.save();
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/stories/:id/pages/:pageId', authMiddleware, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'not found' });
    if (story.authorId !== req.user.id) return res.status(403).json({ error: 'not owner' });
    
    story.pages = story.pages.filter(p => p.pageId !== req.params.pageId);
    
    // Remove choices pointing to this page
    story.pages.forEach(p => {
      p.choices = p.choices.filter(c => c.to !== req.params.pageId);
    });
    
    if (story.startPageId === req.params.pageId) {
      story.startPageId = story.pages[0]?.pageId || null;
    }
    
    await story.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Choices ---
app.post('/api/stories/:id/pages/:pageId/choices', authMiddleware, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'not found' });
    if (story.authorId !== req.user.id) return res.status(403).json({ error: 'not owner' });
    
    const page = story.pages.find(p => p.pageId === req.params.pageId);
    if (!page) return res.status(404).json({ error: 'page not found' });
    
    const { text, to } = req.body;
    if (to && !story.pages.find(p => p.pageId === to)) {
      return res.status(400).json({ error: 'target page not found in this story' });
    }
    
    const choice = {
      _id: new mongoose.Types.ObjectId(),
      text: text || '...',
      to: to || null
    };
    
    page.choices.push(choice);
    await story.save();
    res.json(choice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/stories/:id/pages/:pageId/choices/:choiceId', authMiddleware, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'not found' });
    if (story.authorId !== req.user.id) return res.status(403).json({ error: 'not owner' });
    
    const page = story.pages.find(p => p.pageId === req.params.pageId);
    if (!page) return res.status(404).json({ error: 'page not found' });
    
    page.choices = page.choices.filter(c => c._id.toString() !== req.params.choiceId);
    
    await story.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Play ---
app.post('/api/play/:storyId/start', authMiddleware, async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId);
    console.log('Story found:', story ? `${story.title} (status: ${story.status})` : 'null');
    if (!story || story.status !== 'published') {
      return res.status(404).json({ error: 'story not available' });
    }
    
    const start = story.pages.find(p => p.pageId === story.startPageId);
    if (!start) return res.status(400).json({ error: 'start page not set' });
    
    res.json({ page: start });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/play/:storyId/choose', authMiddleware, async (req, res) => {
  try {
    const { currentPageId, choiceIndex } = req.body;
    const story = await Story.findById(req.params.storyId);
    
    if (!story || story.status !== 'published') {
      return res.status(404).json({ error: 'story not available' });
    }
    
    const page = story.pages.find(p => p.pageId === currentPageId);
    if (!page) return res.status(404).json({ error: 'page not found' });
    
    if (choiceIndex < 0 || choiceIndex >= page.choices.length) {
      return res.status(404).json({ error: 'choice not found' });
    }
    
    const choice = page.choices[choiceIndex];
    const next = story.pages.find(p => p.pageId === choice.to);
    
    // Register play if reaching an end
    if (next && next.isEnd) {
      await Play.create({
        storyId: story._id,
        userId: req.user.id,
        endPageId: next.pageId
      });
    }
    
    res.json({ page: next || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Admin ---
app.get('/api/admin/stats', authMiddleware, async (req, res) => {
  try {
    const admin = await isAdmin(req.user.email);
    if (!admin) return res.status(403).json({ error: 'admin only' });
    
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
    
    res.json({
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
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/users', authMiddleware, async (req, res) => {
  try {
    const admin = await isAdmin(req.user.email);
    if (!admin) return res.status(403).json({ error: 'admin only' });
    
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
    
    res.json(usersWithStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/suspend-story/:id', authMiddleware, async (req, res) => {
  try {
    const admin = await isAdmin(req.user.email);
    if (!admin) return res.status(403).json({ error: 'admin only' });
    
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'not found' });
    
    story.status = 'suspended';
    await story.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Unsuspend story (remettre en ligne)
app.post('/api/admin/unsuspend-story/:id', authMiddleware, async (req, res) => {
  try {
    const admin = await isAdmin(req.user.email);
    if (!admin) return res.status(403).json({ error: 'admin only' });
    
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'not found' });
    
    story.status = 'published';
    await story.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Delete any story
app.post('/api/admin/delete-story/:id', authMiddleware, async (req, res) => {
  console.log('\n=== ADMIN DELETE STORY REQUEST ===');
  console.log('Story ID:', req.params.id);
  console.log('User email:', req.user.email);
  
  try {
    const admin = await isAdmin(req.user.email);
    console.log('Is admin:', admin);
    
    if (!admin) {
      console.log('User is not admin - rejecting');
      return res.status(403).json({ error: 'admin only' });
    }
    
    const story = await Story.findById(req.params.id);
    if (!story) {
      console.log('Story not found');
      return res.status(404).json({ error: 'not found' });
    }
    
    console.log('Deleting story:', story.title);
    await Story.findByIdAndDelete(req.params.id);
    console.log('Story deleted successfully');
    
    res.json({ ok: true });
  } catch (err) {
    console.error('Error in admin delete:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/users/:id', authMiddleware, async (req, res) => {
  try {
    const admin = await isAdmin(req.user.email);
    if (!admin) return res.status(403).json({ error: 'admin only' });
    
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'user not found' });
    
    const stories = await Story.find({ authorId: user._id.toString() });
    const plays = await Play.find({ userId: user._id.toString() });
    
    res.json({
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
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/ban-user/:id', authMiddleware, async (req, res) => {
  try {
    const admin = await isAdmin(req.user.email);
    if (!admin) return res.status(403).json({ error: 'admin only' });
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'user not found' });
    
    user.banned = !user.banned;
    user.bannedAt = user.banned ? new Date() : null;
    await user.save();
    res.json({ ok: true, banned: user.banned });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/users/:id', authMiddleware, async (req, res) => {
  try {
    const admin = await isAdmin(req.user.email);
    if (!admin) return res.status(403).json({ error: 'admin only' });
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'user not found' });
    
    // Delete user's stories and plays
    await Story.deleteMany({ authorId: user._id.toString() });
    await Play.deleteMany({ userId: user._id.toString() });
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 NAHB backend running on port ${PORT}`));
