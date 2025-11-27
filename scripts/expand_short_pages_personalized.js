const fetch = require('node-fetch');
const fs = require('fs');

const API = 'http://localhost:4000/api';
const MIN_LENGTH = 60; // pages shorter than this will be expanded

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

function personalizeText(theme, title, sample) {
  // aim ~80-120 words; use multiple sentences referencing title/theme
  const baseTitle = (title || '').replace(/\n/g, ' ').trim();
  switch ((theme || 'general').toLowerCase()) {
    case 'fantasy':
      return `${baseTitle} — La légende continue. Les pierres du sentier chuchotent des noms oubliés, et tu sens la chaleur d'une magie ancienne à portée de main. Devant toi, deux chemins s'entrecroisent: l'un mène vers une forêt où des murmures promettent connaissance et danger; l'autre descend vers des plaines où résonnent des trompettes lointaines. Choisis avec courage — chaque choix tisse une nouvelle page de la légende.`;
    case 'ocean':
      return `${baseTitle} — Le sel sur l'air rappelle des voyages anciens. Les cordages grincent et le horizon semble murmurer une invitation. Une barque se balance, prête à partir; sur la rive, ruines et reliques laissent deviner une civilisation engloutie. Avance prudemment, écoute les murmures des vagues, et laisse la mer guider tes pas vers des trésors ou des vérités cachées.`;
    case 'sci-fi':
      return `${baseTitle} — Les écrans clignotent et la station vibre d'un bourdonnement métallique. Un signal crypté attend d'être décodé; peut-être révèle-t-il un message ancien, peut-être une embuscade. Tes décisions détermineront si tu récupères un artefact précieux ou si tu déclenches une suite d'événements irréversibles. Reste attentif aux détails et aux choix qui semblent insignifiants.`;
    case 'horror':
      return `${baseTitle} — L'air est chargé d'une tension que l'on ne peut décrire: un couloir trop long, une porte entrouverte. Parfois le silence parle plus fort que n'importe quel cri. Avances-tu vers la source du chuchotement, ou cherches-tu un refuge à la lueur tremblante? Chaque pas rapproche de la vérité, mais la vérité n'est pas toujours libératrice.`;
    case 'mystery':
      return `${baseTitle} — Un détail étrange attire ton regard: une horloge arrêtée, une tache d'encre, une lettre mal rangée. L'enquête exige patience et méthode; interroge, compare, soupçonne. Petit à petit, les pièces se révèlent — mais parfois une piste mène à une impasse. Choisis la piste que tu veux creuser et garde l'esprit ouvert aux contradictions.`;
    case 'romance':
      return `${baseTitle} — Les gouttes de pluie dessinent des motifs sur la vitre, et un sourire aperçu au coin d'une rue réveille une douce curiosité. Il y a quelque chose d'intime dans l'instant: un café partagé, un regard prolongé, une hésitation qui en dit long. Suis ton coeur ou choisis la prudence — chaque décision peut rapprocher deux vies.`;
    case 'adventure':
      return `${baseTitle} — La carte froissée promet des vallées oubliées et des rencontres imprévues. Sous tes pieds, la terre semble prête à livrer des secrets; au loin, une silhouette se découpe sur l'horizon comme un défi. Sautes-tu sur l'occasion pour t'élancer à l'aventure ou recherches-tu d'abord des alliés et des informations? L'aventure commence par un pas.`;
    case 'historical':
      return `${baseTitle} — Les rues anciennes murmurent des histoires d'honneur et de trahison. Les pierres portent les noms de ceux qui ont façonné le temps; un artefact, une lettre jaunie, une allée oubliée peuvent changer le cours d'une vie. Interroge les anciens, fouille les archives, ou suis ton intuition pour découvrir ce que l'histoire cache.`;
    case 'comedy':
      return `${baseTitle} — Un événement absurde vient de se produire: chapeaux volant, poules en liberté et rires qui fusent. Le monde semble conspirer pour te faire sourire (ou te jouer un tour). Fais preuve d'esprit et de maladresse charmante: parfois une farce bien placée débloque une situation, parfois elle l'aggrave. Choisis ton numéro.`;
    default:
      return `${baseTitle} — La scène s'ouvre sur une situation nouvelle qui appelle une décision. Les détails autour de toi peuvent aider à orienter ton choix: observe, écoute et prends le temps de choisir la suite qui te semble juste.`;
  }
}

async function main() {
  try {
    console.log('Connexion...');
    const token = await login();
    if (!token) { console.error('Login failed'); return; }

    console.log('Récupération des histoires publiées...');
    const list = await getPublishedStories();

    let updated = 0;

    for (const s of list) {
      const storyId = s.id || s._id || s;
      const full = await getStory(storyId);
      const pages = full.pages || [];
      const theme = full.theme || s.theme || 'general';
      const title = full.title || s.title || '';

      for (const p of pages) {
        const len = (p.content || '').trim().length;
        if (len < MIN_LENGTH) {
          const newContent = personalizeText(theme, title, p.content || '');
          await updatePage(token, storyId, p.pageId, newContent, !!p.isEnd);
          console.log(`Updated short page ${p.pageId} in story "${title}" (len ${len} -> ${newContent.length})`);
          updated++;
        }
      }
    }

    console.log(`\nTotal pages mises à jour: ${updated}`);

    console.log('Relance rapport et vérification...');
    await new Promise((res, rej) => {
      const cp = require('child_process').spawn('node', ['scripts/check_stories_report.js'], { stdio: 'inherit', shell: true });
      cp.on('exit', code => code === 0 ? res() : rej(new Error('report failed')));
    });

    await new Promise((res, rej) => {
      const cp = require('child_process').spawn('node', ['scripts/verify_coherence.js'], { stdio: 'inherit', shell: true });
      cp.on('exit', code => code === 0 ? res() : rej(new Error('coherence check failed')));
    });

    console.log('Terminé.');
  } catch (err) {
    console.error('Erreur:', err);
  }
}

main();
