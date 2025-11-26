const fetch = require('node-fetch');

const API = 'http://localhost:4000/api';

async function createUserAndStory() {
  try {
    console.log('📝 Création d\'un nouvel utilisateur...');
    
    // Créer un utilisateur
    const registerRes = await fetch(API + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Pierre Auteur',
        email: 'pierre@nahb.local',
        password: 'pierre123'
      })
    });
    
    const userData = await registerRes.json();
    
    if (userData.error === 'email exists') {
      console.log('ℹ️  L\'utilisateur existe déjà, connexion...');
      
      const loginRes = await fetch(API + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'pierre@nahb.local',
          password: 'pierre123'
        })
      });
      
      const loginData = await loginRes.json();
      if (loginData.token) {
        userData.token = loginData.token;
        console.log('✅ Connecté avec succès');
      } else {
        console.error('❌ Erreur de connexion:', loginData);
        return;
      }
    } else if (userData.token) {
      console.log('✅ Utilisateur créé avec succès !');
      console.log('📧 Email: pierre@nahb.local');
      console.log('🔑 Mot de passe: pierre123');
    } else {
      console.error('❌ Erreur lors de la création:', userData);
      return;
    }
    
    const token = userData.token;
    
    console.log('\n📖 Création d\'une histoire...');
    
    // Créer une histoire
    const storyRes = await fetch(API + '/stories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        title: 'La Quête du Dragon Oublié',
        description: 'Une aventure fantastique où vous devez retrouver un dragon légendaire pour sauver votre village',
        tags: ['fantasy', 'dragon', 'aventure']
      })
    });
    
    const story = await storyRes.json();
    
    if (story.id || story._id) {
      const storyId = story.id || story._id;
      console.log('✅ Histoire créée avec succès !');
      console.log('📚 Titre:', story.title);
      console.log('🆔 ID:', storyId);
      
      console.log('\n📄 Création des pages...');
      
      // Créer la première page
      const page1Res = await fetch(API + '/stories/' + storyId + '/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          content: 'Vous êtes dans votre village quand une terrible nouvelle arrive : le dragon protecteur a disparu et des créatures maléfiques commencent à attaquer. Les anciens vous ont choisi pour retrouver le dragon. Que faites-vous ?',
          isEnd: false
        })
      });
      
      const page1 = await page1Res.json();
      const page1Id = page1.pageId;
      console.log('✅ Page 1 créée (ID:', page1Id + ')');
      
      // Créer la deuxième page (forêt)
      const page2Res = await fetch(API + '/stories/' + storyId + '/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          content: 'Vous entrez dans la forêt sombre. Les arbres sont si hauts qu\'ils cachent le soleil. Soudain, vous entendez un rugissement au loin. Le dragon serait-il par ici ?',
          isEnd: false
        })
      });
      
      const page2 = await page2Res.json();
      const page2Id = page2.pageId;
      console.log('✅ Page 2 créée (ID:', page2Id + ')');
      
      // Créer la troisième page (montagne)
      const page3Res = await fetch(API + '/stories/' + storyId + '/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          content: 'Vous escaladez la montagne escarpée. Au sommet, vous découvrez une grotte immense. C\'est ici que vit le dragon ! Vous l\'appelez et il sort de sa cachette, reconnaissant.',
          isEnd: true
        })
      });
      
      const page3 = await page3Res.json();
      const page3Id = page3.pageId;
      console.log('✅ Page 3 créée (FIN - ID:', page3Id + ')');
      
      console.log('\n🔗 Création des choix...');
      
      // Ajouter des choix à la page 1
      await fetch(API + '/stories/' + storyId + '/pages/' + page1Id + '/choices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          text: 'Explorer la forêt sombre',
          to: page2Id
        })
      });
      console.log('✅ Choix 1 ajouté: Explorer la forêt');
      
      await fetch(API + '/stories/' + storyId + '/pages/' + page1Id + '/choices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          text: 'Partir vers la montagne sacrée',
          to: page3Id
        })
      });
      console.log('✅ Choix 2 ajouté: Partir vers la montagne');
      
      // Ajouter un choix à la page 2
      await fetch(API + '/stories/' + storyId + '/pages/' + page2Id + '/choices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          text: 'Suivre le rugissement jusqu\'à la montagne',
          to: page3Id
        })
      });
      console.log('✅ Choix 3 ajouté: Suivre le rugissement');
      
      // Définir la page de départ
      await fetch(API + '/stories/' + storyId, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          startPageId: page1Id
        })
      });
      console.log('✅ Page de départ définie');
      
      // Publier l'histoire
      await fetch(API + '/stories/' + storyId, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          status: 'published'
        })
      });
      console.log('✅ Histoire publiée !');
      
      console.log('\n🎉 Tout est prêt !');
      console.log('👤 Utilisateur: pierre@nahb.local (mot de passe: pierre123)');
      console.log('📖 Histoire: La Quête du Dragon Oublié');
      console.log('📄 3 pages créées avec des choix interactifs');
      
    } else {
      console.error('❌ Erreur lors de la création de l\'histoire:', story);
    }
    
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
}

createUserAndStory();
