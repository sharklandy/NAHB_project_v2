const fetch = require('node-fetch');

const API = 'http://localhost:4000/api';

let globalToken = null;

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
        'Authorization': 'Bearer ' + (token || globalToken)
      },
      body: JSON.stringify(newPages[i])
    });
    const j = await res.json();
    created.push(j.pageId);
  }
  return created;
}

async function getPublishedList() {
  const res = await fetch(`${API}/stories?published=1`);
  return await res.json();
}

function normalize(str) {
  if (!str) return '';
  return str.toString().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9 ]/gi, '').trim().toLowerCase();
}

async function findStoryByTitle(title) {
  const list = await getPublishedList();
  const target = normalize(title);
  let found = list.find(s => normalize(s.title) === target);
  if (found) return found;
  found = list.find(s => normalize(s.title).includes(target) || target.includes(normalize(s.title)));
  if (found) return found;
  return null;
}

async function getStory(storyId) {
  const res = await fetch(`${API}/stories/${storyId}`);
  return await res.json();
}

async function deepen(title, newPages, choiceLinks) {
  console.log(`\n🔧 Deepening: ${title}`);
  const story = await findStoryByTitle(title);
  if (!story) {
    console.warn('Story not found:', title);
    return;
  }
  const storyId = story.id || story._id;
  const full = await getStory(storyId);
  const existing = full.pages || [];
  const start = full.startPageId || (existing[0] && existing[0].pageId);

  // Idempotent creation: if a page with same content exists, reuse it.
  const created = [];
  for (let i = 0; i < newPages.length; i++) {
    const p = newPages[i];
    // try to find existing by content substring match
    const found = existing.find(ep => (ep.content || '').trim().slice(0, 60) === (p.content || '').trim().slice(0, 60));
    if (found) {
      created.push(found.pageId);
    } else {
      const added = await appendPages(globalToken, storyId, [p]);
      created.push(added[0]);
    }
  }
  console.log(`  + Added ${created.length} pages`);

  let resolve = (ref) => {
    if (ref === 'start') return start;
    if (typeof ref === 'number') return (existing[ref] && existing[ref].pageId) || null;
    if (typeof ref === 'string' && ref.startsWith('new')) {
      const idx = parseInt(ref.slice(3), 10);
      return created[idx];
    }
    return null;
  };

  // if start is missing, fallback to a sensible existing page (first non-end or last page)
  if (!start) {
    const nonEnd = existing.find(p => !p.isEnd);
    if (nonEnd) {
      console.log('  (fallback) using first non-end existing page as start');
      // override start for resolve
      existing.startFallback = nonEnd.pageId;
    } else if (existing.length > 0) {
      existing.startFallback = existing[existing.length - 1].pageId;
    }
    // adjust resolve to use fallback when ref==='start' and original start missing
    const originalResolve = resolve;
    resolve = (ref) => {
      if (ref === 'start') return start || existing.startFallback || null;
      return originalResolve(ref);
    };
  }

  for (const link of choiceLinks) {
    const from = resolve(link.from);
    const to = resolve(link.to);
    if (!from || !to) {
      console.warn('  could not resolve link', link);
      continue;
    }
    await addChoice(globalToken, storyId, from, link.text, to);
  }

  console.log(`✅ Deepened: ${title}`);
}

async function main() {
  try {
    console.log('🔐 Logging in...');
    const login = await fetch(API + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'pierre@nahb.local', password: 'pierre123' })
    });
    const user = await login.json();
    if (!user.token) {
      console.error('login failed');
      return;
    }
    globalToken = user.token;

    // Sci-Fi: add a side-quest & moral choice
    await deepen('Échos du Dernier Orbiteur',
      [
        { content: 'Un poste de secours isolé signale des survivants cryogénisés; les réveiller coûtera de l\'énergie.', isEnd: false }, // new0
        { content: 'Vous choisissez de réveiller un scientifique : il pourrait aider ou provoquer un conflit.', isEnd: false }, // new1
        { content: 'Vous laissez les survivants endormis et concentrez l\'énergie sur le saut.', isEnd: true } // new2
      ],
      [
        { from: 'start', to: 'new0', text: 'Scanner la poupe pour signaux de vie' },
        { from: 'new0', to: 'new1', text: 'Risque: réveiller un survivant' },
        { from: 'new0', to: 'new2', text: 'Ignorer pour sauver l\'équipage' }
      ]
    );

    // Horror: add ambiguous artifact and consequences
    await deepen('La Maison aux Murmures',
      [
        { content: 'Un médaillon révèle une voix familière qui vous supplie: "Libère-moi".', isEnd: false }, // new0
        { content: 'La libération calme la maison mais vous perdez un souvenir important. Fin: sacrifice', isEnd: true }, // new1
        { content: 'Vous gardez le médaillon; il vous donne pouvoir mais vous isole. Fin: pouvoir', isEnd: true } // new2
      ],
      [
        { from: 'start', to: 'new0', text: 'Ouvrir le tiroir sordide' },
        { from: 'new0', to: 'new1', text: 'Briser le médaillon' },
        { from: 'new0', to: 'new2', text: 'Conserver le médaillon' }
      ]
    );

    // Mystery: plant a false lead and a revealing confession
    await deepen('L’Énigme du Train de Minuit',
      [
        { content: 'Une confession intime est trouvée sur une serviette; le suspect se défend mais révèle un secret.', isEnd: false }, // new0
        { content: 'La confession mène à un complice extérieur; l\'enquête s\'élargit. Fin: élucidé', isEnd: true }, // new1
        { content: 'La confession est une fausse piste; vous devez réévaluer. Fin: piste foireuse', isEnd: true } // new2
      ],
      [
        { from: 'start', to: 'new0', text: 'Fouiller les effets personnels' },
        { from: 'new0', to: 'new1', text: 'Suivre la piste révélée' },
        { from: 'new0', to: 'new2', text: 'Confronter et voir le mensonge' }
      ]
    );

    // Romance: give chance for long-term decision
    await deepen('Rencontres sous la Pluie',
      [
        { content: 'Vous recevez une offre de départ pour un travail lointain; la relation doit décider.', isEnd: false }, // new0
        { content: 'Vous partez ensemble pour une vie nouvelle. Fin: engagement', isEnd: true }, // new1
        { content: 'Vous décidez de rester; la relation devient un bel ancrage. Fin: ancrage', isEnd: true } // new2
      ],
      [
        { from: 'start', to: 'new0', text: 'Parler du futur' },
        { from: 'new0', to: 'new1', text: 'Sauter ensemble vers l\'inconnu' },
        { from: 'new0', to: 'new2', text: 'Choisir la stabilité' }
      ]
    );

    // Adventure: add challenge with clear trade-offs
    await deepen('La Carte aux Mille Portes',
      [
        { content: 'Un gardien propose un défi: un objet précieux contre un souvenir.', isEnd: false }, // new0
        { content: 'Vous acceptez et gagnez un artefact utile pour la quête. Fin: avantage', isEnd: true }, // new1
        { content: 'Vous refusez et conservez vos souvenirs; la quête reste intacte. Fin: intégrité', isEnd: true } // new2
      ],
      [
        { from: 'start', to: 'new0', text: 'Accepter le défi du gardien' },
        { from: 'new0', to: 'new1', text: 'Échanger souvenir contre artefact' },
        { from: 'new0', to: 'new2', text: 'Refuser poliment' }
      ]
    );

    // Historical: add moral/legacy outcome
    await deepen('Sous les Bannières Anciennes',
      [
        { content: 'Vous publiez un manifeste secret qui influence les jeunes; l\'histoire vous jugera.', isEnd: false }, // new0
        { content: 'Le manifeste engendre une ère de réforme. Fin: réformation', isEnd: true }, // new1
        { content: 'Le manifeste est réprimé; votre nom devient martyr. Fin: martyr', isEnd: true } // new2
      ],
      [
        { from: 'start', to: 'new0', text: 'Rédiger le manifeste' },
        { from: 'new0', to: 'new1', text: 'Partager anonymement' },
        { from: 'new0', to: 'new2', text: 'Publier sous votre nom' }
      ]
    );

    // Comedy: add escalating public moment
    await deepen('Les Tribulations du Facteur',
      [
        { content: 'Un spectacle de rue transforme votre gaffe en sketch viral; vous êtes invité à jouer.', isEnd: false }, // new0
        { content: 'Vous devenez une star locale et commencez une carrière théâtrale. Fin: vedette', isEnd: true }, // new1
        { content: 'Vous retournez à la vie simple mais heureux; la ville se souvient avec affection. Fin: contentement', isEnd: true } // new2
      ],
      [
        { from: 'start', to: 'new0', text: 'Jouer la scène devant la foule' },
        { from: 'new0', to: 'new1', text: 'Accepter l\'offre' },
        { from: 'new0', to: 'new2', text: 'Refuser et garder la simplicité' }
      ]
    );

    console.log('\nAll deepening completed');
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
