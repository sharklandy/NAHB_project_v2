const fetch = require('node-fetch');

const API = 'http://localhost:4000/api';

async function updateStartPage() {
  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@nahb.local', password: 'admin123' })
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

  console.log(`Story ID: ${gardien._id}`);
  console.log(`StartPageId: ${story.startPageId}`);
  console.log(`Pages: ${story.pages.length}`);
  
  const startPage = story.pages.find(p => p.pageId === story.startPageId);
  console.log(`\nContenu actuel:\n${startPage.content.substring(0, 300)}...\n`);

  const newContent = `Vous ouvrez lentement les yeux. Une brume épaisse et mystérieuse enveloppe la forêt ancestrale qui vous entoure. Les arbres millénaires, aux troncs aussi larges que des maisons, s'élèvent vers un ciel à peine visible à travers leur canopée dense. Une lumière étrange, presque surnaturelle, filtre à travers les feuilles, créant des jeux d'ombres et de lumière qui semblent danser.

Vous ne vous souvenez pas comment vous êtes arrivé ici. Votre dernier souvenir est flou, comme un rêve qui s'évanouit au réveil. Mais quelque chose en vous sait que vous avez un but, une mission d'une importance capitale.

Au loin, perçant la brume comme un phare dans la tempête, vous apercevez une immense tour de pierre noire. Elle s'élève majestueusement au-dessus des arbres, si haute que son sommet se perd dans les nuages. Des runes anciennes brillent faiblement sur ses flancs, pulsant d'une lueur bleutée hypnotique. Cette tour vous appelle, vous attire comme un aimant.

Une voix résonne dans votre esprit, grave et ancienne : "Le Gardien s'éveille enfin. Le monde a besoin de toi. Choisis ton chemin, car le destin de tous dépend de tes décisions."

Vous devez faire un choix : vous diriger directement vers cette tour mystérieuse qui semble vous attendre, ou explorer d'abord la forêt pour comprendre où vous êtes et ce qui vous attend.`;

  console.log('Mise à jour de la page de départ...');
  
  const updateRes = await fetch(`${API}/stories/${gardien._id}/pages/${story.startPageId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ content: newContent })
  });
  
  if (updateRes.ok) {
    console.log('✅ Page de départ mise à jour!');
  } else {
    const error = await updateRes.text();
    console.log('❌ Erreur:', error);
  }
}

updateStartPage().catch(console.error);
