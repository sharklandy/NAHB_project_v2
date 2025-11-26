const fetch = require('node-fetch');

const API = 'http://localhost:4000/api';

async function fixEncoding() {
  console.log('🔄 Correction de l\'encodage...\n');

  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@nahb.local', password: 'admin123' })
  });
  const { token } = await loginRes.json();
  console.log('✅ Connecté\n');

  const storiesRes = await fetch(`${API}/stories`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const stories = await storiesRes.json();
  
  const gardien = stories.find(s => s.title.includes('Gardien'));
  
  const storyRes = await fetch(`${API}/stories/${gardien._id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const story = await storyRes.json();

  // Page de départ
  const startContent = `Vous ouvrez lentement les yeux. Une brume épaisse et mystérieuse enveloppe la forêt ancestrale qui vous entoure. Les arbres millénaires, aux troncs aussi larges que des maisons, s'élèvent vers un ciel à peine visible à travers leur canopée dense. Une lumière étrange, presque surnaturelle, filtre à travers les feuilles, créant des jeux d'ombres et de lumière qui semblent danser.

Vous ne vous souvenez pas comment vous êtes arrivé ici. Votre dernier souvenir est flou, comme un rêve qui s'évanouit au réveil. Mais quelque chose en vous sait que vous avez un but, une mission d'une importance capitale.

Au loin, perçant la brume comme un phare dans la tempête, vous apercevez une immense tour de pierre noire. Elle s'élève majestueusement au-dessus des arbres, si haute que son sommet se perd dans les nuages. Des runes anciennes brillent faiblement sur ses flancs, pulsant d'une lueur bleutée hypnotique. Cette tour vous appelle, vous attire comme un aimant.

Une voix résonne dans votre esprit, grave et ancienne : "Le Gardien s'éveille enfin. Le monde a besoin de toi. Choisis ton chemin, car le destin de tous dépend de tes décisions."

Vous devez faire un choix : vous diriger directement vers cette tour mystérieuse qui semble vous attendre, ou explorer d'abord la forêt pour comprendre où vous êtes et ce qui vous attend.`;

  console.log('📝 Mise à jour de la page de départ...');
  const res1 = await fetch(`${API}/stories/${gardien._id}/pages/${story.startPageId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ content: startContent })
  });
  
  if (res1.ok) {
    console.log('✅ Page de départ corrigée!');
  } else {
    const err = await res1.text();
    console.log('❌ Erreur:', err);
  }

  // Page de la tour
  const towerPage = story.pages.find(p => p.pageId === 'tower');
  if (towerPage) {
    const towerContent = `Vous vous approchez prudemment de la tour imposante. Plus vous avancez, plus vous sentez une énergie mystique puissante émaner de la structure. La tour semble abandonnée depuis des siècles, recouverte de lierre et de mousse, mais quelque chose en elle reste vivant, palpable.

Les portes massives de bronze sont entrouvertes, comme si elles vous attendaient depuis toujours. Des runes anciennes brillent faiblement sur toute la surface, formant des motifs complexes qui semblent raconter une histoire oubliée. Vous reconnaissez certains symboles : protection, pouvoir, sacrifice, destin.

L'air à l'intérieur est chargé de magie. Vos pas résonnent sur le sol de marbre blanc veiné d'or. La salle principale est circulaire et immense. Des colonnes magistrales soutiennent un plafond si haut qu'il se perd dans l'obscurité. Au centre, vous voyez un escalier qui monte vers les étages supérieurs de la tour, promettant des révélations sur votre destin.

Mais vous remarquez aussi une porte dissimulée derrière une tapisserie déchirée. Elle semble mener vers un sous-sol obscur, vers les profondeurs de la tour où dorment peut-être des secrets encore plus anciens et dangereux.

Où voulez-vous aller : vers les hauteurs de la tour pour observer le monde, ou vers ses profondeurs mystérieuses pour découvrir votre passé ?`;

    console.log('📝 Mise à jour de la page de la tour...');
    const res2 = await fetch(`${API}/stories/${gardien._id}/pages/tower`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ content: towerContent })
    });
    
    if (res2.ok) {
      console.log('✅ Page de la tour corrigée!');
    }
  }

  // Page du sanctuaire
  const sanctuaryPage = story.pages.find(p => p.content.includes('sanctuaire'));
  if (sanctuaryPage) {
    const sanctuaryContent = `Vous décidez d'explorer la forêt avant de vous aventurer vers la tour. Vos pas vous mènent à travers un dédale d'arbres anciens et de sentiers oubliés. La brume s'épaissit, créant une atmosphère irréelle et inquiétante qui vous donne la chair de poule.

Soudain, vous découvrez un ancien sanctuaire caché entre les racines gigantesques d'un arbre mort depuis longtemps. Le sanctuaire est en ruine, mais vous pouvez encore voir des traces de sa gloire passée : des statues brisées, des autels renversés, des fresques effacées par le temps racontant des légendes oubliées.

Au centre du sanctuaire, sur un piédestal de pierre miraculeusement intact, repose un cristal magnifique de la taille d'un poing. Il pulse d'une lumière douce et apaisante, comme un cœur qui bat. Des couleurs kaléidoscopiques dansent à l'intérieur de sa surface translucide, hypnotiques. Vous vous sentez irrésistiblement attiré par lui.

En vous approchant avec précaution, vous remarquez des inscriptions gravées dans la pierre du piédestal. Elles sont dans une langue ancienne que personne ne devrait comprendre, mais miraculeusement, vous pouvez les lire : "Celui qui touche le Cristal de Vérité verra ce qui fut et ce qui sera. Mais attention, car la vérité peut être un fardeau trop lourd à porter pour un esprit mortel."

Des voix fantomatiques semblent chuchoter autour de vous dans le vent, vous encourageant à toucher le cristal. Mais vous sentez aussi une présence dans la forêt, quelque chose d'ancien qui vous observe depuis les ombres. Peut-être devriez-vous d'abord examiner les alentours du sanctuaire avant de toucher cet artefact mystérieux ?`;

    console.log('📝 Mise à jour de la page du sanctuaire...');
    const res3 = await fetch(`${API}/stories/${gardien._id}/pages/${sanctuaryPage.pageId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ content: sanctuaryContent })
    });
    
    if (res3.ok) {
      console.log('✅ Page du sanctuaire corrigée!');
    }
  }

  console.log('\n✅ Encodage corrigé ! Rafraîchissez votre navigateur (Ctrl+F5)');
}

fixEncoding().catch(console.error);
