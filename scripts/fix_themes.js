const fetch = require('node-fetch');

const API = 'http://localhost:4000/api';

async function fixThemes() {
  try {
    console.log('🔐 Connexion en tant qu\'auteur...');
    
    // Se connecter
    const loginRes = await fetch(API + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'pierre@nahb.local',
        password: 'pierre123'
      })
    });
    
    const userData = await loginRes.json();
    if (!userData.token) {
      console.error('❌ Erreur de connexion');
      return;
    }
    
    const token = userData.token;
    console.log('✅ Connecté\n');
    
    // Récupérer toutes les histoires
    const storiesRes = await fetch(API + '/stories', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const stories = await storiesRes.json();
    
    console.log(`📚 ${stories.length} histoires trouvées\n`);
    
    // Mettre à jour les thèmes
    for (const story of stories) {
      const storyId = story.id || story._id;
      let newTheme = story.theme;
      
      // Corriger les thèmes
      if (story.title.includes('Gardien') || story.title.includes('Dragon')) {
        newTheme = 'fantasy';
      } else if (story.title.includes('Cité') || story.title.includes('Atlantis')) {
        newTheme = 'ocean';
      }
      
      // Mettre à jour si différent
      if (newTheme !== story.theme) {
        console.log(`🔄 Mise à jour "${story.title}": ${story.theme} → ${newTheme}`);
        
        await fetch(API + '/stories/' + storyId, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ theme: newTheme })
        });
        
        console.log('✅ Mis à jour');
      } else {
        console.log(`✓ "${story.title}": thème déjà correct (${story.theme})`);
      }
    }
    
    console.log('\n✨ Tous les thèmes ont été mis à jour !');
    
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
}

fixThemes();
