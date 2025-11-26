// MongoDB initialization script
db = db.getSiblingDB('nahb');

// Create collections
db.createCollection('users');
db.createCollection('stories');
db.createCollection('plays');
db.createCollection('admins');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.admins.createIndex({ email: 1 }, { unique: true });
db.stories.createIndex({ authorId: 1 });
db.stories.createIndex({ status: 1 });
db.plays.createIndex({ storyId: 1 });
db.plays.createIndex({ userId: 1 });

print('✅ NAHB database initialized successfully');
