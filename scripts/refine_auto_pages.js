const fetch = require('node-fetch');

const API = 'http://localhost:4000/api';

async function login() {
  const res = await fetch(API + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'pierre@nahb.local', password: 'pierre123' })
  });
  const j = await res.json();
  return j.token;
}

async function getPublishedStories() {
  const res = await fetch(`${API}/stories?published=1`);
  return await res.json();
}

async function getStory(id) {
  const res = await fetch(`${API}/stories/${id}`);
  return await res.json();
}

async function updatePage(token, storyId, pageId, content, isEnd) {
  const res = await fetch(`${API}/stories/${storyId}/pages/${pageId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ content, isEnd })
  });
  return await res.json();
}

function generateText(theme, title) {
  const t = theme || 'general';
  switch (t) {
    case 'fantasy':
      return `Tu sens la magie dans l'air tandis qu'une brise chaude soulève les bannières. Une route ancienne se dessine devant toi, parsemée de pierres gravées — choisis le chemin qui te mènera vers la légende.`;
    case 'ocean':
      return `Les vagues murmurent des secrets oubliés; l'air salé pique tes lèvres. Sur la jetée, une barque attend — préfères-tu braver les eaux profondes ou explorer les ruines côtières ?`;
    case 'sci-fi':
      return `Les néons se reflètent sur le casque; l'IA te propose deux coordonnées mystérieuses. À bord de ton vaisseau, choisis la trajectoire qui révélera un ancien artefact ou déclenchera une rencontre imprévue.`;
    case 'horror':
      return `L'obscurité respire autour de toi; un chuchotement appelle ton nom depuis le couloir. Avances-tu prudemment vers la source du bruit, ou retournes-tu sur tes pas en quête d'une sortie ?`;
    case 'mystery':
      return `Un indice ensanglanté subsiste sur le rideau; l'horloge a arrêté son tic-tac à minuit. Interroges-tu le témoin réticent ou inspectes-tu la valise abandonnée sur le quai ?`;
    case 'romance':
      return `La pluie dessine des formes sur la vitre; un regard s'est accroché au tien sous le parapluie. Vas-tu le rejoindre pour un café improvisé ou suivre un autre chemin qui te rapprochera d'une vérité délicate ?`;
    case 'adventure':
      return `La carte froissée indique une vallée oubliée et un objectif scintillant au loin. Sautes-tu sur ta monture pour une traversée rapide, ou recherches-tu d'abord un guide local aux connaissances précieuses ?`;
    case 'historical':
      return `Des sentiers anciens craquent sous tes pas; les reliques du passé racontent une histoire rongée par le temps. Te rends-tu au marché pour interroger les anciens, ou t'aventures-tu dans la bibliothèque fermée depuis des siècles ?`;
    case 'comedy':
      return `Une poule traverse la route, provoquant un embouteillage burlesque; un vendeur de chapeaux rit jaune. Choisis ton prochain acte — improvises-tu un stratagème ridicule ou te laisses-tu surprendre par une farce improvisée ?`;
    default:
      return `La situation évolue et de nouvelles options se présentent; choisis la suite de ton aventure en fonction de ton intuition.`;
  }
}

async function main() {
  try {
    console.log('Connexion...');
    const token = await login();
    if (!token) { console.error('Échec de la connexion'); return; }

    console.log('Récupération des histoires publiées...');
    const list = await getPublishedStories();

    let totalUpdated = 0;

    for (const s of list) {
      const storyId = s.id || s._id || s;
      const full = await getStory(storyId);
      const pages = full.pages || [];
      const theme = full.theme || s.theme || 'general';
      const title = full.title || s.title || '';

      for (const p of pages) {
        if (!p.content) continue;
        if (p.content.startsWith('(Auto)') || p.content.includes('(Auto) Suite')) {
          const newContent = generateText(theme, title);
          await updatePage(token, storyId, p.pageId, newContent, p.isEnd || false);
          console.log(`Updated page ${p.pageId} in story ${title}`);
          totalUpdated++;
        }
      }
    }

    console.log(`\nTotal pages mises à jour: ${totalUpdated}`);

    console.log('Relance du rapport...');
    await new Promise((res, rej) => {
      const cp = require('child_process').spawn('node', ['scripts/check_stories_report.js'], { stdio: 'inherit', shell: true });
      cp.on('exit', code => code === 0 ? res() : rej(new Error('report script failed')));
    });

    console.log('Terminé.');
  } catch (err) {
    console.error('Erreur:', err);
  }
}

main();
