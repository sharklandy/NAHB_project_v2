require('../backend/node_modules/dotenv').config({ path: './backend/.env' });
const mongoose = require('../backend/node_modules/mongoose');

const User = require('../backend/models/User');
const Story = require('../backend/models/Story');
const Play = require('../backend/models/Play');
const Rating = require('../backend/models/Rating');
const Report = require('../backend/models/Report');
const Admin = require('../backend/models/Admin');

async function testAtlasConnection() {
  try {
    console.log('🔌 Connexion à MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas\n');

    // Test Users
    const usersCount = await User.countDocuments();
    const sampleUser = await User.findOne();
    console.log(`👥 Users: ${usersCount} documents`);
    if (sampleUser) {
      console.log(`   Exemple: ${sampleUser.username} (${sampleUser.email})`);
    }

    // Test Stories
    const storiesCount = await Story.countDocuments();
    const sampleStory = await Story.findOne();
    console.log(`\n📚 Stories: ${storiesCount} documents`);
    if (sampleStory) {
      console.log(`   Exemple: "${sampleStory.title}" - ${sampleStory.pages.length} pages`);
    }

    // Test Plays
    const playsCount = await Play.countDocuments();
    console.log(`\n🎮 Plays: ${playsCount} documents`);

    // Test Ratings
    const ratingsCount = await Rating.countDocuments();
    const avgRating = await Rating.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);
    console.log(`\n⭐ Ratings: ${ratingsCount} documents`);
    if (avgRating.length > 0) {
      console.log(`   Note moyenne: ${avgRating[0].avg.toFixed(2)}/5`);
    }

    // Test Reports
    const reportsCount = await Report.countDocuments();
    console.log(`\n🚩 Reports: ${reportsCount} documents`);

    // Test Admins
    const adminsCount = await Admin.countDocuments();
    const sampleAdmin = await Admin.findOne();
    console.log(`\n👑 Admins: ${adminsCount} documents`);
    if (sampleAdmin) {
      console.log(`   Exemple: ${sampleAdmin.email}`);
    }

    console.log('\n✅ Tous les tests sont réussis ! La base de données Atlas fonctionne correctement.');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
  }
}

testAtlasConnection();
