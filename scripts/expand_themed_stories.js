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

async function appendPages(token, storyId, newPages) {
  const created = [];
  for (let i = 0; i < newPages.length; i++) {
    const res = await fetch(`${API}/stories/${storyId}/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(newPages[i])
    });
    const j = await res.json();
    created.push(j.pageId);
  }
  return created;
}

async function findStoryByTitle(token, title) {
  const res = await fetch(`${API}/stories?published=1`);
  const list = await res.json();
  const normalize = (str) => {
    if (!str) return '';
    return str
      .toString()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9 ]/gi, '')
      .trim()
      .toLowerCase();
  };

  const target = normalize(title);
  // try exact normalized match first
  let found = list.find(s => normalize(s.title) === target);
  if (found) return found;
  // fallback: contains
  found = list.find(s => normalize(s.title).includes(target) || target.includes(normalize(s.title)));
  if (found) return found;

  console.log('Available stories (normalized):');
  list.forEach(s => console.log(' -', normalize(s.title)));
  return null;
}

async function getStory(token, storyId) {
  const res = await fetch(`${API}/stories/${storyId}`);
  return await res.json();
}

async function expandStory(token, title, newPages, choiceLinks) {
  console.log(`\n🔧 Enrichissement de "${title}"...`);
  const story = await findStoryByTitle(token, title);
  if (!story) {
    console.warn(`⚠️ Histoire non trouvée: ${title}`);
    return;
  }
  const storyId = story.id || story._id;
  const full = await getStory(token, storyId);
  const existingPages = full.pages || [];
  const startPageId = full.startPageId || (existingPages[0] && existingPages[0].pageId);

  // Append pages
  const created = await appendPages(token, storyId, newPages);
  console.log(`  ➕ ${created.length} pages ajoutées`);

  // Helper to resolve "from" pageId: if 'start' use startPageId, if number use existingPages[index].pageId, if 'newX' use created[index]
  const resolve = (ref) => {
    if (!ref && ref !== 0) return null;
    if (ref === 'start') return startPageId;
    if (typeof ref === 'number') {
      // existing page index
      return (existingPages[ref] && existingPages[ref].pageId) || null;
    }
    if (typeof ref === 'string' && ref.startsWith('new')) {
      const idx = parseInt(ref.slice(3), 10);
      return created[idx];
    }
    return null;
  };

  // Create choices
  for (const link of choiceLinks) {
    const fromId = resolve(link.from);
    const toId = resolve(link.to);
    if (!fromId || !toId) {
      console.warn('  ⚠️ Impossible de résoudre lien', link);
      continue;
    }
    await addChoice(token, storyId, fromId, link.text, toId);
  }

  console.log(`✅ Enrichissement terminé pour "${title}"`);
}

async function main() {
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

    // === Sci-Fi: add branching and endings ===
    await expandStory(token,
      'Échos du Dernier Orbiteur',
      [
        { content: 'Le noyau émet une surcharge; des hallucinations apparaissent à l\'équipage.', isEnd: false }, // new0
        { content: 'Un signal inconnu se synchronise avec vos systèmes : un message, ou un piège ?', isEnd: false }, // new1
        { content: 'Vous arrivez à réparer partiellement le noyau mais le saut nécessite une source d\'énergie externe.', isEnd: false }, // new2
        { content: 'Vous activez l\'impulsion de saut ; la manœuvre est hasardeuse.', isEnd: false }, // new3
        { content: 'Votre sacrifice stabilise le noyau ; l\'équipage survit mais vous êtes perdu dans l\'espace. Fin héroïque.', isEnd: true }, // new4
        { content: 'Le signal était un piège : l\'orbiteur est aspiré dans une faille. Fin tragique.', isEnd: true }, // new5
        { content: 'La flotte arrive et remorque le vaisseau sain et sauf. Vous devenez pilote célébré. Fin victorieuse.', isEnd: true } // new6
      ],
      [
        { from: 'start', to: 'new0', text: 'Vérifier les diagnostics du noyau' },
        { from: 'start', to: 'new1', text: 'Scanner le signal inconnu' },
        { from: 'new0', to: 'new2', text: 'Isoler la zone de surcharge' },
        { from: 'new1', to: 'new3', text: 'Tenter une synchronisation contrôlée' },
        { from: 'new2', to: 'new3', text: 'Rediriger l\'énergie vers les propulseurs' },
        { from: 'new3', to: 'new4', text: 'Activer impulsion en mode secours (coûteux)' },
        { from: 'new3', to: 'new5', text: 'Forcer le saut sans stabilisation' },
        { from: 'new0', to: 'new6', text: 'Appeler la flotte pour assistance' }
      ]
    );

    // === Horror: add deeper endings ===
    await expandStory(token,
      'La Maison aux Murmures',
      [
        { content: 'Une photo montre l\'ancien propriétaire; une date est entourée.', isEnd: false }, // new0
        { content: 'Vous trouvez une boîte de musique qui joue seule la mélodie d\'une berceuse oubliée.', isEnd: false }, // new1
        { content: 'Dans la cave, une porte scellée s\'ouvre sur une chambre froide.', isEnd: false }, // new2
        { content: 'Vous appelez un prêtre qui tente un exorcisme ; la maison lutte.', isEnd: false }, // new3
        { content: 'Vous parvenez à briser la malédiction et la maison retrouve la paix. Fin: délivrance.', isEnd: true }, // new4
        { content: 'La présence prend possession d\'un visiteur; la malédiction se propage. Fin: contagion.', isEnd: true }, // new5
        { content: 'Vous êtes absorbé par les murs et n\'êtes plus qu\'un murmure. Fin: disparition.', isEnd: true } // new6
      ],
      [
        { from: 'start', to: 'new0', text: 'Examiner les objets personnels' },
        { from: 'start', to: 'new1', text: 'Chercher un objet familier' },
        { from: 'new0', to: 'new2', text: 'Suivre la date vers la cave' },
        { from: 'new1', to: 'new3', text: 'Utiliser la berceuse pendant la nuit' },
        { from: 'new3', to: 'new4', text: 'Poursuivre le rituel avec foi' },
        { from: 'new3', to: 'new5', text: 'Interrompre le rituel' },
        { from: 'new2', to: 'new6', text: 'Approcher la chambre froide' }
      ]
    );

    // === Mystery: more suspects and endings ===
    await expandStory(token,
      'L’Énigme du Train de Minuit',
      [
        { content: 'Une montre gravée est trouvée; l\'heure coïncide avec un témoignage.', isEnd: false }, // new0
        { content: 'Vous suivez un témoin jusqu\'à un wagon isolé où un objet compromettant est caché.', isEnd: false }, // new1
        { content: 'Un passage secret révèle un complice improbable.', isEnd: false }, // new2
        { content: 'Vous résolvez l\'affaire: le véritable coupable est découvert et arrêté. Fin: justice.', isEnd: true }, // new3
        { content: 'La vérité reste ambigüe; vous publiez un rapport partiel. Fin: doute.', isEnd: true }, // new4
        { content: 'Dans la confusion, un innocent est accusé. Fin: erreur judiciaire.', isEnd: true } // new5
      ],
      [
        { from: 'start', to: 'new0', text: 'Examiner la montre' },
        { from: 'start', to: 'new1', text: 'Interroger discrètement un témoin' },
        { from: 'new0', to: 'new2', text: 'Suivre l\'indice de la gravure' },
        { from: 'new1', to: 'new3', text: 'Confronter le suspect découvert' },
        { from: 'new2', to: 'new4', text: 'Rédiger un rapport prudent' },
        { from: 'new1', to: 'new5', text: 'Accuser sur la foi d\'un indice' }
      ]
    );

    // === Romance: add alternative endings ===
    await expandStory(token,
      'Rencontres sous la Pluie',
      [
        { content: 'Vous partagez un souvenir d\'enfance; la connexion devient plus profonde.', isEnd: false }, // new0
        { content: 'Un ancien amour ressurgit et crée un dilemme.', isEnd: false }, // new1
        { content: 'Vous vous séparez mais promettez de rester amis. Fin: doux-amer.', isEnd: true }, // new2
        { content: 'Vous vous engagez dans une relation sincère et construisez un avenir. Fin: heureux.', isEnd: true }, // new3
        { content: 'Le timing est mauvais et la rencontre s\'éteint. Fin: opportunité manquée.', isEnd: true } // new4
      ],
      [
        { from: 'start', to: 'new0', text: 'Parler de vos rêves' },
        { from: 'start', to: 'new1', text: 'Révéler un passé compliqué' },
        { from: 'new0', to: 'new3', text: 'Avancer ensemble' },
        { from: 'new1', to: 'new2', text: 'Choisir la prudence' },
        { from: 'new1', to: 'new4', text: 'Se laisser submerger' }
      ]
    );

    // === Adventure: expand doors with varied treasures/endings ===
    await expandStory(token,
      'La Carte aux Mille Portes',
      [
        { content: 'La porte de la forêt révèle un sanctuaire ancien protégeant une sagesse oubliée.', isEnd: false }, // new0
        { content: 'Dans la cité volante, vous découvrirez une machine qui exauce un souhait mais demande un prix.', isEnd: false }, // new1
        { content: 'Le désert d\'étoiles cache une bibliothèque stellaire; vous apprenez un grand secret.', isEnd: false }, // new2
        { content: 'Vous choisissez la sagesse et retournez plus riche intérieurement. Fin: sagesse.', isEnd: true }, // new3
        { content: 'Vous réclamez le pouvoir et payez le prix; le monde change. Fin: pouvoir.', isEnd: true }, // new4
        { content: 'Vous vous perdez dans les merveilles et choisissez d\'explorer pour toujours. Fin: errance.', isEnd: true } // new5
      ],
      [
        { from: 'start', to: 'new0', text: 'Entrer dans la forêt' },
        { from: 'start', to: 'new1', text: 'Monter à la cité volante' },
        { from: 'start', to: 'new2', text: 'Traverser le désert' },
        { from: 'new0', to: 'new3', text: 'Protéger le sanctuaire' },
        { from: 'new1', to: 'new4', text: 'Activer la machine' },
        { from: 'new2', to: 'new5', text: 'Décider de rester explorateur' }
      ]
    );

    // === Historical: add political outcomes ===
    await expandStory(token,
      'Sous les Bannières Anciennes',
      [
        { content: 'Vous montrez la lettre à un proche conseiller; une alliance secrète se forme.', isEnd: false }, // new0
        { content: 'Vous publiez la correspondance et déclenchez un scandale.', isEnd: false }, // new1
        { content: 'La paix triomphe grâce à vos diplomatiques. Fin: paix.', isEnd: true }, // new2
        { content: 'Le royaume sombre dans la guerre malgré vos efforts. Fin: guerre.', isEnd: true }, // new3
        { content: 'Vous êtes exilé mais vos écrits survivent comme leçons. Fin: exil.', isEnd: true } // new4
      ],
      [
        { from: 'start', to: 'new0', text: 'Confronter en privé' },
        { from: 'start', to: 'new1', text: 'Exposer publiquement' },
        { from: 'new0', to: 'new2', text: 'Négocier une paix secrète' },
        { from: 'new1', to: 'new3', text: 'La colère publique embrase la guerre' },
        { from: 'new0', to: 'new4', text: 'Choisir l\'exil pour protéger d\'autres' }
      ]
    );

    // === Comedy: more pratfalls and outcomes ===
    await expandStory(token,
      'Les Tribulations du Facteur',
      [
        { content: 'Votre quiproquo devient viral et vous obtenez une offre télévisée.', isEnd: false }, // new0
        { content: 'Un client vous pardonne et vous offre un emploi stable dans son magasin. Fin: stabilité.', isEnd: true }, // new1
        { content: 'Vous êtes applaudi pour votre créativité et démarrez une carrière d\'artiste. Fin: succès.', isEnd: true }, // new2
        { content: 'Les erreurs s\'accumulent; vous perdez votre poste mais gagnez une histoire à raconter. Fin: renaissance.', isEnd: true } // new3
      ],
      [
        { from: 'start', to: 'new0', text: 'Laisser le quiproquo se dérouler' },
        { from: 'new0', to: 'new1', text: 'S\'excuser sincèrement' },
        { from: 'new0', to: 'new2', text: 'Jouer la comédie et capitaliser' },
        { from: 'start', to: 'new3', text: 'Ignorer le problème' }
      ]
    );

    console.log('\n🎯 Enrichissements terminés pour toutes les histoires ciblées.');
  } catch (err) {
    console.error('❌ Erreur fatale:', err.message);
  }
}

main();
