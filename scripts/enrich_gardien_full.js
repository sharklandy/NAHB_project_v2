const fetch = require('node-fetch');

const API = 'http://localhost:4000/api';

async function enrichGardienStory() {
  console.log('🔄 Enrichissement complet de L\'Éveil du Dernier Gardien...\n');

  // 1. Login
  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'author@nahb.local', password: 'password123' })
  });
  const { token } = await loginRes.json();
  console.log('✅ Connecté\n');

  // 2. Récupérer l'histoire
  const storiesRes = await fetch(`${API}/stories`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const stories = await storiesRes.json();
  
  const gardien = stories.find(s => s.title.includes('Gardien'));
  if (!gardien) {
    console.error('❌ Histoire non trouvée');
    return;
  }

  console.log(`📖 ${gardien.title} - ${gardien.pages.length} pages\n`);

  // 3. Récupérer toutes les pages
  const storyRes = await fetch(`${API}/stories/${gardien._id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const storyData = await storyRes.json();
  
  console.log('Pages actuelles:');
  storyData.pages.forEach((p, i) => {
    console.log(`${i+1}. ${p.content.substring(0, 80)}...`);
  });

  // 4. Enrichir TOUTES les pages principales
  console.log('\n🔄 Mise à jour des pages...\n');

  let updated = 0;

  for (const page of storyData.pages) {
    let newContent = page.content;
    
    // Page de départ (réveil)
    if (page.content.includes('ouvrez les yeux') || page.pageId === storyData.startPageId) {
      newContent = `Vous ouvrez lentement les yeux dans une immense tour de pierre baignée de lumière. Les vitraux colorés projettent des motifs mystiques sur le sol de marbre blanc incrusté de veines dorées. Vos membres sont engourdis, comme si vous aviez dormi pendant des siècles dans un sommeil enchanté.

En vous redressant péniblement, vous remarquez que vous êtes allongé sur un lit de pierre orné de symboles anciens gravés avec une précision surnaturelle. Ces symboles pulsent d'une lueur bleutée, répondant à votre éveil comme s'ils reconnaissaient leur maître après une longue attente.

L'air crépite d'énergie magique pure, électrisant vos sens peu à peu. Chaque respiration semble réveiller une partie de vous-même que vous aviez oubliée, une puissance ancestrale qui sommeillait dans les profondeurs de votre être.

Une voix grave et puissante résonne soudain dans votre esprit, faisant vibrer votre crâne : "Enfin... Le Dernier Gardien s'éveille après mille ans de sommeil. Le monde agonise sous le Fléau des Ombres. Depuis des siècles, nous avons attendu ton retour, espérant contre tout espoir. Seul un Gardien peut restaurer l'équilibre des forces et repousser les ténèbres."

Vous vous levez sur des jambes tremblantes, découvrant que vous portez une armure légère d'un métal argenté inconnu, ornée de runes lumineuses qui dansent à la surface comme des flammes vivantes. Sur une table de pierre près de vous repose une épée ancienne dont la lame brille d'une aura argentée pulsante. Le pommeau est serti d'une gemme qui semble contenir une galaxie miniature.

Un grand miroir aux bords sculptés de dragons vous renvoie votre reflet. Vous semblez transformé, plus grand, plus fort, vos yeux brillent d'une lueur surnaturelle. Une puissance divine coule maintenant dans vos veines, héritage de tous les Gardiens qui vous ont précédé.

La salle circulaire dans laquelle vous vous trouvez est majestueuse. Deux immenses portes de bois renforcé de métal magique s'offrent à vous. La première, à votre gauche, mène vers le sommet de la tour où vous pourrez observer le monde extérieur et comprendre l'ampleur de la catastrophe qui s'abat sur lui. La seconde, à votre droite, descend vers les profondeurs de la tour, là où reposent les archives secrètes des anciens Gardiens et les secrets oubliés de votre pouvoir légendaire.

Le choix vous appartient, mais vous sentez que le destin du monde entier repose sur vos épaules. Chaque seconde compte.`;
    }
    
    // Sommet de la tour
    else if (page.content.includes('sommet') || page.content.includes('observer') || page.content.includes('monter')) {
      newContent = `Vous gravissez les marches de pierre usées par le passage de milliers de Gardiens avant vous. Votre main glisse sur la rampe finement sculptée représentant des scènes de batailles légendaires : dragons terrassés, démons bannis, portails scellés. Chaque marche raconte une victoire, chaque fresque une épopée.

L'air se rafraîchit progressivement à mesure que vous montez cette spirale sans fin. Le vent s'intensifie, sifflant à travers les fenêtres étroites qui ponctuent la montée. Par ces ouvertures, vous apercevez des fragments d'un paysage de plus en plus vaste, de plus en plus inquiétant.

Vos jambes brûlent après ce qui semble une éternité d'ascension. Enfin, essoufflé, vous atteignez une lourde porte de bois renforcé de barres de métal noir gravées de runes protectrices. Vous la poussez avec effort et émergez au sommet de la tour.

Le spectacle qui s'offre à vous vous coupe littéralement le souffle et glace votre sang. La tour du Gardien s'élève à des centaines de mètres au-dessus d'une vaste plaine autrefois verdoyante, maintenant marquée par la guerre. Des ruines de villages parsèment le paysage, des forêts brûlées s'étendent comme des cicatrices noires, et au loin, vous distinguez les restes fumants de ce qui fut jadis de grandes cités.

Mais ce qui attire immédiatement votre attention et fait battre votre cœur plus vite, c'est l'horizon nord. Un voile d'obscurité absolue s'étend comme une mer de ténèbres vivantes et mouvantes, avalant lentement mais inexorablement la lumière du jour. Cette masse sombre semble respirer, pulser, grandir. Des éclairs violacés d'une énergie corrompue zèbrent cette tempête d'ombres, et vous pouvez percevoir, même à cette distance colossale, une présence malveillante d'une puissance terrifiante qui fait frissonner votre âme jusqu'à la moelle.

Sur un piédestal de cristal noir au centre de la terrasse circulaire, vous découvrez un orbe de divination flottant dans les airs, maintenu par une magie ancienne. Lorsque vous l'effleurez avec précaution, des images horrifiantes se forment dans sa surface translucide comme un cauchemar éveillé : des villages entiers réduits en cendres, des armées massacrées, des créatures d'ombre pure dévorant tout sur leur passage, des guerriers valeureux tombant les uns après les autres face à une horde démoniaque sans fin.

"Le Fléau des Ombres", murmure la voix dans votre esprit avec un ton grave et désespéré. "Nyx'therion, l'Entité Primordiale des Ténèbres, libérée de sa prison millénaire. Elle a déjà anéanti trois des cinq grands royaumes. Des millions de vies perdues. Les défenses des dernières nations libres s'effondrent jour après jour. Tu dois faire un choix crucial, Gardien."

La voix continue, urgente : "Tu peux rassembler des alliés dans les terres encore libres à l'Est - les mages de la Tour d'Argent, les guerriers du Royaume de Fer, les prêtres du Temple Solaire. Ensemble, vous pourriez peut-être contenir l'invasion le temps de trouver une solution. Ou tu peux affronter directement la source de cette corruption au Cœur des Ténèbres, là où réside Nyx'therion, mais ce serait un voyage sans retour garanti pour un Gardien seul et affaibli."

Une carte magique monumentale se déploie soudain dans les airs devant vous, brillant de milliers de runes dorées. Elle montre en temps réel l'avancée des ténèbres. Deux chemins principaux s'illuminent : les royaumes de l'Est, derniers bastions de la civilisation où vivent encore de puissants alliés potentiels, ou le Nord maudit, droit vers le cœur de la tempête d'ombres où règne l'entité ancienne dans son palais de cauchemar.

"Choisis vite, Gardien", insiste la voix. "Chaque heure perdue permet aux ténèbres de gagner du terrain. Chaque jour qui passe scelle un peu plus le destin tragique du monde."`;
    }
    
    // Archives/bibliothèque
    else if (page.content.includes('descen') || page.content.includes('archives') || page.content.includes('bibliothèque')) {
      newContent = `Vous décidez de descendre dans les profondeurs mystérieuses de la tour. Un escalier en colimaçon vertigineux s'enfonce dans les ténèbres épaisses, semblant ne jamais finir. Des torches enchantées s'allument magiquement à votre passage, projetant des ombres dansantes sur les murs ancestraux.

Ces murs sont entièrement couverts de fresques murales extraordinaires et détaillées, véritables œuvres d'art racontant l'épopée des Gardiens à travers les âges. Vous voyez des héros légendaires dans des poses héroïques : certains terrassant des dragons titanesques crachant du feu, d'autres scellant des portails démoniaques d'où surgissent des hordes infernales, d'autres encore sacrifiant leur vie pour protéger des innocents face à des ennemis surpuissants.

Plus vous descendez dans cet escalier sans fin, plus l'air se charge de magie ancienne et puissante. C'est presque tangible, comme une brume invisible qui imprègne chaque pierre. Vous sentez le poids écrasant des siècles, la sagesse accumulée et les innombrables sacrifices de vos prédécesseurs qui ont donné leur vie pour protéger le monde.

Après ce qui semble une éternité de descente dans cette spirale hypnotique, vos jambes commençant à fatiguer, vous atteignez enfin une porte monumentale en bois noir veiné d'or. Elle s'ouvre silencieusement à votre approche, révélant une immense bibliothèque souterraine aux dimensions littéralement impossibles, défiant toutes les lois de la physique connue.

L'endroit est absolument gigantesque, cathédrale du savoir. Des dizaines de milliers de volumes anciens s'alignent sur des étagères interminables qui montent jusqu'à un plafond perdu dans une obscurité étoilée comme un ciel nocturne. Des échelles flottantes bougent d'elles-mêmes, des livres volent entre les rayonnages, et une lumière douce et apaisante émane des cristaux incrustés dans les colonnes de pierre.

Au centre exact de cette bibliothèque magistrale trône un grimoire absolument colossal, aussi grand qu'une table, posé sur un lutrin de pierre noire veinée d'or et d'argent. Le livre semble vivant, respirant doucement. Il s'ouvre de lui-même à votre approche avec un bruissement de pages anciennes, révélant des caractères lumineux qui dansent et se réorganisent constamment sur le parchemin enchanté.

"Bienvenue, Dernier Gardien", s'écrit magiquement sur la première page en lettres de feu qui s'animent. "Je suis le Codex Éternel, mémoire collective de tous tes prédécesseurs. Ici réside toute la connaissance accumulée pendant dix mille ans de lutte contre les ténèbres. Le Fléau que tu affrontes maintenant n'est pas une simple armée de monstres, mais Nyx'therion elle-même, l'Entité Primordiale des Ténèbres, bannie il y a exactement mille ans par le Premier Gardien au prix ultime de sa vie et de son âme."

Les pages se tournent d'elles-mêmes dans un ballet hypnotique, révélant des secrets oubliés : sorts de destruction massive, techniques de combat perdues depuis des siècles, rituels de protection, incantations de guérison, et surtout, l'histoire complète et tragique de la dernière grande bataille qui a failli détruire le monde.

"Le Sceau Primordial qui maintenait Nyx'therion prisonnière dans le Vide est brisé", continue le texte lumineux. "Elle est libre et sa puissance corrompue croît de jour en jour, se nourrissant de la peur et du désespoir des mortels. Pour la vaincre définitivement cette fois, pour l'éradiquer plutôt que simplement la bannir, tu dois absolument réunir les trois Reliques Sacrées créées par le Premier Gardien : l'Épée du Crépuscule qui peut trancher les ombres elles-mêmes, le Bouclier de l'Aube qui repousse toute corruption, et la Couronne des Étoiles qui amplifie ta puissance divine au-delà des limites mortelles."

Une carte holographique tridimensionnelle apparaît soudain au-dessus du grimoire, flottant dans les airs et montrant le monde entier. Trois points brillent intensément : l'Épée repose dans les Montagnes de Cristal gelées au-delà des mers du nord, gardée par Glacius, un dragon de glace millénaire. Le Bouclier est caché dans les Marais Maudits du sud où règnent les âmes damnées et les esprits vengeurs des morts. La Couronne se trouve dans les Ruines Célestes suspendues au-dessus des nuages, défendues par les Gardiens Éternels, des golems de pierre invincibles.

"Attention, Dernier Gardien", avertit le grimoire en lettres de feu rouge sang qui crépitent. "Nyx'therion n'est pas stupide. Elle a déjà envoyé ses trois champions les plus puissants et cruels pour s'emparer des reliques avant toi : le Seigneur Vampire Malakar, la Sorcière des Ombres Sheera, et le Chevalier Déchu Drakmore. Si elle obtient ne serait-ce qu'une seule relique avant toi, elle deviendra quasi invincible. Si elle en obtient deux, toute résistance sera futile. Si elle les obtient toutes les trois... le monde sombrera dans les ténèbres éternelles et toute vie sera éteinte à jamais."

Le grimoire vibre d'urgence : "Le temps presse terriblement. Chaque instant compte. Fais ton choix et pars immédiatement. L'avenir de toute vie sur cette terre repose sur tes épaules."`;
    }

    // Mettre à jour si le contenu a changé
    if (newContent !== page.content && newContent.length > page.content.length) {
      try {
        const updateRes = await fetch(`${API}/stories/${gardien._id}/pages/${page.pageId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ content: newContent })
        });
        
        if (updateRes.ok) {
          console.log(`✅ Page enrichie: ${newContent.substring(0, 50)}...`);
          updated++;
        } else {
          console.log(`❌ Erreur mise à jour: ${page.pageId}`);
        }
      } catch (err) {
        console.error(`❌ Erreur:`, err.message);
      }
    }
  }

  console.log(`\n✅ ${updated} pages enrichies avec succès!`);
}

enrichGardienStory().catch(console.error);
