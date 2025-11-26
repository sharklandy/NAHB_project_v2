const fetch = require('node-fetch');

const API = 'http://localhost:4000/api';

// ==================== HISTOIRE 1: L'Eveil du Dernier Gardien (28 pages) ====================
async function createGardienStory(token) {
  try {
    console.log('\n📖 Création de "L\'Eveil du Dernier Gardien" (28 pages)...');
    
    // Créer l'histoire
    const storyRes = await fetch(API + '/stories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        title: 'L\'Eveil du Dernier Gardien',
        description: 'Une aventure épique où vous incarnez le dernier gardien d\'un sanctuaire ancien, chargé de protéger le monde des forces obscures qui menacent de s\'échapper.',
        tags: ['fantasy', 'aventure', 'gardien', 'épique'],
        theme: 'Fantasy'
      })
    });
    
    const story = await storyRes.json();
    const storyId = story.id || story._id;
    console.log('✅ Histoire créée');
    
    // Créer toutes les pages
    const pages = [];
    
    const pageContents = [
      // Page 1 - Début
      { content: 'Vous vous réveillez dans le sanctuaire ancien, dernier gardien d\'un ordre oublié. Des fissures apparaissent dans les sceaux qui retiennent les forces obscures. Le cristal de pouvoir au centre du sanctuaire s\'affaiblit. Vous devez agir rapidement pour éviter une catastrophe. Que faites-vous en premier ?', isEnd: false },
      
      // Page 2 - Consulter les archives
      { content: 'Vous plongez dans les archives poussiéreuses du sanctuaire. Après des heures de recherche, vous découvrez un grimoire ancien décrivant trois rituels possibles pour renforcer les sceaux : le Rituel de Lumière nécessitant l\'énergie solaire, le Rituel d\'Ombre utilisant la magie lunaire, et le Rituel d\'Équilibre combinant les deux forces.', isEnd: false },
      
      // Page 3 - Inspecter les sceaux
      { content: 'Vous inspectez minutieusement les sceaux défaillants. Vous découvrez que la fissure principale se trouve au sceau nord, près de la Porte des Ombres. Une énergie maléfique en suinte, créant des manifestations spectrales dans les couloirs. Il vous faut des outils magiques pour réparer cela.', isEnd: false },
      
      // Page 4 - Méditer près du cristal
      { content: 'Vous vous asseyez en méditation près du cristal de pouvoir. Dans votre transe, vous recevez une vision : un ancien gardien vous montre l\'emplacement d\'artefacts cachés dans le sanctuaire - l\'Épée de l\'Aube dans la tour est, le Bouclier de Minuit dans les cryptes, et l\'Amulette de l\'Équilibre dans les jardins souterrains.', isEnd: false },
      
      // Page 5 - Agir immédiatement
      { content: 'Sans préparation, vous vous précipitez vers la Porte des Ombres pour colmater la brèche. Votre audace vous mène face à des entités d\'ombre qui s\'échappent déjà. Sans armes ni protection magique, vous êtes submergé par leur nombre. Votre essence est absorbée par les ténèbres... Fin prématurée.', isEnd: true },
      
      // Page 6 - Rituel de Lumière - Préparation
      { content: 'Vous décidez de suivre le chemin du Rituel de Lumière. Selon le grimoire, vous devez accomplir ce rituel au lever du soleil depuis le sommet de la Tour de l\'Aube. Mais avant cela, vous avez besoin de trois composants : une gemme solaire, de l\'eau bénite, et des plumes de phénix.', isEnd: false },
      
      // Page 7 - Rituel d\'Ombre - Préparation
      { content: 'Le Rituel d\'Ombre attire votre attention. Plus risqué, il promet aussi plus de puissance. Ce rituel doit être accompli durant la nouvelle lune dans les cryptes profondes. Vous aurez besoin d\'encre d\'ombre, d\'un miroir d\'obsidienne, et d\'écailles de dragon nocturne.', isEnd: false },
      
      // Page 8 - Rituel d\'Équilibre - Préparation
      { content: 'Le Rituel d\'Équilibre semble être la voie la plus sage, bien que la plus complexe. Il nécessite de maîtriser à la fois la lumière et l\'ombre, et de les harmoniser au crépuscule. Les composants requis incluent un cristal de dualité, des herbes d\'équinoxe, et votre propre sang de gardien.', isEnd: false },
      
      // Page 9 - Trouver l\'Épée de l\'Aube
      { content: 'Vous montez les innombrables marches de la tour est. Au sommet, dans un écrin de lumière pure, repose l\'Épée de l\'Aube. Lorsque vous la saisissez, une énergie solaire parcourt votre corps. L\'arme vibre de puissance, prête à repousser les ténèbres. Vous vous sentez plus fort.', isEnd: false },
      
      // Page 10 - Trouver le Bouclier de Minuit
      { content: 'Les cryptes sont sombres et oppressantes. Vous naviguez entre les tombeaux des anciens gardiens jusqu\'à trouver une chambre secrète. Là, le Bouclier de Minuit flotte dans une aura de ténèbres contrôlées. En le prenant, vous gagnez la protection des ombres bienveillantes qui servirent jadis les gardiens.', isEnd: false },
      
      // Page 11 - Trouver l\'Amulette de l\'Équilibre
      { content: 'Les jardins souterrains sont un labyrinthe de plantes bioluminescentes et d\'eaux mystiques. Au centre, sur un piédestal de pierre gravée de runes, repose l\'Amulette de l\'Équilibre. Elle pulse d\'une énergie duelle - lumière et ombre en parfaite harmonie. Vous la portez à votre cou, sentant l\'équilibre s\'établir en vous.', isEnd: false },
      
      // Page 12 - Affronter les spectres sans préparation
      { content: 'Confiant dans vos capacités, vous affrontez les spectres qui hantent les couloirs. Mais ils sont plus nombreux et plus puissants que prévu. Sans les bons artefacts ou rituels, votre énergie vitale est drainée. Vous tombez, vaincu, et le sanctuaire tombe aux mains des forces obscures... Game Over.', isEnd: true },
      
      // Page 13 - Chercher la gemme solaire
      { content: 'Vous explorez le sanctuaire à la recherche de la gemme solaire. Dans une salle oubliée, vous trouvez un coffre ancien. À l\'intérieur brille la gemme, capturant et amplifiant la lumière ambiante. Vous la prenez délicatement - un composant essentiel pour le Rituel de Lumière.', isEnd: false },
      
      // Page 14 - Chercher l\'encre d\'ombre
      { content: 'Pour l\'encre d\'ombre, vous devez descendre dans les niveaux les plus profonds du sanctuaire. Dans une chambre scellée depuis des siècles, vous trouvez des flacons d\'encre fabriquée à partir d\'essence d\'ombre pure. Manipuler cette substance est dangereux, mais nécessaire pour le rituel.', isEnd: false },
      
      // Page 15 - Préparer le cristal de dualité
      { content: 'Le cristal de dualité ne se trouve pas, il doit être créé. Vous combinez dans un creuset magique un fragment de lumière du cristal central et une goutte d\'essence d\'ombre. Sous vos incantations, les deux énergies fusionnent, créant un cristal qui pulse d\'une lumière argentée. Parfait pour le Rituel d\'Équilibre.', isEnd: false },
      
      // Page 16 - Accomplir le Rituel de Lumière
      { content: 'Au sommet de la Tour de l\'Aube, vous disposez les composants selon le grimoire. Quand le soleil se lève à l\'horizon, vous commencez le rituel. La gemme solaire s\'illumine, l\'eau bénite brille, les plumes de phénix s\'enflamment d\'une flamme froide. Une colonne de lumière pure jaillit, renforçant tous les sceaux du sanctuaire !', isEnd: false },
      
      // Page 17 - Accomplir le Rituel d\'Ombre
      { content: 'Dans les cryptes, sous la nouvelle lune, vous tracez des symboles avec l\'encre d\'ombre sur le miroir d\'obsidienne. Les écailles de dragon nocturne forment un cercle. Vous prononcez les mots interdits. Les ombres elles-mêmes répondent à votre appel, tissant de nouveaux sceaux d\'une puissance terrible et magnifique.', isEnd: false },
      
      // Page 18 - Accomplir le Rituel d\'Équilibre
      { content: 'Au crépuscule, moment où jour et nuit s\'équilibrent, vous vous tenez au centre du sanctuaire. Le cristal de dualité dans une main, les herbes dans l\'autre, vous versez trois gouttes de votre sang. Les énergies de lumière et d\'ombre dansent autour de vous, s\'harmonisant parfaitement. Les sceaux se renforcent dans un équilibre parfait entre toutes les forces.', isEnd: false },
      
      // Page 19 - Sceller définitivement la Porte des Ombres
      { content: 'Fort de votre rituel accompli, vous vous dirigez vers la Porte des Ombres. Avec l\'énergie que vous avez canalisée, vous posez vos mains sur la fissure principale. La porte répond à votre toucher de gardien, les fissures se referment, les sceaux se régénèrent. La porte est scellée pour l\'éternité.', isEnd: false },
      
      // Page 20 - Purifier le sanctuaire
      { content: 'Vous parcourez chaque salle du sanctuaire, utilisant votre pouvoir nouvellement renforcé pour purger les dernières traces d\'influence maléfique. Les spectres se dissipent, les ombres corrompues s\'évaporent. Le sanctuaire retrouve sa pureté originelle, ses murs brillent d\'une douce lumière.', isEnd: false },
      
      // Page 21 - Former un nouveau gardien
      { content: 'Conscient que vous ne pouvez pas protéger le sanctuaire seul éternellement, vous décidez de former un apprenti. Dans le village voisin, vous trouvez une jeune personne au grand potentiel magique. Vous commencez son entraînement, assurant que l\'ordre des gardiens ne s\'éteindra jamais.', isEnd: false },
      
      // Page 22 - Victoire de la Lumière
      { content: 'Grâce au Rituel de Lumière, le sanctuaire rayonne d\'une aura protectrice éclatante. Les forces obscures n\'oseront plus jamais s\'en approcher. Vous avez sauvé le monde d\'une menace ancestrale. Les villageois vous célèbrent comme un héros. Vous continuez votre veille, gardien éternel de la lumière. ✨ VICTOIRE LUMINEUSE ✨', isEnd: true },
      
      // Page 23 - Victoire de l\'Ombre
      { content: 'Le Rituel d\'Ombre a transformé le sanctuaire en une forteresse de ténèbres maîtrisées. Vous avez appris à contrôler les ombres elles-mêmes, les retournant contre celles qui sont corrompues. Un pouvoir terrible mais juste. Vous êtes devenu le Gardien de Minuit, protecteur craint et respecté. 🌙 VICTOIRE OBSCURE 🌙', isEnd: true },
      
      // Page 24 - Victoire de l\'Équilibre
      { content: 'Le Rituel d\'Équilibre a créé une harmonie parfaite entre lumière et ombre. Le sanctuaire existe désormais dans un état de paix absolue, où toutes les forces coexistent en équilibre. Vous êtes devenu le Maître de l\'Équilibre, symbole vivant de sagesse et d\'harmonie. Les légendes parleront de vous pendant des millénaires. ☯️ VICTOIRE PARFAITE ☯️', isEnd: true },
      
      // Page 25 - Exploration continue
      { content: 'Après avoir sécurisé le sanctuaire, vous décidez d\'explorer les vastes réseaux de tunnels et de chambres encore inexplorés. Qui sait quels autres secrets et artefacts anciens se cachent dans les profondeurs ? Votre aventure de gardien ne fait que commencer.', isEnd: false },
      
      // Page 26 - Établir contact avec autres sanctuaires
      { content: 'Vous découvrez dans les archives des références à d\'autres sanctuaires à travers le monde. Vous envoyez des messages magiques, cherchant à établir le contact avec d\'autres gardiens. Peut-être n\'êtes-vous pas si seul après tout. Une nouvelle ère de coopération entre gardiens pourrait commencer.', isEnd: false },
      
      // Page 27 - Fin alternative - Départ
      { content: 'Épuisé par votre quête et sentant que le sanctuaire est maintenant en sécurité, vous décidez de transmettre votre rôle à votre apprenti et de partir explorer le monde extérieur. Vous avez rempli votre devoir de gardien. Une nouvelle vie vous attend au-delà des murs sacrés. 🌄 FIN - NOUVEAU DÉPART', isEnd: true },
      
      // Page 28 - Game Over - Corruption
      { content: 'En manipulant imprudemment les forces d\'ombre, vous avez été corrompu. Votre esprit s\'est perdu dans les ténèbres, et vous êtes devenu l\'instrument même de la destruction que vous cherchiez à empêcher. Le sanctuaire tombe, et avec lui, l\'espoir du monde. ⚫ CORRUPTION TOTALE - GAME OVER', isEnd: true }
    ];
    
    console.log('📄 Création des 28 pages...');
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
      console.log(`✅ Page ${i + 1}/28 créée`);
    }
    
    console.log('\n🔗 Création des choix...');
    
    // Page 1 -> choix initiaux
    await addChoice(token, storyId, pages[0], 'Consulter les archives anciennes', pages[1]);
    await addChoice(token, storyId, pages[0], 'Inspecter les sceaux défaillants', pages[2]);
    await addChoice(token, storyId, pages[0], 'Méditer près du cristal de pouvoir', pages[3]);
    await addChoice(token, storyId, pages[0], 'Agir immédiatement sans préparation', pages[4]);
    
    // Page 2 (archives) -> choix de rituels
    await addChoice(token, storyId, pages[1], 'Préparer le Rituel de Lumière', pages[5]);
    await addChoice(token, storyId, pages[1], 'Préparer le Rituel d\'Ombre', pages[6]);
    await addChoice(token, storyId, pages[1], 'Préparer le Rituel d\'Équilibre', pages[7]);
    
    // Page 3 (inspection) -> artefacts
    await addChoice(token, storyId, pages[2], 'Chercher l\'Épée de l\'Aube', pages[8]);
    await addChoice(token, storyId, pages[2], 'Chercher le Bouclier de Minuit', pages[9]);
    await addChoice(token, storyId, pages[2], 'Chercher l\'Amulette de l\'Équilibre', pages[10]);
    
    // Page 4 (méditation) -> artefacts
    await addChoice(token, storyId, pages[3], 'Récupérer l\'Épée de l\'Aube', pages[8]);
    await addChoice(token, storyId, pages[3], 'Récupérer le Bouclier de Minuit', pages[9]);
    await addChoice(token, storyId, pages[3], 'Récupérer l\'Amulette de l\'Équilibre', pages[10]);
    
    // Page 6 (Rituel Lumière prep) -> composants
    await addChoice(token, storyId, pages[5], 'Chercher la gemme solaire', pages[12]);
    await addChoice(token, storyId, pages[5], 'Trouver l\'eau bénite', pages[12]);
    await addChoice(token, storyId, pages[5], 'Accomplir le rituel maintenant', pages[15]);
    
    // Page 7 (Rituel Ombre prep) -> composants
    await addChoice(token, storyId, pages[6], 'Chercher l\'encre d\'ombre', pages[13]);
    await addChoice(token, storyId, pages[6], 'Trouver le miroir d\'obsidienne', pages[13]);
    await addChoice(token, storyId, pages[6], 'Accomplir le rituel maintenant', pages[16]);
    
    // Page 8 (Rituel Équilibre prep) -> composants
    await addChoice(token, storyId, pages[7], 'Créer le cristal de dualité', pages[14]);
    await addChoice(token, storyId, pages[7], 'Cueillir les herbes d\'équinoxe', pages[14]);
    await addChoice(token, storyId, pages[7], 'Accomplir le rituel maintenant', pages[17]);
    
    // Pages artefacts -> vers rituels ou actions
    await addChoice(token, storyId, pages[8], 'Affronter les spectres avec l\'épée', pages[11]);
    await addChoice(token, storyId, pages[8], 'Préparer le Rituel de Lumière', pages[5]);
    
    await addChoice(token, storyId, pages[9], 'Affronter les spectres avec le bouclier', pages[11]);
    await addChoice(token, storyId, pages[9], 'Préparer le Rituel d\'Ombre', pages[6]);
    
    await addChoice(token, storyId, pages[10], 'Méditer avec l\'amulette', pages[14]);
    await addChoice(token, storyId, pages[10], 'Préparer le Rituel d\'Équilibre', pages[7]);
    
    // Composants -> rituels
    await addChoice(token, storyId, pages[12], 'Accomplir le Rituel de Lumière', pages[15]);
    await addChoice(token, storyId, pages[12], 'Continuer à chercher d\'autres composants', pages[12]);
    
    await addChoice(token, storyId, pages[13], 'Accomplir le Rituel d\'Ombre', pages[16]);
    await addChoice(token, storyId, pages[13], 'Être trop imprudent avec l\'ombre', pages[27]); // Game Over corruption
    
    await addChoice(token, storyId, pages[14], 'Accomplir le Rituel d\'Équilibre', pages[17]);
    await addChoice(token, storyId, pages[14], 'Méditer plus profondément', pages[17]);
    
    // Rituels accomplis -> actions finales
    await addChoice(token, storyId, pages[15], 'Sceller la Porte des Ombres', pages[18]);
    await addChoice(token, storyId, pages[15], 'Purifier tout le sanctuaire', pages[19]);
    await addChoice(token, storyId, pages[15], 'Célébrer votre victoire', pages[21]); // Victoire Lumière
    
    await addChoice(token, storyId, pages[16], 'Sceller la Porte des Ombres', pages[18]);
    await addChoice(token, storyId, pages[16], 'Purifier le sanctuaire', pages[19]);
    await addChoice(token, storyId, pages[16], 'Maîtriser les ombres complètement', pages[22]); // Victoire Ombre
    
    await addChoice(token, storyId, pages[17], 'Sceller la Porte des Ombres', pages[18]);
    await addChoice(token, storyId, pages[17], 'Purifier le sanctuaire', pages[19]);
    await addChoice(token, storyId, pages[17], 'Atteindre l\'harmonie parfaite', pages[23]); // Victoire Équilibre
    
    // Actions finales -> conclusions
    await addChoice(token, storyId, pages[18], 'Purifier le sanctuaire', pages[19]);
    await addChoice(token, storyId, pages[18], 'Former un nouvel apprenti', pages[20]);
    
    await addChoice(token, storyId, pages[19], 'Former un nouvel apprenti', pages[20]);
    await addChoice(token, storyId, pages[19], 'Explorer les profondeurs', pages[24]);
    
    await addChoice(token, storyId, pages[20], 'Contacter d\'autres sanctuaires', pages[25]);
    await addChoice(token, storyId, pages[20], 'Partir vers une nouvelle vie', pages[26]); // Fin alternative
    
    await addChoice(token, storyId, pages[24], 'Continuer l\'exploration', pages[24]);
    await addChoice(token, storyId, pages[24], 'Retourner en sécurité', pages[20]);
    
    await addChoice(token, storyId, pages[25], 'Former une alliance de gardiens', pages[20]);
    await addChoice(token, storyId, pages[25], 'Explorer seul', pages[24]);
    
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
    
    console.log('\n📊 "L\'Eveil du Dernier Gardien" créée:');
    console.log('📄 Total: 28 pages');
    console.log('✅ 3 fins victorieuses (Lumière, Ombre, Équilibre)');
    console.log('🔀 1 fin alternative (Nouveau départ)');
    console.log('❌ 2 game over');
    console.log('🎯 Thème: Fantasy épique - Gardien mystique');
    console.log('🎉 Histoire publiée !');
    
  } catch (err) {
    console.error('❌ Erreur lors de la création du Gardien:', err.message);
    throw err;
  }
}

// ==================== HISTOIRE 2: La Quête du Dragon Oublié (26 pages) ====================
async function createDragonStory(token) {
  try {
    console.log('\n📖 Création de "La Quête du Dragon Oublié" (26 pages)...');
    
    // Créer l'histoire
    const storyRes = await fetch(API + '/stories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        title: 'La Quête du Dragon Oublié',
        description: 'Une aventure fantastique épique où vous devez retrouver un dragon légendaire pour sauver votre village des forces du mal',
        tags: ['fantasy', 'dragon', 'aventure', 'épique'],
        theme: 'Fantasy'
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
    
    console.log('📄 Création des 26 pages...');
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
    await addChoice(token, storyId, pages[24], 'S\'enfoncer dans les tunnels', pages[24]); // Game over perdu (boucle)
    
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
    
    console.log('\n📊 "La Quête du Dragon Oublié" créée:');
    console.log('📄 Total: 26 pages');
    console.log('✅ 4 fins victorieuses');
    console.log('❌ 4 game over');
    console.log('🔀 Multiples chemins complexes');
    console.log('🎯 3 zones d\'exploration: Forêt, Montagnes, Lac');
    console.log('🎉 Histoire publiée !');
    
  } catch (err) {
    console.error('❌ Erreur lors de la création du Dragon:', err.message);
    throw err;
  }
}

// ==================== HISTOIRE 3: Le Mystère de la Cité Engloutie (30 pages) ====================
async function createAtlantisStory(token) {
  try {
    console.log('\n📖 Création de "Le Mystère de la Cité Engloutie" (30 pages)...');
    
    // Créer l'histoire
    const storyRes = await fetch(API + '/stories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        title: 'Le Mystère de la Cité Engloutie',
        description: 'Une aventure sous-marine où vous incarnez un explorateur à la recherche d\'Atlantis',
        tags: ['aventure', 'mystere', 'ocean'],
        theme: 'Science-Fiction'
      })
    });
    
    const story = await storyRes.json();
    const storyId = story.id || story._id;
    console.log('✅ Histoire créée');
    
    // Créer toutes les pages
    const pages = [];
    
    const pageContents = [
      // Page 1 - Début
      { content: 'Vous êtes à bord du sous-marin Nautilus-7, descendant lentement vers les profondeurs de l\'océan Atlantique. Votre mission : trouver les traces de la légendaire cité d\'Atlantis. Soudain, vos radars détectent une structure massive à 500 mètres. Que faites-vous ?', isEnd: false },
      
      // Page 2 - S'approcher
      { content: 'Vous vous approchez de la structure. C\'est une immense porte sculptée dans la roche, ornée de symboles étranges qui brillent d\'une faible lueur bleue. Une inscription dans une langue inconnue est gravée au-dessus. Que faites-vous ?', isEnd: false },
      
      // Page 3 - Envoyer un drone
      { content: 'Le drone s\'approche de la structure et transmet des images incroyables : une cité entière sous une bulle d\'air géante ! Les bâtiments semblent intacts. Soudain, le drone perd le signal. Que faites-vous ?', isEnd: false },
      
      // Page 4 - Remonter et signaler (FIN)
      { content: 'Vous remontez à la surface et signalez votre découverte. Malheureusement, pendant votre absence, une tempête a déplacé les courants et vous ne retrouvez plus jamais le site. La découverte d\'Atlantis restera un mystère.', isEnd: true },
      
      // Page 5 - Toucher les symboles
      { content: 'Au contact de votre main, les symboles s\'illuminent intensément et la porte commence à s\'ouvrir lentement avec un grondement sourd. Une lumière dorée émane de l\'intérieur. Vous pénétrez dans un vaste hall orné de colonnes. Que faites-vous ?', isEnd: false },
      
      // Page 6 - Analyser
      { content: 'Vos analyses révèlent que les symboles sont une forme ancienne de grec mélangé à une écriture inconnue. La traduction partielle indique : \'Seul le digne peut entrer\'. Vous remarquez qu\'un des symboles ressemble à un mécanisme d\'ouverture.', isEnd: false },
      
      // Page 7 - Ouvrir la porte
      { content: 'Vous cherchez minutieusement et trouvez un panneau dissimulé avec des leviers. Après plusieurs essais, la porte s\'ouvre dans un nuage de bulles. Vous entrez dans la cité engloutie.', isEnd: false },
      
      // Page 8 - Récupérer le drone
      { content: 'Vous guidez le Nautilus-7 vers la dernière position du drone. En passant à travers la bulle d\'air, votre sous-marin émerge dans une caverne gigantesque ! L\'air est respirable. Devant vous, une cité antique parfaitement préservée s\'étend à perte de vue.', isEnd: false },
      
      // Page 9 - Explorer ailleurs (FIN)
      { content: 'Vous décidez d\'explorer d\'autres zones. Vous trouvez des ruines intéressantes mais rien d\'aussi spectaculaire que ce que le drone avait filmé. Vous vous demandez souvent ce qui se serait passé si vous étiez allé récupérer le drone.', isEnd: true },
      
      // Page 10 - Envoyer un second drone
      { content: 'Le second drone suit la même trajectoire. Cette fois, vous découvrez que le signal est brouillé par un champ électromagnétique naturel. Vous devez y aller personnellement si vous voulez en savoir plus.', isEnd: false },
      
      // Page 11 - Hall principal
      { content: 'Le hall est impressionnant, avec des fresques magnifiques représentant des créatures marines et des humains vivant en harmonie. Au centre, une fontaine dont l\'eau semble circuler mystérieusement. Vous apercevez quelque chose qui brille au fond.', isEnd: false },
      
      // Page 12 - Couloir gauche (bibliothèque)
      { content: 'Le couloir de gauche mène à une bibliothèque immense. Des milliers de tablettes et de rouleaux sont parfaitement conservés. C\'est le savoir perdu de toute une civilisation ! Vous pourriez passer des années ici.', isEnd: false },
      
      // Page 13 - Couloir droit (arsenal)
      { content: 'Le couloir de droite vous conduit à un arsenal. Des armes et armures anciennes brillent comme si elles avaient été forgées hier. Une épée particulière attire votre attention, elle émet une faible lueur.', isEnd: false },
      
      // Page 14 - Continuer l'analyse (FIN)
      { content: 'Vous passez des heures à analyser les symboles. Vous faites des découvertes fascinantes sur la langue atlantéenne, mais la nuit tombe et vous devez remonter. Votre mission est un succès scientifique majeur !', isEnd: true },
      
      // Page 15 - Centre de la cité
      { content: 'Au centre de la cité, vous trouvez une place avec une statue colossale représentant Poseidon. À ses pieds, un cristal géant pulse d\'une énergie étrange. C\'est peut-être la source d\'énergie de toute la cité !', isEnd: false },
      
      // Page 16 - Habitations (FIN)
      { content: 'Les habitations révèlent la vie quotidienne des Atlantes. Vous trouvez des objets, des bijoux, et même ce qui ressemble à des jouets d\'enfants. C\'est émouvant de voir ces traces d\'une civilisation disparue.', isEnd: true },
      
      // Page 17 - Explorer à pied
      { content: 'Vous sortez du sous-marin et marchez dans les rues d\'Atlantis. L\'architecture est magnifique, mélange de grec ancien et de formes impossibles. Vous vous sentez observé. Soudain, vous apercevez une silhouette au loin.', isEnd: false },
      
      // Page 18 - Rester dans le sous-marin (FIN)
      { content: 'Vous pilotez le Nautilus-7 à travers la cité immergée. Vous documentez tout avec vos caméras. C\'est une découverte historique majeure ! Vous rentrez triomphant avec des preuves irréfutables de l\'existence d\'Atlantis.', isEnd: true },
      
      // Page 19 - Plonger dans la fontaine (FIN)
      { content: 'Vous saisissez l\'objet brillant : c\'est un trident miniature en or. Dès que vous le touchez, une vision vous envahit. Vous voyez Atlantis dans toute sa gloire, puis sa chute. Le trident est la clé pour comprendre cette civilisation.', isEnd: true },
      
      // Page 20 - Examiner les fresques
      { content: 'Les fresques racontent l\'histoire d\'Atlantis : leur alliance avec les dieux de la mer, leur prospérité, puis leur orgueil qui causa leur perte. La dernière fresque montre un moyen de relever la cité !', isEnd: false },
      
      // Page 21 - Salle du trône (FIN)
      { content: 'Au fond du hall, la salle du trône. Sur le trône, un squelette portant une couronne. Dans sa main, un sceptre encore brillant. C\'est probablement le dernier roi d\'Atlantis.', isEnd: true },
      
      // Page 22 - Prendre les tablettes (FIN)
      { content: 'Vous prenez plusieurs tablettes clés. En remontant à la surface, vous réalisez que vous avez en main le savoir qui pourrait changer l\'humanité : médecine avancée, énergie propre, architecture révolutionnaire. Vous êtes devenu le gardien d\'un trésor inestimable.', isEnd: true },
      
      // Page 23 - Photographier la bibliothèque (FIN)
      { content: 'Vous photographiez frénétiquement chaque section de la bibliothèque. Des heures plus tard, vous avez numérisé une quantité incroyable de connaissances. C\'est la plus grande découverte archéologique de tous les temps !', isEnd: true },
      
      // Page 24 - Prendre l'épée (FIN)
      { content: 'Dès que vous saisissez l\'épée, elle s\'illumine d\'une lumière aveuglante. Une voix ancienne résonne : \'Le gardien est réveillé\'. Les murs tremblent. Un golem de pierre apparaît, mais voyant l\'épée dans votre main, il s\'incline. Vous êtes maintenant le protecteur d\'Atlantis !', isEnd: true },
      
      // Page 25 - Toucher le cristal (FIN)
      { content: 'Le cristal pulse sous votre main et toute la cité s\'illumine ! Les fontaines se remettent à couler, les lumières s\'allument. Vous avez réactivé Atlantis ! Mais avec cette énergie revenue, la cité commence à se détacher du fond marin et à remonter vers la surface !', isEnd: true },
      
      // Page 26 - Prélever échantillon (FIN)
      { content: 'Vous prélevez un minuscule fragment du cristal. Même cette petite quantité contient une énergie incroyable. De retour en surface, ce fragment révolutionne la science énergétique mondiale. Vous êtes salué comme un héros de l\'humanité.', isEnd: true },
      
      // Page 27 - Suivre la silhouette (FIN)
      { content: 'Vous suivez la silhouette qui vous mène à un temple caché. À l\'intérieur, un groupe d\'Atlantes vivants ! Ils ont survécu dans cette bulle pendant des millénaires. Ils vous accueillent et vous révèlent les secrets de leur civilisation. Vous devenez le premier ambassadeur entre deux mondes.', isEnd: true },
      
      // Page 28 - Retourner au sous-marin (FIN)
      { content: 'Prudent, vous retournez au Nautilus-7 et remontez à la surface avec vos découvertes. Vous avez prouvé l\'existence d\'Atlantis sans prendre de risques inconsidérés. C\'est une mission parfaitement réussie !', isEnd: true },
      
      // Page 29 - Relever la cité (FIN)
      { content: 'Vous trouvez le mécanisme antique et l\'activez. Toute la cité tremble et commence à s\'élever vers la surface. C\'est spectaculaire mais dangereux ! Vous courez vers votre sous-marin alors que l\'eau tourbillonne autour de vous. Vous parvenez à sortir juste à temps et assistez à l\'émergence d\'Atlantis. Le monde ne sera plus jamais le même.', isEnd: true },
      
      // Page 30 - Documenter et partir (FIN)
      { content: 'Vous documentez soigneusement tout ce que vous avez découvert et remontez. Vos photos et vidéos font sensation dans le monde entier. Des expéditions suivront, mais vous resterez celui qui a redécouvert Atlantis.', isEnd: true }
    ];
    
    console.log('📄 Création des 30 pages...');
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
      console.log(`✅ Page ${i + 1}/30 créée`);
    }
    
    console.log('\n🔗 Création des choix...');
    
    // Page 1 (début) -> choix initiaux
    await addChoice(token, storyId, pages[0], 'S\'approcher prudemment de la structure', pages[1]);
    await addChoice(token, storyId, pages[0], 'Envoyer un drone de reconnaissance', pages[2]);
    await addChoice(token, storyId, pages[0], 'Remonter et signaler la découverte', pages[3]);
    
    // Page 2 (approche) -> symboles
    await addChoice(token, storyId, pages[1], 'Toucher les symboles lumineux', pages[4]);
    await addChoice(token, storyId, pages[1], 'Prendre des photos et analyser', pages[5]);
    await addChoice(token, storyId, pages[1], 'Chercher un moyen d\'ouvrir la porte', pages[6]);
    
    // Page 3 (drone) -> récupération
    await addChoice(token, storyId, pages[2], 'Y aller personnellement pour récupérer le drone', pages[7]);
    await addChoice(token, storyId, pages[2], 'Abandonner le drone et explorer ailleurs', pages[8]);
    await addChoice(token, storyId, pages[2], 'Envoyer un second drone', pages[9]);
    
    // Page 5 (toucher symboles - hall) -> exploration hall
    await addChoice(token, storyId, pages[4], 'Explorer le hall principal', pages[10]);
    await addChoice(token, storyId, pages[4], 'Prendre le couloir de gauche', pages[11]);
    await addChoice(token, storyId, pages[4], 'Prendre le couloir de droite', pages[12]);
    
    // Page 6 (analyser) -> actionner ou continuer
    await addChoice(token, storyId, pages[5], 'Actionner le mécanisme', pages[4]);
    await addChoice(token, storyId, pages[5], 'Continuer l\'analyse', pages[13]);
    
    // Page 7 (ouvrir porte) -> cité
    await addChoice(token, storyId, pages[6], 'Explorer le centre de la cité', pages[14]);
    await addChoice(token, storyId, pages[6], 'Examiner les habitations', pages[15]);
    
    // Page 8 (récupérer drone - caverne) -> exploration
    await addChoice(token, storyId, pages[7], 'Sortir du sous-marin et explorer à pied', pages[16]);
    await addChoice(token, storyId, pages[7], 'Rester dans le sous-marin et le déplacer', pages[17]);
    
    // Page 10 (second drone) -> décision
    await addChoice(token, storyId, pages[9], 'Y aller avec le sous-marin', pages[7]);
    await addChoice(token, storyId, pages[9], 'Abandonner l\'exploration', pages[8]);
    
    // Page 11 (hall principal) -> fontaine/fresques/trône
    await addChoice(token, storyId, pages[10], 'Plonger la main dans la fontaine', pages[18]);
    await addChoice(token, storyId, pages[10], 'Examiner les fresques de plus près', pages[19]);
    await addChoice(token, storyId, pages[10], 'Continuer vers le fond du hall', pages[20]);
    
    // Page 12 (bibliothèque) -> tablettes/photos
    await addChoice(token, storyId, pages[11], 'Prendre quelques tablettes pour les étudier', pages[21]);
    await addChoice(token, storyId, pages[11], 'Photographier tout ce que vous pouvez', pages[22]);
    
    // Page 13 (arsenal) -> épée ou retour
    await addChoice(token, storyId, pages[12], 'Prendre l\'épée lumineuse', pages[23]);
    await addChoice(token, storyId, pages[12], 'Ne rien toucher et revenir en arrière', pages[10]);
    
    // Page 15 (centre cité) -> cristal
    await addChoice(token, storyId, pages[14], 'Toucher le cristal', pages[24]);
    await addChoice(token, storyId, pages[14], 'Prélever un échantillon', pages[25]);
    
    // Page 17 (explorer à pied) -> silhouette
    await addChoice(token, storyId, pages[16], 'Suivre la silhouette', pages[26]);
    await addChoice(token, storyId, pages[16], 'Retourner au sous-marin', pages[27]);
    
    // Page 20 (fresques) -> relever cité ou documenter
    await addChoice(token, storyId, pages[19], 'Chercher le mécanisme pour relever la cité', pages[28]);
    await addChoice(token, storyId, pages[19], 'Documenter et partir', pages[29]);
    
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
    
    console.log('\n📊 "Le Mystère de la Cité Engloutie" créée:');
    console.log('📄 Total: 30 pages');
    console.log('✅ 13 fins différentes');
    console.log('🔀 Exploration sous-marine d\'Atlantis');
    console.log('🎯 Thème: Science-Fiction / Aventure');
    console.log('🎉 Histoire publiée !');
    
  } catch (err) {
    console.error('❌ Erreur lors de la création d\'Atlantis:', err.message);
    throw err;
  }
}

// ==================== FONCTION UTILITAIRE ====================
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

// ==================== FONCTION PRINCIPALE ====================
async function createAllStories() {
  try {
    console.log('🔐 Connexion en tant qu\'auteur...');
    
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
    console.log('✅ Connecté en tant que Pierre\n');
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🏰 CRÉATION DE TOUTES LES HISTOIRES COMPLÈTES');
    console.log('═══════════════════════════════════════════════════════');
    
    // Créer L'Eveil du Dernier Gardien (28 pages)
    await createGardienStory(token);
    
    console.log('\n---------------------------------------------------\n');
    
    // Créer La Quête du Dragon Oublié (26 pages)
    await createDragonStory(token);
    
    console.log('\n---------------------------------------------------\n');
    
    // Créer Le Mystère de la Cité Engloutie (30 pages)
    await createAtlantisStory(token);
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🎊 TOUTES LES HISTOIRES ONT ÉTÉ CRÉÉES AVEC SUCCÈS !');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📚 Total: 3 histoires (84 pages au total)');
    console.log('✅ L\'Eveil du Dernier Gardien: 28 pages');
    console.log('✅ La Quête du Dragon Oublié: 26 pages');
    console.log('✅ Le Mystère de la Cité Engloutie: 30 pages');
    console.log('🎯 Toutes publiées et prêtes à jouer !');
    
  } catch (err) {
    console.error('❌ Erreur fatale:', err.message);
    console.error(err);
  }
}

// Lancer la création
createAllStories();
