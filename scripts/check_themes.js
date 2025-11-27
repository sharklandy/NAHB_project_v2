require('../backend/node_modules/dotenv').config({path: './backend/.env'});
const mongoose = require('../backend/node_modules/mongoose');

async function checkThemes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas\n');
    
    const Story = require('../backend/models/Story');
    const stories = await Story.find().select('title theme');
    
    console.log('📚 Thèmes des histoires:\n');
    stories.forEach(story => {
      console.log(`"${story.title.replace(/\n/g, ' ')}":`);
      console.log(`  theme: "${story.theme}"`);
      console.log(`  Type: ${typeof story.theme}\n`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkThemes();
