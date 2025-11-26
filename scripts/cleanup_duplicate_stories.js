const fetch = require('node-fetch');

const API = 'http://localhost:4000/api';
let token = '';

async function login() {
  const res = await fetch(API + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@nahb.local',
      password: 'admin123'
    })
  });
  const data = await res.json();
  token = data.token;
  console.log('✅ Connecté en tant qu\'admin');
}

async function cleanupStories() {
  const res = await fetch(API + '/stories', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const stories = await res.json();
  
  console.log(`\n📚 ${stories.length} histoires trouvées\n`);
  
  // Grouper par titre
  const grouped = {};
  stories.forEach(story => {
    if (!grouped[story.title]) {
      grouped[story.title] = [];
    }
    grouped[story.title].push(story);
  });
  
  // Pour chaque groupe, garder la meilleure version
  for (const title in grouped) {
    const versions = grouped[title];
    
    if (versions.length > 1) {
      console.log(`\n🔍 "${title}" - ${versions.length} versions trouvées:`);
      
      // Trier par priorité: published > draft avec pages > draft vide
      versions.sort((a, b) => {
        if (a.status === 'published' && b.status !== 'published') return -1;
        if (a.status !== 'published' && b.status === 'published') return 1;
        return (b.pages?.length || 0) - (a.pages?.length || 0);
      });
      
      const keeper = versions[0];
      const toDelete = versions.slice(1);
      
      console.log(`  ✅ GARDER: ${keeper.status} (${keeper.pages?.length || 0} pages) - ID: ${keeper._id}`);
      
      for (const story of toDelete) {
        console.log(`  ❌ SUPPRIMER: ${story.status} (${story.pages?.length || 0} pages) - ID: ${story._id}`);
        
        try {
          const deleteRes = await fetch(API + '/stories/' + story._id, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
          });
          
          if (deleteRes.ok) {
            console.log(`     ✓ Supprimée`);
          } else {
            console.log(`     ✗ Erreur lors de la suppression`);
          }
        } catch (err) {
          console.log(`     ✗ Erreur: ${err.message}`);
        }
      }
    } else {
      console.log(`✓ "${title}" - 1 seule version (OK)`);
    }
  }
  
  console.log('\n✅ Nettoyage terminé !');
}

async function main() {
  try {
    await login();
    await cleanupStories();
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
}

main();
