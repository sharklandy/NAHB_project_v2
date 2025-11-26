const API = 'http://localhost:4000/api';
let token = '';

async function register() {
  try {
    const res = await fetch(API + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'author2',
        email: 'author2@test.com',
        password: 'test123'
      })
    });
    const data = await res.json();
    console.log('Réponse API:', data);
    if (data.token) {
      token = data.token;
      console.log('✅ Utilisateur créé/connecté');
    } else if (data.error) {
      // Essayer de se connecter
      const loginRes = await fetch(API + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'author2@test.com',
          password: 'test123'
        })
      });
      const loginData = await loginRes.json();
      token = loginData.token;
      console.log('✅ Utilisateur connecté');
    }
  } catch (error) {
    console.error('Erreur register:', error);
  }
}

async function createStory() {
  const story = {
    title: "Le Mystère de la Cité Engloutie",
    description: "Une aventure sous-marine où vous incarnez un explorateur à la recherche d'Atlantis",
    tags: ['aventure', 'mystere', 'ocean'],
    startPageId: 'start',
    pages: [
      {
        pageId: 'start',
        content: "Vous êtes à bord du sous-marin Nautilus-7, descendant lentement vers les profondeurs de l'océan Atlantique. Votre mission : trouver les traces de la légendaire cité d'Atlantis. Soudain, vos radars détectent une structure massive à 500 mètres. Que faites-vous ?",
        isEnd: false,
        choices: [
          { text: "S'approcher prudemment de la structure", nextPageId: 'approach' },
          { text: "Envoyer un drone de reconnaissance", nextPageId: 'drone' },
          { text: "Remonter et signaler la découverte", nextPageId: 'report' }
        ]
      },
      {
        pageId: 'approach',
        content: "Vous vous approchez de la structure. C'est une immense porte sculptée dans la roche, ornée de symboles étranges qui brillent d'une faible lueur bleue. Une inscription dans une langue inconnue est gravée au-dessus. Que faites-vous ?",
        isEnd: false,
        choices: [
          { text: "Toucher les symboles lumineux", nextPageId: 'touch_symbols' },
          { text: "Prendre des photos et analyser", nextPageId: 'analyze' },
          { text: "Chercher un moyen d'ouvrir la porte", nextPageId: 'open_door' }
        ]
      },
      {
        pageId: 'drone',
        content: "Le drone s'approche de la structure et transmet des images incroyables : une cité entière sous une bulle d'air géante ! Les bâtiments semblent intacts. Soudain, le drone perd le signal. Que faites-vous ?",
        isEnd: false,
        choices: [
          { text: "Y aller personnellement pour récupérer le drone", nextPageId: 'rescue_drone' },
          { text: "Abandonner le drone et explorer ailleurs", nextPageId: 'explore_elsewhere' },
          { text: "Envoyer un second drone", nextPageId: 'second_drone' }
        ]
      },
      {
        pageId: 'report',
        content: "Vous remontez à la surface et signalez votre découverte. Malheureusement, pendant votre absence, une tempête a déplacé les courants et vous ne retrouvez plus jamais le site. La découverte d'Atlantis restera un mystère.",
        isEnd: true,
        choices: []
      },
      {
        pageId: 'touch_symbols',
        content: "Au contact de votre main, les symboles s'illuminent intensément et la porte commence à s'ouvrir lentement avec un grondement sourd. Une lumière dorée émane de l'intérieur. Vous pénétrez dans un vaste hall orné de colonnes. Que faites-vous ?",
        isEnd: false,
        choices: [
          { text: "Explorer le hall principal", nextPageId: 'main_hall' },
          { text: "Prendre le couloir de gauche", nextPageId: 'left_corridor' },
          { text: "Prendre le couloir de droite", nextPageId: 'right_corridor' }
        ]
      },
      {
        pageId: 'analyze',
        content: "Vos analyses révèlent que les symboles sont une forme ancienne de grec mélangé à une écriture inconnue. La traduction partielle indique : 'Seul le digne peut entrer'. Vous remarquez qu'un des symboles ressemble à un mécanisme d'ouverture.",
        isEnd: false,
        choices: [
          { text: "Actionner le mécanisme", nextPageId: 'touch_symbols' },
          { text: "Continuer l'analyse", nextPageId: 'continue_analysis' }
        ]
      },
      {
        pageId: 'open_door',
        content: "Vous cherchez minutieusement et trouvez un panneau dissimulé avec des leviers. Après plusieurs essais, la porte s'ouvre dans un nuage de bulles. Vous entrez dans la cité engloutie.",
        isEnd: false,
        choices: [
          { text: "Explorer le centre de la cité", nextPageId: 'city_center' },
          { text: "Examiner les habitations", nextPageId: 'houses' }
        ]
      },
      {
        pageId: 'rescue_drone',
        content: "Vous guidez le Nautilus-7 vers la dernière position du drone. En passant à travers la bulle d'air, votre sous-marin émerge dans une caverne gigantesque ! L'air est respirable. Devant vous, une cité antique parfaitement préservée s'étend à perte de vue.",
        isEnd: false,
        choices: [
          { text: "Sortir du sous-marin et explorer à pied", nextPageId: 'explore_foot' },
          { text: "Rester dans le sous-marin et le déplacer", nextPageId: 'stay_sub' }
        ]
      },
      {
        pageId: 'explore_elsewhere',
        content: "Vous décidez d'explorer d'autres zones. Vous trouvez des ruines intéressantes mais rien d'aussi spectaculaire que ce que le drone avait filmé. Vous vous demandez souvent ce qui se serait passé si vous étiez allé récupérer le drone.",
        isEnd: true,
        choices: []
      },
      {
        pageId: 'second_drone',
        content: "Le second drone suit la même trajectoire. Cette fois, vous découvrez que le signal est brouillé par un champ électromagnétique naturel. Vous devez y aller personnellement si vous voulez en savoir plus.",
        isEnd: false,
        choices: [
          { text: "Y aller avec le sous-marin", nextPageId: 'rescue_drone' },
          { text: "Abandonner l'exploration", nextPageId: 'explore_elsewhere' }
        ]
      },
      {
        pageId: 'main_hall',
        content: "Le hall est impressionnant, avec des fresques magnifiques représentant des créatures marines et des humains vivant en harmonie. Au centre, une fontaine dont l'eau semble circuler mystérieusement. Vous apercevez quelque chose qui brille au fond.",
        isEnd: false,
        choices: [
          { text: "Plonger la main dans la fontaine", nextPageId: 'fountain' },
          { text: "Examiner les fresques de plus près", nextPageId: 'frescoes' },
          { text: "Continuer vers le fond du hall", nextPageId: 'throne_room' }
        ]
      },
      {
        pageId: 'left_corridor',
        content: "Le couloir de gauche mène à une bibliothèque immense. Des milliers de tablettes et de rouleaux sont parfaitement conservés. C'est le savoir perdu de toute une civilisation ! Vous pourriez passer des années ici.",
        isEnd: false,
        choices: [
          { text: "Prendre quelques tablettes pour les étudier", nextPageId: 'take_tablets' },
          { text: "Photographier tout ce que vous pouvez", nextPageId: 'photo_library' }
        ]
      },
      {
        pageId: 'right_corridor',
        content: "Le couloir de droite vous conduit à un arsenal. Des armes et armures anciennes brillent comme si elles avaient été forgées hier. Une épée particulière attire votre attention, elle émet une faible lueur.",
        isEnd: false,
        choices: [
          { text: "Prendre l'épée lumineuse", nextPageId: 'take_sword' },
          { text: "Ne rien toucher et revenir en arrière", nextPageId: 'main_hall' }
        ]
      },
      {
        pageId: 'continue_analysis',
        content: "Vous passez des heures à analyser les symboles. Vous faites des découvertes fascinantes sur la langue atlantéenne, mais la nuit tombe et vous devez remonter. Votre mission est un succès scientifique majeur !",
        isEnd: true,
        choices: []
      },
      {
        pageId: 'city_center',
        content: "Au centre de la cité, vous trouvez une place avec une statue colossale représentant Poseidon. À ses pieds, un cristal géant pulse d'une énergie étrange. C'est peut-être la source d'énergie de toute la cité !",
        isEnd: false,
        choices: [
          { text: "Toucher le cristal", nextPageId: 'touch_crystal' },
          { text: "Prélever un échantillon", nextPageId: 'sample_crystal' }
        ]
      },
      {
        pageId: 'houses',
        content: "Les habitations révèlent la vie quotidienne des Atlantes. Vous trouvez des objets, des bijoux, et même ce qui ressemble à des jouets d'enfants. C'est émouvant de voir ces traces d'une civilisation disparue.",
        isEnd: true,
        choices: []
      },
      {
        pageId: 'explore_foot',
        content: "Vous sortez du sous-marin et marchez dans les rues d'Atlantis. L'architecture est magnifique, mélange de grec ancien et de formes impossibles. Vous vous sentez observé. Soudain, vous apercevez une silhouette au loin.",
        isEnd: false,
        choices: [
          { text: "Suivre la silhouette", nextPageId: 'follow_shadow' },
          { text: "Retourner au sous-marin", nextPageId: 'safe_ending' }
        ]
      },
      {
        pageId: 'stay_sub',
        content: "Vous pilotez le Nautilus-7 à travers la cité immergée. Vous documentez tout avec vos caméras. C'est une découverte historique majeure ! Vous rentrez triomphant avec des preuves irréfutables de l'existence d'Atlantis.",
        isEnd: true,
        choices: []
      },
      {
        pageId: 'fountain',
        content: "Vous saisissez l'objet brillant : c'est un trident miniature en or. Dès que vous le touchez, une vision vous envahit. Vous voyez Atlantis dans toute sa gloire, puis sa chute. Le trident est la clé pour comprendre cette civilisation.",
        isEnd: true,
        choices: []
      },
      {
        pageId: 'frescoes',
        content: "Les fresques racontent l'histoire d'Atlantis : leur alliance avec les dieux de la mer, leur prospérité, puis leur orgueil qui causa leur perte. La dernière fresque montre un moyen de relever la cité !",
        isEnd: false,
        choices: [
          { text: "Chercher le mécanisme pour relever la cité", nextPageId: 'raise_city' },
          { text: "Documenter et partir", nextPageId: 'document_leave' }
        ]
      },
      {
        pageId: 'throne_room',
        content: "Au fond du hall, la salle du trône. Sur le trône, un squelette portant une couronne. Dans sa main, un sceptre encore brillant. C'est probablement le dernier roi d'Atlantis.",
        isEnd: true,
        choices: []
      },
      {
        pageId: 'take_tablets',
        content: "Vous prenez plusieurs tablettes clés. En remontant à la surface, vous réalisez que vous avez en main le savoir qui pourrait changer l'humanité : médecine avancée, énergie propre, architecture révolutionnaire. Vous êtes devenu le gardien d'un trésor inestimable.",
        isEnd: true,
        choices: []
      },
      {
        pageId: 'photo_library',
        content: "Vous photographiez frénétiquement chaque section de la bibliothèque. Des heures plus tard, vous avez numérisé une quantité incroyable de connaissances. C'est la plus grande découverte archéologique de tous les temps !",
        isEnd: true,
        choices: []
      },
      {
        pageId: 'take_sword',
        content: "Dès que vous saisissez l'épée, elle s'illumine d'une lumière aveuglante. Une voix ancienne résonne : 'Le gardien est réveillé'. Les murs tremblent. Un golem de pierre apparaît, mais voyant l'épée dans votre main, il s'incline. Vous êtes maintenant le protecteur d'Atlantis !",
        isEnd: true,
        choices: []
      },
      {
        pageId: 'touch_crystal',
        content: "Le cristal pulse sous votre main et toute la cité s'illumine ! Les fontaines se remettent à couler, les lumières s'allument. Vous avez réactivé Atlantis ! Mais avec cette énergie revenue, la cité commence à se détacher du fond marin et à remonter vers la surface !",
        isEnd: true,
        choices: []
      },
      {
        pageId: 'sample_crystal',
        content: "Vous prélevez un minuscule fragment du cristal. Même cette petite quantité contient une énergie incroyable. De retour en surface, ce fragment révolutionne la science énergétique mondiale. Vous êtes salué comme un héros de l'humanité.",
        isEnd: true,
        choices: []
      },
      {
        pageId: 'follow_shadow',
        content: "Vous suivez la silhouette qui vous mène à un temple caché. À l'intérieur, un groupe d'Atlantes vivants ! Ils ont survécu dans cette bulle pendant des millénaires. Ils vous accueillent et vous révèlent les secrets de leur civilisation. Vous devenez le premier ambassadeur entre deux mondes.",
        isEnd: true,
        choices: []
      },
      {
        pageId: 'safe_ending',
        content: "Prudent, vous retournez au Nautilus-7 et remontez à la surface avec vos découvertes. Vous avez prouvé l'existence d'Atlantis sans prendre de risques inconsidérés. C'est une mission parfaitement réussie !",
        isEnd: true,
        choices: []
      },
      {
        pageId: 'raise_city',
        content: "Vous trouvez le mécanisme antique et l'activez. Toute la cité tremble et commence à s'élever vers la surface. C'est spectaculaire mais dangereux ! Vous courez vers votre sous-marin alors que l'eau tourbillonne autour de vous. Vous parvenez à sortir juste à temps et assistez à l'émergence d'Atlantis. Le monde ne sera plus jamais le même.",
        isEnd: true,
        choices: []
      },
      {
        pageId: 'document_leave',
        content: "Vous documentez soigneusement tout ce que vous avez découvert et remontez. Vos photos et vidéos font sensation dans le monde entier. Des expéditions suivront, mais vous resterez celui qui a redécouvert Atlantis.",
        isEnd: true,
        choices: []
      }
    ]
  };

  // Créer l'histoire vide d'abord
  const res = await fetch(API + '/stories', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: story.title,
      description: story.description,
      tags: story.tags
    })
  });

  const data = await res.json();
  console.log('✅ Histoire créée:', data._id);
  
  // Ajouter les pages une par une
  const pageMap = {};
  for (const page of story.pages) {
    const pageRes = await fetch(API + '/stories/' + data._id + '/pages', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: page.content,
        isEnd: page.isEnd
      })
    });
    const pageData = await pageRes.json();
    pageMap[page.pageId] = pageData.pageId;
  }
  
  console.log('✅', story.pages.length, 'pages créées');
  
  // Maintenant ajouter les choix avec les bons pageIds
  const storyData = await fetch(API + '/stories/' + data._id);
  const fullStory = await storyData.json();
  
  for (let i = 0; i < story.pages.length; i++) {
    const originalPage = story.pages[i];
    const actualPage = fullStory.pages[i];
    
    for (const choice of originalPage.choices) {
      const mappedNextPageId = pageMap[choice.nextPageId];
      await fetch(API + '/stories/' + data._id + '/pages/' + actualPage.pageId + '/choices', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: choice.text,
          to: mappedNextPageId  // L'API attend 'to', pas 'nextPageId'
        })
      });
    }
  }
  
  console.log('✅ Choix ajoutés');
  
  // Définir la page de départ et publier l'histoire
  const firstPageId = fullStory.pages[0].pageId;
  await fetch(API + '/stories/' + data._id, {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      startPageId: firstPageId,
      status: 'published'
    })
  });
  
  console.log('✅ Histoire publiée');
  
  return data._id;
}

async function main() {
  try {
    await register();
    const storyId = await createStory();
    console.log('\n🎉 Histoire "Le Mystère de la Cité Engloutie" créée avec succès !');
    console.log('📖 30 pages avec 13 fins différentes');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

main();
