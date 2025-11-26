const fetch = require('node-fetch');

const API = 'http://localhost:4000/api';

async function completeStory() {
  try {
    console.log('🔐 Connexion...');
    
    // Connexion
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
    console.log('✅ Connecté');
    
    // Récupérer l'histoire
    const storiesRes = await fetch(API + '/stories', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const stories = await storiesRes.json();
    const story = stories.find(s => s.title === 'La Quête du Dragon Oublié');
    
    if (!story) {
      console.error('❌ Histoire non trouvée');
      return;
    }
    
    const storyId = story.id || story._id;
    console.log('📖 Histoire trouvée:', story.title);
    console.log('📄 Pages actuelles:', story.pages.length);
    
    // Récupérer les IDs des pages existantes
    const page1Id = story.pages[0].pageId;
    const page2Id = story.pages[1].pageId;
    const page3Id = story.pages[2].pageId;
    
    console.log('\n📄 Ajout de nouvelles pages...');
    
    // Page 4: Piège dans la forêt
    const page4Res = await fetch(API + '/stories/' + storyId + '/pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        content: 'En explorant la forêt, vous tombez dans un piège tendu par des bandits. Ils vous capturent et vous enfermez dans leur campement. Vous devez trouver un moyen de vous échapper pour continuer votre quête.',
        isEnd: true
      })
    });
    const page4 = await page4Res.json();
    const page4Id = page4.pageId;
    console.log('✅ Page 4 créée (GAME OVER - piège)');
    
    // Page 5: Rencontre avec un sage
    const page5Res = await fetch(API + '/stories/' + storyId + '/pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        content: 'Dans la forêt, vous rencontrez un vieux sage qui connaît l\'emplacement du dragon. Il vous explique que le dragon s\'est réfugié dans la montagne pour méditer. Vous le remerciez et partez vers la montagne.',
        isEnd: false
      })
    });
    const page5 = await page5Res.json();
    const page5Id = page5.pageId;
    console.log('✅ Page 5 créée (rencontre sage)');
    
    // Page 6: Chemin dangereux
    const page6Res = await fetch(API + '/stories/' + storyId + '/pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        content: 'Vous prenez un chemin difficile dans la montagne. Soudain, une avalanche se déclenche ! Vous courez aussi vite que possible mais êtes emporté par les rochers. Votre quête se termine ici...',
        isEnd: true
      })
    });
    const page6 = await page6Res.json();
    const page6Id = page6.pageId;
    console.log('✅ Page 6 créée (GAME OVER - avalanche)');
    
    // Page 7: Victoire alternative
    const page7Res = await fetch(API + '/stories/' + storyId + '/pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        content: 'Grâce aux conseils du sage, vous trouvez facilement la grotte du dragon. Il sort à votre rencontre et accepte de revenir protéger le village. Vous êtes accueilli en héros ! Félicitations, vous avez réussi votre quête !',
        isEnd: true
      })
    });
    const page7 = await page7Res.json();
    const page7Id = page7.pageId;
    console.log('✅ Page 7 créée (FIN HEUREUSE alternative)');
    
    console.log('\n🔗 Mise à jour des choix...');
    
    // Récupérer l'histoire mise à jour
    const updatedStoryRes = await fetch(API + '/stories/' + storyId);
    const updatedStory = await updatedStoryRes.json();
    
    // Supprimer les anciens choix de la page 2
    const page2 = updatedStory.pages.find(p => p.pageId === page2Id);
    for (const choice of page2.choices) {
      await fetch(API + '/stories/' + storyId + '/pages/' + page2Id + '/choices/' + choice._id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
    }
    console.log('✅ Anciens choix de la page 2 supprimés');
    
    // Ajouter nouveaux choix à la page 2 (forêt)
    await fetch(API + '/stories/' + storyId + '/pages/' + page2Id + '/choices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        text: 'S\'aventurer plus profondément dans la forêt',
        to: page4Id
      })
    });
    console.log('✅ Choix ajouté: S\'aventurer (vers piège)');
    
    await fetch(API + '/stories/' + storyId + '/pages/' + page2Id + '/choices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        text: 'Chercher de l\'aide auprès des habitants de la forêt',
        to: page5Id
      })
    });
    console.log('✅ Choix ajouté: Chercher aide (vers sage)');
    
    // Ajouter choix à la page 5 (sage)
    await fetch(API + '/stories/' + storyId + '/pages/' + page5Id + '/choices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        text: 'Suivre les conseils du sage et partir vers la montagne',
        to: page7Id
      })
    });
    console.log('✅ Choix ajouté: Suivre conseils (vers victoire)');
    
    // Ajouter un choix dangereux à la page 1
    await fetch(API + '/stories/' + storyId + '/pages/' + page1Id + '/choices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        text: 'Prendre le chemin le plus rapide par la montagne',
        to: page6Id
      })
    });
    console.log('✅ Choix ajouté: Chemin rapide (vers avalanche)');
    
    console.log('\n📊 Résumé de l\'histoire complétée:');
    console.log('📄 Total: 7 pages');
    console.log('✅ 2 fins heureuses (pages 3 et 7)');
    console.log('❌ 2 game over (pages 4 et 6)');
    console.log('🔀 Multiples chemins possibles');
    console.log('\n🎉 Histoire complétée avec succès !');
    
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
}

completeStory();
