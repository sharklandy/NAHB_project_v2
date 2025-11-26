const fetch = require('node-fetch');

const API = 'http://localhost:4000/api';

async function cleanup() {
  try {
    console.log('Connexion en tant qu\'admin...');
    
    // Se connecter en tant qu'admin
    const loginRes = await fetch(API + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@nahb.local',
        password: 'admin123'
      })
    });
    
    const userData = await loginRes.json();
    if (!userData.token) {
      console.error('Erreur de connexion admin');
      return;
    }
    
    const token = userData.token;
    console.log('Connecté\n');
    
    // Récupérer toutes les histoires
    const storiesRes = await fetch(API + '/stories', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const allStories = await storiesRes.json();
    
    console.log(`📚 Total histoires avant nettoyage: ${allStories.length}\n`);
    
    let deletedCount = 0;
    
    // Supprimer les histoires draft vides (0 pages)
    console.log('Suppression des histoires draft vides...');
    for (const story of allStories) {
      if (story.status === 'draft' && story.pages && story.pages.length === 0) {
        const storyId = story.id || story._id;
        await fetch(API + '/stories/' + storyId, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        });
        console.log(`Supprimé: "${story.title}" (draft vide)`);
        deletedCount++;
      }
    }
    
    // Nettoyer les doublons (garder la version published ou la plus complète)
    const titlesToClean = [
      "Le Mystère de la Cité Engloutie",
      "L'Eveil du Dernier Gardien",
      "La Quête du Dragon Oublié"
    ];
    
    console.log('\nNettoyage des doublons...');
    for (const title of titlesToClean) {
      const duplicates = allStories.filter(s => s.title === title);
      
      if (duplicates.length > 1) {
        // Trier pour garder la meilleure version
        const sorted = duplicates.sort((a, b) => {
          // Priorité 1: published
          if (a.status === 'published' && b.status !== 'published') return -1;
          if (a.status !== 'published' && b.status === 'published') return 1;
          // Priorité 2: nombre de pages
          return (b.pages?.length || 0) - (a.pages?.length || 0);
        });
        
        const keep = sorted[0];
        const keepId = keep.id || keep._id;
        
        // Supprimer les autres
        for (let i = 1; i < sorted.length; i++) {
          const toDelete = sorted[i];
          const deleteId = toDelete.id || toDelete._id;
          await fetch(API + '/stories/' + deleteId, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
          });
          console.log(` Supprimé doublon: "${title}" (${toDelete.pages?.length || 0} pages, ${toDelete.status})`);
          deletedCount++;
        }
        
        console.log(` Gardé: "${title}" (${keep.pages?.length || 0} pages, ${keep.status})`);
      }
    }
    
    // Récupérer le nouveau total
    const finalRes = await fetch(API + '/stories', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const finalStories = await finalRes.json();
    
    console.log('\n═══════════════════════════════════════');
    console.log('Nettoyage terminé !');
    console.log(`Histoires supprimées: ${deletedCount}`);
    console.log(`Histoires restantes: ${finalStories.length}`);
    console.log('═══════════════════════════════════════');
    
    // Afficher les histoires restantes
    console.log('\n Histoires actuelles:');
    for (const story of finalStories) {
      console.log(`  - "${story.title}" (${story.pages?.length || 0} pages, ${story.status})`);
    }
    
  } catch (err) {
    console.error('Erreur:', err.message);
  }
}

cleanup();
