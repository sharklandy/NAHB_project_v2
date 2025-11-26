const fetch = require('node-fetch');

const API = 'http://localhost:4000/api';

async function enrichAllPages() {
  console.log('🔄 Enrichissement de TOUTES les pages...\n');

  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'author@nahb.local', password: 'password123' })
  });
  const { token } = await loginRes.json();

  const storiesRes = await fetch(`${API}/stories`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const stories = await storiesRes.json();
  
  const gardien = stories.find(s => s.title.includes('Gardien'));
  
  const storyRes = await fetch(`${API}/stories/${gardien._id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const story = await storyRes.json();

  // Enrichir chaque page
  let updated = 0;
  
  for (const page of story.pages) {
    let newContent = page.content;
    
    // Enrichir selon le contenu actuel
    if (page.content.includes('réveillez dans une forêt')) {
      newContent = `Vous ouvrez lentement les yeux. Une brume épaisse et mystérieuse enveloppe la forêt ancestrale qui vous entoure. Les arbres millénaires, aux troncs aussi larges que des maisons, s'élèvent vers un ciel à peine visible à travers leur canopée dense. Une lumière étrange, presque surnaturelle, filtre à travers les feuilles, créant des jeux d'ombres et de lumière qui semblent danser.

Vous ne vous souvenez pas comment vous êtes arrivé ici. Votre dernier souvenir est flou, comme un rêve qui s'évanouit au réveil. Mais quelque chose en vous sait que vous avez un but, une mission d'une importance capitale.

Au loin, perçant la brume comme un phare dans la tempête, vous apercevez une immense tour de pierre noire. Elle s'élève majestueusement au-dessus des arbres, si haute que son sommet se perd dans les nuages. Des runes anciennes brillent faiblement sur ses flancs, pulsant d'une lueur bleutée hypnotique. Cette tour vous appelle, vous attire comme un aimant.

Une voix résonne dans votre esprit, grave et ancienne : "Le Gardien s'éveille enfin. Le monde a besoin de toi. Choisis ton chemin, car le destin de tous dépend de tes décisions."

Vous devez faire un choix : vous diriger directement vers cette tour mystérieuse qui semble vous attendre, ou explorer d'abord la forêt pour comprendre où vous êtes et ce qui vous attend.`;
    }
    
    else if (page.content.includes('tour semble abandonnée')) {
      newContent = `Vous vous approchez prudemment de la tour imposante. Plus vous avancez, plus vous sentez une énergie mystique émaner de la structure. La tour semble abandonnée depuis des siècles, recouverte de lierre et de mousse, mais quelque chose en elle reste vivant, puissant.

Les portes massives de bronze sont entrouvertes, comme si elles vous attendaient. Des runes anciennes brillent faiblement sur toute la surface, formant des motifs complexes qui semblent raconter une histoire oubliée. Vous reconnaissez certains symboles : protection, pouvoir, sacrifice, destin.

L'air à l'intérieur est chargé de magie. Vos pas résonnent sur le sol de marbre blanc veiné d'or. La salle principale est circulaire et immense. Des colonnes magistrales soutiennent un plafond si haut qu'il se perd dans l'obscurité. Au centre, vous voyez un escalier qui monte vers les étages supérieurs de la tour, promettant des révélations.

Mais vous remarquez aussi une porte dissimulée derrière une tapisserie déchirée. Elle semble mener vers un sous-sol, vers les profondeurs de la tour où dorment peut-être des secrets encore plus anciens.

Où voulez-vous aller : vers les hauteurs de la tour ou vers ses profondeurs mystérieuses ?`;
    }
    
    else if (page.content.includes('forêt, vous trouvez un ancien sanctuaire')) {
      newContent = `Vous décidez d'explorer la forêt avant de vous aventurer vers la tour. Vos pas vous mènent à travers un dédale d'arbres anciens et de sentiers oubliés. La brume s'épaissit, créant une atmosphère irréelle et inquiétante.

Soudain, vous découvrez un ancien sanctuaire caché entre les racines gigantesques d'un arbre mort depuis longtemps. Le sanctuaire est en ruine, mais vous pouvez encore voir des traces de sa gloire passée : des statues brisées, des autels renversés, des fresques effacées par le temps.

Au centre du sanctuaire, sur un piédestal de pierre intact, repose un cristal magnifique de la taille d'un poing. Il pulse d'une lumière douce et apaisante, comme un cœur qui bat. Des couleurs kaléidoscopiques dansent à l'intérieur de sa surface translucide. Vous vous sentez irrésistiblement attiré par lui.

En vous approchant, vous remarquez des inscriptions gravées dans la pierre du piédestal. Elles sont dans une langue ancienne, mais miraculeusement, vous pouvez les comprendre : "Celui qui touche le Cristal de Vérité verra ce qui fut et ce qui sera. Mais attention, car la vérité peut être un fardeau trop lourd à porter."

Des voix fantomatiques semblent chuchoter autour de vous, vous encourageant à toucher le cristal. Mais vous sentez aussi une présence dans la forêt, quelque chose qui vous observe. Peut-être devriez-vous d'abord examiner les alentours du sanctuaire avant de toucher le cristal ?`;
    }
    
    else if (page.content.includes('sous-sol, vous découvrez une armure')) {
      newContent = `Vous descendez prudemment les marches de pierre qui mènent au sous-sol de la tour. L'obscurité est presque totale, mais des cristaux incrustés dans les murs s'illuminent à votre passage, créant une lumière bleutée fantasmagorique.

Le sous-sol est une vaste crypte remplie de reliques et de trésors oubliés. Des armes anciennes sont accrochées aux murs, des livres poussiéreux s'entassent sur des étagères, et des coffres fermés promettent des secrets.

Mais ce qui attire immédiatement votre attention, c'est une armure magnifique exposée au centre de la salle sur un mannequin de pierre. L'armure brille d'un éclat argenté, couverte de runes qui pulsent faiblement. Elle semble vous appeler, résonner avec quelque chose au plus profond de votre être.

En la touchant avec hésitation, une vague de souvenirs qui ne sont pas les vôtres déferle dans votre esprit. Vous voyez des batailles épiques, des héros légendaires, des sacrifices ultimes. Vous comprenez soudain la vérité : cette armure appartenait aux Gardiens, des guerriers divins qui ont protégé le monde pendant des millénaires. Et d'une manière ou d'une autre, vous êtes le dernier d'entre eux.

L'armure vibre sous vos doigts, comme si elle reconnaissait son nouveau maître. Vous pourriez la revêtir et accepter votre destinée, ou continuer à explorer le sous-sol pour trouver plus d'informations avant de prendre une décision aussi lourde de conséquences.`;
    }
    
    else if (page.content.includes('runes révèlent une prophétie')) {
      newContent = `Vous examinez attentivement les runes qui ornent les murs de la tour. Elles semblent s'animer à votre approche, brillant de plus en plus fort, formant des mots et des phrases dans une langue que vous ne devriez pas comprendre, mais que vous déchiffrez pourtant sans difficulté.

Les runes révèlent une prophétie ancienne, gravée ici il y a des millénaires par le Premier Gardien lui-même : "Quand les étoiles s'aligneront dans la constellation du Dragon, quand la lune sera rouge sang et que les ténèbres menaceront d'engloutir le monde, alors le Dernier Gardien s'éveillera de son sommeil éternel. Il portera le poids du monde sur ses épaules et devra faire face à son destin."

La prophétie continue, de plus en plus précise et inquiétante : "Le Fléau des Ombres reviendra, plus puissant que jamais. L'Entité Primordiale des Ténèbres brisera ses chaînes. Seul le Gardien pourra s'opposer à elle, armé des trois Reliques Sacrées. Mais attention, car le chemin sera semé d'embûches, de trahisons et de sacrifices."

Des images commencent à se former dans votre esprit, projetées par les runes elles-mêmes. Vous voyez un avenir sombre : des villes en flammes, des armées massacrées, un voile d'obscurité s'étendant sur le monde entier. Mais vous voyez aussi de l'espoir : des héros se levant pour combattre, des alliances se formant, et vous-même, brandissant une épée de lumière face aux ténèbres.

Les runes pulsent une dernière fois avant de s'éteindre progressivement. Un choix s'offre à vous : continuer à explorer la tour pour en apprendre davantage, ou partir immédiatement vers votre destinée, armé de cette prophétie.`;
    }
    
    else if (page.content.includes('cristal vous transporte dans le passé')) {
      newContent = `Vous touchez le cristal pulsant avec précaution. Immédiatement, le monde autour de vous disparaît dans un flash de lumière aveuglant. Vous sentez votre corps devenir immatériel, votre conscience s'élever au-delà du temps et de l'espace.

Le cristal est un artéfact de divination d'une puissance inimaginable. Il vous transporte littéralement dans le passé, non pas physiquement, mais comme un spectateur invisible d'événements qui se sont déroulés il y a des siècles.

Vous vous retrouvez au cœur d'une bataille titanesque. Des milliers de guerriers en armures étincelantes combattent désespérément contre une horde de créatures d'ombre. Le ciel est déchiré par des éclairs de magie pure. Des dragons crachent du feu sur les rangs ennemis. Des mages invoquent des sorts de destruction massive.

Au centre du chaos, vous voyez un guerrier magnifique dans une armure brillante - le même que celle que vous avez vue dans le sous-sol de la tour. C'est un Gardien, peut-être le dernier avant vous. Il se bat avec une bravoure incroyable, mais vous pouvez voir qu'il est submergé. L'ennemi est trop nombreux, trop puissant.

Puis vous assistez à la chute finale : une explosion d'énergie noire engloutit le champ de bataille. Le royaume entier s'effondre. Le Gardien réussit in extremis à sceller l'entité maléfique, mais au prix de sa vie et de tout son peuple.

La vision se dissipe lentement. Vous revenez à la réalité, haletant, transpirant. Vous comprenez maintenant l'ampleur de la tâche qui vous attend. Le sceau qui maintenait l'entité prisonnière est en train de s'affaiblir. L'histoire est sur le point de se répéter, et vous êtes le seul qui puisse l'empêcher.

Mais cette connaissance a un prix : vous sentez le poids écrasant de la responsabilité sur vos épaules. Êtes-vous prêt à accepter ce fardeau ?`;
    }

    // Pages génériques - les enrichir aussi
    else if (page.content.includes('Contenu de la page') && page.content.includes('aventure épique')) {
      const pageMatch = page.content.match(/page (\d+)/);
      const pageNum = pageMatch ? pageMatch[1] : '?';
      newContent = `Vous continuez votre périple à travers des contrées dangereuses et mystérieuses. Chaque pas vous rapproche de votre destinée, mais aussi des dangers qui vous guettent.

Le paysage change autour de vous. Des montagnes escarpées se dressent à l'horizon, leurs sommets enneigés perçant les nuages. Des forêts sombres où rôdent des créatures anciennes. Des ruines de civilisations oubliées, témoins silencieux de gloires passées.

Vous rencontrez des voyageurs, des marchands, des guerriers. Certains vous racontent des légendes sur les Gardiens d'autrefois. D'autres murmurent des rumeurs inquiétantes sur l'avancée des ténèbres qui gagnent du terrain chaque jour.

Des signes avant-coureurs de la catastrophe à venir se multiplient : le ciel s'assombrit, les animaux fuient vers le sud, des villages entiers sont abandonnés. La peur se répand comme une épidémie.

Mais vous n'êtes pas seul. Des alliés commencent à se rallier à votre cause. Des guerriers courageux, des mages puissants, des prêtres dévoués. Ensemble, vous formez une résistance contre les ténèbres.

Vous devez maintenant faire des choix stratégiques qui affecteront non seulement votre propre survie, mais le destin de milliers de personnes. Chaque décision compte. Chaque hésitation peut être fatale.

Le chemin devant vous se divise à nouveau. Quelle direction allez-vous prendre dans cette étape cruciale de votre quête ?`;
    }

    // Si le contenu a changé, mettre à jour
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
          console.log(`✅ Page ${page.pageId} enrichie`);
          updated++;
        }
      } catch (err) {
        console.error(`❌ Erreur page ${page.pageId}:`, err.message);
      }
    }
  }

  console.log(`\n✅ ${updated} pages enrichies!`);
}

enrichAllPages().catch(console.error);
