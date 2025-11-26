const fetch = require('node-fetch');

const API = 'http://localhost:4000/api';

async function createLargeStory() {
  try {
    console.log('🔐 Connexion...');
    
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
    
    // Supprimer l'ancienne histoire
    const storiesRes = await fetch(API + '/stories', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const stories = await storiesRes.json();
    const oldStory = stories.find(s => s.title === 'La Quête du Dragon Oublié');
    
    if (oldStory) {
      const oldStoryId = oldStory.id || oldStory._id;
      await fetch(API + '/stories/' + oldStoryId, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      console.log('🗑️  Ancienne histoire supprimée');
    }
    
    console.log('\n📖 Création d\'une grande histoire...');
    
    // Créer la nouvelle histoire
    const storyRes = await fetch(API + '/stories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        title: 'La Quête du Dragon Oublié',
        description: 'Une aventure fantastique épique où vous devez retrouver un dragon légendaire pour sauver votre village des forces du mal',
        tags: ['fantasy', 'dragon', 'aventure', 'épique']
      })
    });
    
    const story = await storyRes.json();
    const storyId = story.id || story._id;
    console.log('✅ Histoire créée');
    
    // Créer toutes les pages
    const pages = [];
    
    const pageContents = [
      // Page 1 - Début
      { content: 'Votre village paisible est en danger. Le dragon protecteur, gardien de la paix depuis des siècles, a mystérieusement disparu. Les forces obscures commencent à attaquer les frontières. Les anciens vous ont choisi pour cette quête périlleuse. Vous vous tenez devant la sortie du village, votre sac à dos prêt. Que faites-vous en premier ?', isEnd: false },
      
      // Pages 2-5 - Exploration village
      { content: 'Vous décidez de consulter la grande bibliothèque du village. Parmi les vieux parchemins, vous découvrez une carte ancienne montrant trois lieux possibles où le dragon pourrait se cacher : la Forêt Sombre au nord, les Montagnes Éternelles à l\'est, et le Lac Mystique au sud.', isEnd: false },
      { content: 'Vous rendez visite au forgeron, un vieil ami de votre famille. Il vous offre une épée enchantée qui pourra vous protéger des créatures maléfiques. "Fais attention là-bas," vous dit-il, "les routes ne sont plus sûres."', isEnd: false },
      { content: 'Vous allez voir l\'herboriste du village qui vous donne des potions de guérison et des herbes magiques. "Tu en auras besoin," dit-elle en scrutant l\'horizon avec inquiétude. "Le monde change rapidement."', isEnd: false },
      { content: 'Vous décidez de partir immédiatement sans préparation. C\'est risqué mais chaque minute compte. Vous quittez le village par le chemin principal, déterminé à retrouver le dragon coûte que coûte.', isEnd: false },
      
      // Pages 6-10 - Forêt Sombre
      { content: 'Vous entrez dans la Forêt Sombre. Les arbres centenaires créent une canopée si dense que peu de lumière passe. Des bruits étranges résonnent autour de vous. Soudain, vous apercevez des empreintes massives sur le sol boueux.', isEnd: false },
      { content: 'En suivant les empreintes, vous découvrez un campement abandonné de chasseurs. Leurs notes mentionnent avoir vu une créature gigantesque voler vers le nord de la forêt. Un indice prometteur !', isEnd: false },
      { content: 'Vous rencontrez un elfe forestier nommé Eldrin. Il connaît bien ces bois et vous propose de vous guider vers une clairière où le dragon a été aperçu pour la dernière fois. "Mais attention," vous prévient-il, "des bandits rôdent dans cette zone."', isEnd: false },
      { content: 'Des loups affamés vous encerclent ! Grâce à votre épée enchantée, vous parvenez à les repousser mais vous êtes blessé. Vous devez trouver un refuge rapidement pour soigner vos blessures.', isEnd: false },
      { content: 'Vous tombez dans un piège tendu par des bandits de la forêt. Ils vous capturent et vous enferment dans une cage. Malgré tous vos efforts, vous ne parvenez pas à vous échapper. Votre quête se termine ici, prisonnier dans les profondeurs de la forêt...', isEnd: true },
      
      // Pages 11-15 - Montagnes
      { content: 'Vous commencez l\'ascension des Montagnes Éternelles. Le chemin est escarpé et dangereux. En altitude, l\'air se raréfie et le froid devient mordant. Mais vous ne pouvez pas abandonner maintenant.', isEnd: false },
      { content: 'Vous découvrez l\'entrée d\'une grotte massive. Des marques de griffes géantes ornent les parois rocheuses. Votre cœur bat plus vite - le dragon pourrait être tout près ! Osez-vous entrer ?', isEnd: false },
      { content: 'À l\'intérieur de la grotte, vous trouvez des écailles de dragon encore chaudes. Il était là récemment ! Vous suivez les traces plus profondément dans la caverne, espérant le retrouver.', isEnd: false },
      { content: 'Une avalanche se déclenche soudainement ! Vous tentez de courir mais la masse de neige et de rochers est trop rapide. Vous êtes emporté dans les ténèbres... Votre aventure s\'achève tragiquement ici.', isEnd: true },
      { content: 'Au sommet de la montagne, vous rencontrez un vieux sage ermite qui médite depuis des décennies. Il vous révèle que le dragon s\'est retiré dans les grottes sacrées pour se protéger d\'une malédiction ancienne.', isEnd: false },
      
      // Pages 16-20 - Lac Mystique
      { content: 'Vous arrivez au Lac Mystique. Ses eaux sont d\'un bleu cristallin et une brume magique flotte à sa surface. Selon les légendes, ce lac est un lieu de pouvoir ancien. Le dragon pourrait être attiré par cette magie.', isEnd: false },
      { content: 'Vous rencontrez une sirène qui garde le lac. Elle vous dit que le dragon est venu boire ici il y a trois jours, mais qu\'il semblait blessé et affaibli. Il serait parti vers les îles au centre du lac.', isEnd: false },
      { content: 'Vous trouvez un vieux bateau et ramez vers les îles. La brume devient de plus en plus épaisse. Soudain, vous entendez un rugissement puissant qui fait trembler l\'eau. Le dragon est proche !', isEnd: false },
      { content: 'Des créatures aquatiques maléfiques attaquent votre bateau ! Sans arme efficace contre elles, vous êtes submergé. Les eaux sombres du lac deviennent votre tombeau... Game Over.', isEnd: true },
      { content: 'Sur une île isolée, vous découvrez un temple ancien. À l\'intérieur, des inscriptions parlent d\'un rituel pour appeler le dragon en cas de danger. Vous commencez à réciter les paroles magiques.', isEnd: false },
      
      // Pages 21-26 - Fins et résolutions
      { content: 'Guidé par Eldrin, vous atteignez finalement la clairière sacrée. Là, vous trouvez le dragon, majestueux mais affaibli par une flèche empoisonnée dans son aile. Avec vos herbes médicinales, vous le soignez. Reconnaissant, il accepte de revenir protéger le village. Vous êtes accueilli en héros ! Victoire !', isEnd: true },
      { content: 'Suivant les conseils du sage, vous trouvez les grottes sacrées. Le dragon est là, en méditation profonde pour combattre la malédiction. Vous l\'aidez en récitant les incantations anciennes que le sage vous a apprises. La malédiction est brisée ! Le dragon, libéré, retourne protéger le village. Félicitations !', isEnd: true },
      { content: 'Le rituel fonctionne ! Le dragon apparaît majestueusement au-dessus du temple. Il vous reconnaît comme un ami du village et vous explique qu\'il se cachait d\'un sorcier maléfique. Ensemble, vous élaborez un plan pour vaincre cette menace. Le dragon accepte de revenir une fois le sorcier défait. Mission accomplie !', isEnd: true },
      { content: 'Dans les profondeurs de la grotte, vous trouvez le dragon en train de couver un œuf précieux. Il ne peut pas quitter son nid. Vous promettez de protéger le village en son absence et de revenir quand le dragonneau sera né. Le dragon vous bénit et vous donne une partie de son pouvoir. Fin alternative réussie !', isEnd: true },
      { content: 'Vous décidez d\'explorer seul sans aide. Perdu dans un labyrinthe de tunnels souterrains, vous n\'avez plus de provisions. L\'obscurité et la faim ont raison de vous. Votre corps ne sera jamais retrouvé... Game Over.', isEnd: true },
      { content: 'Vous affrontez directement un groupe de bandits pour les interroger sur le dragon. Mal préparé et en sous-nombre, vous êtes vaincu au combat. Votre quête héroïque s\'achève dans la défaite...', isEnd: true }
    ];
    
    console.log('📄 Création des pages...');
    for (let i = 0; i < pageContents.length; i++) {
      const pageRes = await fetch(API + '/stories/' + storyId + '/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(pageContents[i])
      });
      const page = await pageRes.json();
      pages.push(page.pageId);
      console.log(`✅ Page ${i + 1}/26 créée`);
    }
    
    console.log('\n🔗 Création des choix...');
    
    // Page 1 -> choix initiaux
    await addChoice(token, storyId, pages[0], 'Consulter la bibliothèque du village', pages[1]);
    await addChoice(token, storyId, pages[0], 'Visiter le forgeron pour vous équiper', pages[2]);
    await addChoice(token, storyId, pages[0], 'Demander des potions à l\'herboriste', pages[3]);
    await addChoice(token, storyId, pages[0], 'Partir immédiatement sans préparation', pages[4]);
    
    // Page 2 (bibliothèque) -> exploration
    await addChoice(token, storyId, pages[1], 'Explorer la Forêt Sombre au nord', pages[5]);
    await addChoice(token, storyId, pages[1], 'Partir vers les Montagnes Éternelles', pages[10]);
    await addChoice(token, storyId, pages[1], 'Se diriger vers le Lac Mystique', pages[15]);
    
    // Page 3 (forgeron) -> exploration avec arme
    await addChoice(token, storyId, pages[2], 'Entrer dans la Forêt Sombre, épée en main', pages[5]);
    await addChoice(token, storyId, pages[2], 'Escalader les Montagnes', pages[10]);
    
    // Page 4 (herboriste) -> exploration avec potions
    await addChoice(token, storyId, pages[3], 'Partir vers la Forêt avec vos potions', pages[5]);
    await addChoice(token, storyId, pages[3], 'Affronter les Montagnes avec courage', pages[10]);
    await addChoice(token, storyId, pages[3], 'Explorer le Lac Mystique', pages[15]);
    
    // Page 5 (départ rapide) -> dangers
    await addChoice(token, storyId, pages[4], 'Prendre le chemin de la forêt', pages[8]);
    await addChoice(token, storyId, pages[4], 'Foncer vers les montagnes', pages[13]);
    
    // Forêt - Page 6
    await addChoice(token, storyId, pages[5], 'Suivre les empreintes', pages[6]);
    await addChoice(token, storyId, pages[5], 'Chercher de l\'aide', pages[7]);
    await addChoice(token, storyId, pages[5], 'Continuer prudemment', pages[8]);
    
    // Forêt - Page 7 (campement)
    await addChoice(token, storyId, pages[6], 'Partir vers le nord comme indiqué', pages[7]);
    await addChoice(token, storyId, pages[6], 'Chercher d\'autres indices', pages[8]);
    
    // Forêt - Page 8 (Eldrin)
    await addChoice(token, storyId, pages[7], 'Accepter son aide', pages[20]); // Vers victoire
    await addChoice(token, storyId, pages[7], 'Refuser et continuer seul', pages[8]);
    
    // Forêt - Page 9 (loups)
    await addChoice(token, storyId, pages[8], 'Chercher un refuge dans une grotte', pages[11]); // Vers montagne
    await addChoice(token, storyId, pages[8], 'Continuer malgré les blessures', pages[9]); // Vers piège
    
    // Montagnes - Page 11
    await addChoice(token, storyId, pages[10], 'Entrer dans la grotte massive', pages[11]);
    await addChoice(token, storyId, pages[10], 'Continuer vers le sommet', pages[14]);
    await addChoice(token, storyId, pages[10], 'Chercher un chemin plus sûr', pages[13]); // Vers avalanche
    
    // Montagnes - Page 12 (grotte)
    await addChoice(token, storyId, pages[11], 'Suivre les traces plus profond', pages[12]);
    await addChoice(token, storyId, pages[11], 'Ressortir et chercher ailleurs', pages[14]);
    
    // Montagnes - Page 13 (écailles)
    await addChoice(token, storyId, pages[12], 'Explorer les profondeurs', pages[23]); // Vers œuf
    await addChoice(token, storyId, pages[12], 'Sortir pour demander conseil', pages[14]);
    
    // Montagnes - Page 15 (sage)
    await addChoice(token, storyId, pages[14], 'Suivre ses conseils vers les grottes sacrées', pages[21]); // Vers victoire sage
    await addChoice(token, storyId, pages[14], 'Le remercier et explorer seul', pages[24]); // Vers perdu
    
    // Lac - Page 16
    await addChoice(token, storyId, pages[15], 'Chercher la sirène gardienne', pages[16]);
    await addChoice(token, storyId, pages[15], 'Explorer seul les rives', pages[17]);
    
    // Lac - Page 17 (sirène)
    await addChoice(token, storyId, pages[16], 'Ramer vers les îles', pages[17]);
    await addChoice(token, storyId, pages[16], 'Chercher un meilleur bateau', pages[18]); // Vers créatures
    
    // Lac - Page 18 (bateau)
    await addChoice(token, storyId, pages[17], 'Continuer malgré la brume', pages[19]);
    await addChoice(token, storyId, pages[17], 'Retourner chercher de l\'aide', pages[16]);
    
    // Lac - Page 20 (temple)
    await addChoice(token, storyId, pages[19], 'Réciter le rituel complet', pages[22]); // Vers victoire rituel
    await addChoice(token, storyId, pages[19], 'Explorer plus le temple', pages[23]);
    
    // Choix vers game over
    await addChoice(token, storyId, pages[4], 'Affronter des bandits sans préparation', pages[25]); // Game over bandits
    await addChoice(token, storyId, pages[24], 'S\'enfoncer dans les tunnels', pages[24]); // Game over perdu (boucle sur lui-même)
    
    console.log('✅ Tous les choix créés');
    
    // Définir la page de départ
    await fetch(API + '/stories/' + storyId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        startPageId: pages[0]
      })
    });
    
    // Publier
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
    
    console.log('\n📊 Histoire complète créée:');
    console.log('📄 Total: 26 pages');
    console.log('✅ 4 fins victorieuses');
    console.log('❌ 4 game over');
    console.log('🔀 Multiples chemins complexes');
    console.log('🎯 3 zones d\'exploration: Forêt, Montagnes, Lac');
    console.log('\n🎉 Grande histoire publiée !');
    
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    console.error(err);
  }
}

async function addChoice(token, storyId, pageId, text, targetPageId) {
  await fetch(API + '/stories/' + storyId + '/pages/' + pageId + '/choices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ text, to: targetPageId })
  });
}

createLargeStory();
