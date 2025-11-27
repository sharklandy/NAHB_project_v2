const fetch = require('node-fetch');

const API = 'http://localhost:4000/api';

async function addChoice(token, storyId, pageId, text, targetPageId) {
  await fetch(`${API}/stories/${storyId}/pages/${pageId}/choices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ text, to: targetPageId })
  });
}

// Utility to create story with pages and choices
async function createStory(token, meta, pagesContents, choicesMap) {
  console.log(`\n📖 Création de "${meta.title}" (${pagesContents.length} pages) [thème: ${meta.theme}]...`);

  const storyRes = await fetch(API + '/stories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      title: meta.title,
      description: meta.description,
      tags: meta.tags,
      theme: meta.theme
    })
  });

  const story = await storyRes.json();
  const storyId = story.id || story._id;
  console.log('✅ Histoire créée, id=', storyId);

  const pages = [];
  for (let i = 0; i < pagesContents.length; i++) {
    const pageRes = await fetch(API + `/stories/${storyId}/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(pagesContents[i])
    });
    const page = await pageRes.json();
    pages.push(page.pageId);
    console.log(`✅ Page ${i + 1}/${pagesContents.length} créée`);
  }

  // Create choices according to choicesMap: { fromIndex: [{ text, toIndex }, ...] }
  for (const fromIndexStr of Object.keys(choicesMap)) {
    const fromIndex = parseInt(fromIndexStr, 10);
    const list = choicesMap[fromIndexStr];
    for (const ch of list) {
      const toIndex = ch.toIndex;
      await addChoice(token, storyId, pages[fromIndex], ch.text, pages[toIndex]);
    }
  }

  // Set start page and publish
  await fetch(API + `/stories/${storyId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ startPageId: pages[0] })
  });

  await fetch(API + `/stories/${storyId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ status: 'published' })
  });

  console.log(`🎉 "${meta.title}" publiée !`);
}

// ------------------ THEMED STORIES ------------------
async function createSciFi(token) {
  const meta = {
    title: 'Échos du Dernier Orbiteur',
    description: "À bord d'un vaisseau dérivant à la périphérie d'un système oublié, vous devez décider du sort de l'humanité restante.",
    tags: ['sci-fi', 'vaisseau', 'survie'],
    theme: 'sci-fi'
  };

  const pages = [
    { content: "Les alarmes hurlent. L'orbiteur principal a perdu sa trajectoire. Les écrans clignotent. Votre choix déterminera si le reste de l'équipage survit.", isEnd: false },
    { content: "Vous tentez de reprendre le contrôle manuel des propulseurs. Les capteurs indiquent une panne partielle du noyau.", isEnd: false },
    { content: "Vous contactez la flotte locale pour demander assistance, mais la transmission met des heures à arriver.", isEnd: false },
    { content: "Vous explorez la soute et trouvez un drone de réparation ancien encore fonctionnel.", isEnd: false },
    { content: "Une fuite d'atmosphère se déclenche ; sans action rapide, l'équipage suffoquera.", isEnd: true },
    { content: "Grâce au drone, vous réalisez une réparation partielle et gagnez du temps.", isEnd: false },
    { content: "Vous arrimez le vaisseau à un astéroïde voisin pour caler la dérive.", isEnd: false },
    { content: "La flotte répond enfin et propose un sauvetage risqué mais possible.", isEnd: false },
    { content: "Vous sacrifiez une partie des réserves énergétiques pour alimenter une impulsion de saut ; cela pourrait fonctionner mais à un coût.", isEnd: false },
    { content: "L'impulsion de saut vous permet d'atteindre un corridor sûr et l'équipage est sauvé. Victoire pragmatique.", isEnd: true },
    { content: "Le vaisseau reste à la dérive. Des années plus tard, votre histoire devient une légende pour ceux qui cherchent les étoiles perdues.", isEnd: true }
  ];

  const choices = {
    '0': [
      { text: "Contrôler les propulseurs manuellement", toIndex: 1 },
      { text: "Chercher de l'aide via la flotte", toIndex: 2 },
      { text: "Fouiller la soute", toIndex: 3 }
    ],
    '1': [ { text: "Tenter une réparation d'urgence", toIndex: 5 }, { text: "Attacher le vaisseau à un astéroïde", toIndex: 6 } ],
    '2': [ { text: "Attendre la réponse", toIndex: 4 }, { text: "Préparer un message continu", toIndex: 7 } ],
    '3': [ { text: "Activer le drone", toIndex: 5 }, { text: "Ignorer et retourner au poste", toIndex: 4 } ],
    '5': [ { text: "Initier impulsion de saut", toIndex: 8 }, { text: "Garder le drone en réparation", toIndex: 6 } ],
    '6': [ { text: "Accepter le sauvetage de la flotte", toIndex: 7 }, { text: "Rester et tenter un dernier effort", toIndex: 9 } ]
  };

  await createStory(token, meta, pages, choices);
}

async function createHorror(token) {
  const meta = {
    title: 'La Maison aux Murmures',
    description: "Une vieille demeure isolée renferme des secrets qui attaquent la raison.",
    tags: ['horror', 'psychologique', 'maison'],
    theme: 'horror'
  };

  const pages = [
    { content: "Vous arrivez devant la maison décrépite au crépuscule. Des voix semblent venir des murs.", isEnd: false },
    { content: "Dans le salon, un portrait vous fixe et son expression change lorsque vous clignez des yeux.", isEnd: false },
    { content: "Les escaliers grincent, et une porte qui n'était pas là hier se révèle.", isEnd: false },
    { content: "Vous trouvez un journal décrivant des rituels oubliés.", isEnd: false },
    { content: "La maison vous enferme. Vous entendez votre nom chuchoté jusque dans vos rêves. Vous êtes piégé.", isEnd: true },
    { content: "Vous parvenez à briser le miroir maudit, et la lumière revient; la maison se tait.", isEnd: true },
    { content: "Vous suivez les murmures jusqu'à une cave où une présence ancienne sommeille.", isEnd: false },
    { content: "En chantant une berceuse trouvée dans le journal, vous apaisez la présence.", isEnd: true },
    { content: "Ignorer les murmures cause votre folie progressive, et vous disparaissez lentement.", isEnd: true }
  ];

  const choices = {
    '0': [ { text: "Entrer prudemment", toIndex: 1 }, { text: "Faire demi-tour", toIndex: 5 } ],
    '1': [ { text: "Examiner le portrait", toIndex: 2 }, { text: "Monter à l'étage", toIndex: 3 } ],
    '2': [ { text: "Chercher un élément magique", toIndex: 6 }, { text: "Casser le portrait", toIndex: 8 } ],
    '3': [ { text: "Lire le journal", toIndex: 4 }, { text: "Ranger le journal et partir", toIndex: 5 } ],
    '6': [ { text: "Descendre à la cave", toIndex: 6 }, { text: "Chanter la berceuse", toIndex: 7 } ]
  };

  await createStory(token, meta, pages, choices);
}

async function createMystery(token) {
  const meta = {
    title: 'L’Énigme du Train de Minuit',
    description: "Un voyage en train révèle un crime non résolu et des indices qui vous impliquent.",
    tags: ['mystery', 'detective', 'investigation'],
    theme: 'mystery'
  };

  const pages = [
    { content: "Vous montez à bord du train de minuit. Un passager est retrouvé inconscient dans le wagon-bar.", isEnd: false },
    { content: "Le contrôleur affirme que personne n'est monté ou descendu depuis le départ.", isEnd: false },
    { content: "Vous trouvez une clé étrange dans la poche du passager.", isEnd: false },
    { content: "Une lettre chiffonnée indique un rendez-vous secret vers l'avant du train.", isEnd: false },
    { content: "Vous confrontez un suspect et découvrez un mobile inattendu.", isEnd: false },
    { content: "Grâce à votre perspicacité, vous résolvez l'affaire et libérez un innocent.", isEnd: true },
    { content: "Vous accusez la mauvaise personne ; une injustice est commise.", isEnd: true },
    { content: "Le train s'arrête, mais le mystère persiste ; la vérité reste partielle.", isEnd: true }
  ];

  const choices = {
    '0': [ { text: "Interroger le contrôleur", toIndex: 1 }, { text: "Examiner le wagon-bar", toIndex: 2 } ],
    '1': [ { text: "Chercher des témoins", toIndex: 3 }, { text: "Vérifier les caméras", toIndex: 4 } ],
    '2': [ { text: "Prendre la clé", toIndex: 3 }, { text: "Ignorer et fouiller ailleurs", toIndex: 4 } ],
    '3': [ { text: "Suivre l'indice du rendez-vous", toIndex: 5 }, { text: "Rassembler des preuves", toIndex: 6 } ]
  };

  await createStory(token, meta, pages, choices);
}

async function createRomance(token) {
  const meta = {
    title: 'Rencontres sous la Pluie',
    description: "Une histoire douce où vos choix mènent à rapprochements ou malentendus au cœur d'une ville sous la pluie.",
    tags: ['romance', 'drame', 'rencontre'],
    theme: 'romance'
  };

  const pages = [
    { content: "Une pluie fine tambourine sur la ville. Vous rencontrez quelqu'un qui cherche un abri.", isEnd: false },
    { content: "Vous partagez un parapluie et discutez; les sujets révèlent une compatibilité surprenante.", isEnd: false },
    { content: "Un malentendu sur une vieille histoire provoque une dispute passagère.", isEnd: false },
    { content: "Un geste sincère répare la blessure et rapproche les cœurs.", isEnd: true },
    { content: "La distance reste entre vous, et la rencontre devient un souvenir doux-amer.", isEnd: true }
  ];

  const choices = {
    '0': [ { text: "Offrir du café", toIndex: 1 }, { text: "Rester silencieux", toIndex: 2 } ],
    '1': [ { text: "Parler de vos rêves", toIndex: 3 }, { text: "Éviter les sujets personnels", toIndex: 4 } ],
    '2': [ { text: "S'excuser plus tard", toIndex: 3 }, { text: "Ne pas revenir", toIndex: 4 } ]
  };

  await createStory(token, meta, pages, choices);
}

async function createAdventure(token) {
  const meta = {
    title: 'La Carte aux Mille Portes',
    description: "Une carte enchantée révèle des portails vers des mondes variés ; chaque porte est un choix.",
    tags: ['adventure', 'portail', 'quête'],
    theme: 'adventure'
  };

  const pages = [
    { content: "La carte s'anime et dévoile trois portes lumineuses : une forêt, une cité volante, et un désert d'étoiles.", isEnd: false },
    { content: "Dans la forêt, vous rencontrez des gardiens sylvains qui testent votre cœur.", isEnd: false },
    { content: "La cité volante est gouvernée par des marchands de curiosités et un secret ancien.", isEnd: false },
    { content: "Le désert d'étoiles contient des ruines d'une civilisation oubliée.", isEnd: false },
    { content: "Après vos choix, vous trouvez un trésor moral : l'amitié, la connaissance, ou la sagesse.", isEnd: true }
  ];

  const choices = {
    '0': [ { text: "Entrer dans la forêt", toIndex: 1 }, { text: "Monter à la cité volante", toIndex: 2 }, { text: "Traverser le désert", toIndex: 3 } ],
    '1': [ { text: "Aider les gardiens", toIndex: 4 }, { text: "Prendre un artefact", toIndex: 4 } ],
    '2': [ { text: "Négocier avec les marchands", toIndex: 4 }, { text: "Voler un secret", toIndex: 4 } ],
    '3': [ { text: "Explorer une ruine", toIndex: 4 }, { text: "Aller plus loin", toIndex: 4 } ]
  };

  await createStory(token, meta, pages, choices);
}

async function createHistorical(token) {
  const meta = {
    title: 'Sous les Bannières Anciennes',
    description: "Vous êtes un scribe à la cour d'un royaume en pleine effervescence politique; vos choix influencent l'histoire.",
    tags: ['historical', 'drame', 'politique'],
    theme: 'historical'
  };

  const pages = [
    { content: "Le roi convoque son conseil. Des rumeurs de guerre circulent.", isEnd: false },
    { content: "Vous découvrez une correspondance secrète prouvant une trahison.", isEnd: false },
    { content: "Un diplomate propose une alliance risquée.", isEnd: false },
    { content: "Vos conseils diplomatiques évitent le conflit et sauvent des vies.", isEnd: true },
    { content: "Le royaume sombre dans la guerre, et votre nom est perdu dans les cendres.", isEnd: true }
  ];

  const choices = {
    '0': [ { text: "Présenter la lettre au roi", toIndex: 1 }, { text: "Enquêter discrètement", toIndex: 2 } ],
    '1': [ { text: "Accuser le traître publiquement", toIndex: 4 }, { text: "Confronter en privé", toIndex: 3 } ],
    '2': [ { text: "Chercher des preuves supplémentaires", toIndex: 3 }, { text: "Faire confiance au diplomate", toIndex: 4 } ]
  };

  await createStory(token, meta, pages, choices);
}

async function createComedy(token) {
  const meta = {
    title: 'Les Tribulations du Facteur',
    description: "Une comédie de situations où vous êtes facteur dans une ville de personnages hauts en couleurs.",
    tags: ['comedy', 'slice-of-life', 'humour'],
    theme: 'comedy'
  };

  const pages = [
    { content: "Vous commencez votre tournée, mais la pluie rend tout plus drôle qu'habituellement.", isEnd: false },
    { content: "Un chien gourmand vous poursuit ; vous perdez quelques colis mais gagnez un ami.", isEnd: false },
    { content: "Vous mélangez deux lettres et provoquez un quiproquo mémorable.", isEnd: false },
    { content: "La ville rit de votre aventure; vous devenez une célébrité locale.", isEnd: true },
    { content: "Vous êtes renvoyé pour une faute comique mais trouvez une nouvelle voie plus créative.", isEnd: true }
  ];

  const choices = {
    '0': [ { text: "Courir malgré la pluie", toIndex: 1 }, { text: "Chercher un abri", toIndex: 2 } ],
    '1': [ { text: "Partager un biscuit avec le chien", toIndex: 3 }, { text: "Laisser le chien", toIndex: 4 } ],
    '2': [ { text: "Réparer l'erreur", toIndex: 3 }, { text: "Laisser le quiproquo se dérouler", toIndex: 4 } ]
  };

  await createStory(token, meta, pages, choices);
}

// Main
async function createAllAdditional() {
  try {
    console.log('🔐 Connexion en tant qu\'auteur...');
    const loginRes = await fetch(API + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'pierre@nahb.local', password: 'pierre123' })
    });
    const userData = await loginRes.json();
    if (!userData.token) {
      console.error('❌ Erreur de connexion');
      return;
    }
    const token = userData.token;
    console.log('✅ Connecté en tant que Pierre');

    await createSciFi(token);
    await createHorror(token);
    await createMystery(token);
    await createRomance(token);
    await createAdventure(token);
    await createHistorical(token);
    await createComedy(token);

    console.log('\n🎊 Toutes les histoires additionnelles ont été créées !');
  } catch (err) {
    console.error('❌ Erreur fatale:', err.message);
  }
}

createAllAdditional();
