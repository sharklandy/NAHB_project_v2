const fetch = require('node-fetch');

const API = 'http://localhost:4000/api';

async function enrichStories() {
  console.log('🔄 Enrichissement des histoires...\n');

  // 1. Login
  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'author@nahb.local', password: 'password123' })
  });
  const { token } = await loginRes.json();
  console.log('✅ Connecté en tant qu\'auteur\n');

  // 2. Récupérer les histoires
  const storiesRes = await fetch(`${API}/stories`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const stories = await storiesRes.json();
  
  const gardien = stories.find(s => s.title.includes('Gardien'));
  const atlantis = stories.find(s => s.title.includes('Engloutie'));

  if (!gardien || !atlantis) {
    console.error('❌ Histoires non trouvées');
    return;
  }

  console.log(`📖 Histoire 1: ${gardien.title} (${gardien.pages.length} pages)`);
  console.log(`📖 Histoire 2: ${atlantis.title} (${atlantis.pages.length} pages)\n`);

  // 3. Enrichir "L'Éveil du Dernier Gardien"
  console.log('🔄 Enrichissement du Gardien...');
  
  const enrichedPages = {
    // Page de départ
    [gardien.startPageId]: {
      content: `Vous ouvrez lentement les yeux dans une immense tour de pierre baignée de lumière. Les vitraux colorés projettent des motifs mystiques sur le sol de marbre blanc. Vos membres sont engourdis, comme si vous aviez dormi pendant des siècles.

En vous redressant, vous remarquez que vous êtes allongé sur un lit de pierre orné de symboles anciens qui pulsent d'une lueur bleutée. L'air crépite d'énergie magique, électrisant vos sens peu à peu.

Une voix grave résonne dans votre esprit : "Enfin... Le Dernier Gardien s'éveille. Le monde agonise sous le Fléau des Ombres. Depuis des siècles, nous avons attendu ton retour. Seul un Gardien peut restaurer l'équilibre des forces."

Vous vous levez, découvrant une armure légère ornée de runes lumineuses qui couvre votre corps. Sur une table repose une épée ancienne dont la lame brille d'une aura argentée. Un miroir révèle votre reflet : vous semblez transformé, plus fort, habité par une puissance ancestrale.

La salle circulaire offre deux portes : l'une monte vers le sommet de la tour d'où vous pourrez observer le monde et mesurer l'ampleur de votre mission. L'autre descend vers les archives des anciens Gardiens où reposent les secrets de votre pouvoir et l'histoire de ceux qui vous ont précédé.`
    }
  };

  // Trouver la page "Sommet de la tour"
  const sommetPage = gardien.pages.find(p => p.content.includes('sommet') || p.content.includes('observer'));
  if (sommetPage) {
    enrichedPages[sommetPage.pageId] = {
      content: `Vous gravissez les marches de pierre usées, votre main glissant sur la rampe sculptée de batailles légendaires. L'air se rafraîchit à mesure que vous montez, le vent s'intensifie et les fenêtres révèlent un paysage de plus en plus vaste.

Enfin, vous poussez la lourde porte renforcée et émergez au sommet. La vue vous coupe le souffle : la tour s'élève à des centaines de mètres au-dessus d'une plaine verdoyante parsemée de ruines antiques et de forêts luxuriantes.

Mais ce qui glace votre sang, c'est l'horizon nord. Un voile d'obscurité s'étend comme une mer de ténèbres vivantes, avalant lentement la lumière du jour. Des éclairs violacés déchirent cette masse sombre, et vous percevez une présence malveillante qui fait frissonner votre âme jusqu'à la moelle.

Sur un piédestal au centre de la terrasse, un orbe de cristal flotte dans les airs. En l'effleurant, des visions se forment : villages en cendres, créatures d'ombre massacrant les innocents, guerriers valeureux tombant face à une horde démoniaque.

"Le Fléau des Ombres", murmure la voix. "Il a déjà anéanti trois royaumes. Les défenses s'effondrent. Tu dois choisir : rassembler des alliés dans les terres encore libres, ou affronter directement la source de cette corruption au Cœur des Ténèbres. Mais sache que chaque jour perdu renforce l'ennemi et scelle le destin du monde."

Une carte magique se déploie, brillant de runes dorées. Deux chemins s'offrent à vous : les royaumes de l'Est où vivent de puissants mages et guerriers légendaires, ou le Nord maudit, droit vers le cœur de la tempête d'ombres où règne l'entité ancienne.`
    };
  }

  // Trouver la page "Archives"
  const archivesPage = gardien.pages.find(p => p.content.includes('archives') || p.content.includes('bibliothèque'));
  if (archivesPage) {
    enrichedPages[archivesPage.pageId] = {
      content: `Vous descendez l'escalier en colimaçon qui s'enfonce dans les ténèbres. Des torches enchantées s'allument à votre passage, révélant des fresques murales extraordinaires : Gardiens légendaires terrassant des dragons, scellant des portails démoniaques, sacrifiant tout pour protéger les innocents.

Plus vous descendez, plus l'air se charge de magie ancienne. Vous sentez le poids des siècles, la sagesse et les sacrifices de vos prédécesseurs. Après ce qui semble une éternité, vous atteignez une immense bibliothèque souterraine aux dimensions impossibles.

Des milliers de volumes s'alignent sur des étagères qui montent jusqu'à un plafond perdu dans l'obscurité. Au centre trône un grimoire colossal sur un lutrin de pierre noire veinée d'or. Le livre s'ouvre seul à votre approche, des caractères lumineux dansant sur ses pages.

"Bienvenue, Gardien", s'écrit magiquement sur la première page. "Ici réside toute la connaissance de tes prédécesseurs. Le Fléau que tu affrontes n'est pas une simple armée, mais Nyx'therion, une entité ancienne bannie il y a mille ans par le Premier Gardien au prix de sa vie."

Les pages tournent révélant sorts oubliés, techniques de combat perdues et l'histoire de la dernière bataille : "Le Sceau Primordial est brisé. Nyx'therion est libre et sa puissance croît. Pour la vaincre définitivement, tu dois réunir les trois Reliques sacrées : l'Épée du Crépuscule qui peut trancher les ombres, le Bouclier de l'Aube qui repousse les ténèbres, et la Couronne des Étoiles qui amplifie ta puissance divine."

Une carte holographique apparaît : l'Épée dans les Montagnes de Cristal gardée par un dragon de glace, le Bouclier dans les Marais Maudits protégé par les esprits des morts, la Couronne dans les Ruines Célestes au-dessus des nuages, défendue par les gardiens éternels.

"Attention", avertit le grimoire en lettres de feu. "Nyx'therion envoie déjà ses trois champions les plus puissants pour s'emparer des reliques. Si elle les obtient avant toi, le monde sombrera dans les ténèbres éternelles."`
    };
  }

  // Mettre à jour les pages
  for (const [pageId, data] of Object.entries(enrichedPages)) {
    try {
      const updateRes = await fetch(`${API}/stories/${gardien._id}/pages/${pageId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data)
      });
      
      if (updateRes.ok) {
        console.log(`  ✅ Page mise à jour`);
      }
    } catch (err) {
      console.error(`  ❌ Erreur:`, err.message);
    }
  }

  // 4. Enrichir "Le Mystère de la Cité Engloutie"
  console.log('\n🔄 Enrichissement d\'Atlantis...');
  
  // Mettre à jour la description
  await fetch(`${API}/stories/${atlantis._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      description: "Plongez dans les profondeurs de l'océan pour découvrir les secrets d'une civilisation perdue depuis des millénaires. Une aventure sous-marine épique où chaque choix peut révéler des trésors inestimables ou des dangers mortels. Explorez des temples engloutis aux architectures impossibles, déchiffrez des inscriptions dans une langue oubliée, et percez le mystère de la disparition soudaine d'Atlantis. Mais attention : les profondeurs abritent des créatures qui ne devraient pas exister, et certains secrets sont mieux gardés dans l'oubli..."
    })
  });

  // Enrichir la page de départ d'Atlantis
  const atlantisEnriched = {
    [atlantis.startPageId]: {
      content: `Les eaux cristallines de la Méditerranée s'étendent à perte de vue sous le soleil éclatant. Vous êtes à bord du navire de recherche "Poséidon", équipé des technologies de plongée les plus avancées au monde. Votre équipe d'archéologues marins a passé des années à rechercher la légendaire cité d'Atlantis.

Et aujourd'hui, vos efforts ont enfin porté leurs fruits. Le sonar vient de révéler une anomalie massive à 2000 mètres de profondeur : des structures géométriques parfaites, trop régulières pour être naturelles. Des pyramides, des dômes, des tours... une cité entière engloutie depuis des millénaires.

Le Dr. Chen, votre mentor, vous tend un tablet affichant les scans 3D : "C'est incroyable... Les dimensions correspondent exactement aux descriptions de Platon. Regardez ces proportions, cette symétrie... C'est bien au-delà de ce que les civilisations antiques auraient pu construire avec leurs outils."

Votre cœur bat la chamade. Vous êtes sur le point d'entrer dans l'histoire, de résoudre l'un des plus grands mystères de l'humanité. Mais une part de vous ressent aussi une appréhension inexplicable, comme si quelque chose au fond de l'océan vous appelait... ou vous mettait en garde.

"Nous avons deux options", continue le Dr. Chen en pointant l'écran. "Nous pouvons descendre directement au centre de la cité avec le submersible principal - c'est plus rapide mais plus risqué si nous rencontrons un problème. Ou nous pouvons utiliser les deux mini-sous-marins pour explorer d'abord le périmètre et cartographier la zone avant de nous aventurer plus profond - plus long mais plus sûr."

Le reste de l'équipe vous regarde. En tant que chef de mission, c'est à vous de décider. Le soleil commence à décliner. Si vous attendez trop, les courants nocturnes rendront la plongée dangereuse. Il faut choisir maintenant.`
    }
  };

  for (const [pageId, data] of Object.entries(atlantisEnriched)) {
    try {
      const updateRes = await fetch(`${API}/stories/${atlantis._id}/pages/${pageId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data)
      });
      
      if (updateRes.ok) {
        console.log(`  ✅ Page mise à jour`);
      }
    } catch (err) {
      console.error(`  ❌ Erreur:`, err.message);
    }
  }

  console.log('\n✅ Enrichissement terminé!');
  console.log('Les histoires sont maintenant plus longues et détaillées.');
}

enrichStories().catch(console.error);
