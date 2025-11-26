const fetch = require('node-fetch');

const API = 'http://localhost:4000/api';

async function addChoices() {
  console.log('🔄 Ajout de nouveaux choix...\n');

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

  // Trouver les pages qui ont seulement 2 choix
  const startPage = story.pages.find(p => p.pageId === story.startPageId);
  const towerPage = story.pages.find(p => p.pageId === 'tower');
  const sanctuaryPage = story.pages.find(p => p.content.includes('sanctuaire'));

  console.log(`Page de départ: ${startPage.choices.length} choix`);
  console.log(`Page tour: ${towerPage ? towerPage.choices.length : 0} choix`);
  console.log(`Page sanctuaire: ${sanctuaryPage ? sanctuaryPage.choices.length : 0} choix\n`);

  // Ajouter un choix supplémentaire à la page de départ : "Observer les alentours"
  if (startPage.choices.length < 3) {
    console.log('📝 Ajout d\'un choix à la page de départ...');
    
    // Créer une nouvelle page "observation"
    const observePage = await fetch(`${API}/stories/${gardien._id}/pages`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        pageId: 'observe',
        content: `Vous prenez le temps d'observer attentivement vos alentours avant de prendre une décision. La forêt est étrangement silencieuse. Aucun chant d'oiseau, aucun bruissement de petits animaux. Seul le vent dans les feuilles brise ce silence oppressant.

En examinant le sol autour de vous, vous remarquez des traces étranges : des empreintes qui ne ressemblent à rien de connu, des griffures profondes sur les troncs d'arbres, et des zones où la végétation semble morte, comme brûlée par une force sombre.

Plus inquiétant encore, vous apercevez au loin des silhouettes sombres qui se déplacent entre les arbres. Sont-ce des créatures, des ombres, ou simplement votre imagination ? Elles semblent vous encercler lentement, se rapprochant peu à peu.

Votre instinct vous crie de bouger, maintenant. Rester ici plus longtemps serait dangereux. La tour offre peut-être un refuge sûr, mais la forêt pourrait aussi cacher des alliés ou des ressources utiles.

Le temps presse. Vous devez choisir rapidement votre prochaine action.`,
        isEnd: false
      })
    });

    if (observePage.ok) {
      const newPage = await observePage.json();
      
      // Ajouter des choix à cette nouvelle page
      await fetch(`${API}/stories/${gardien._id}/pages/${newPage.pageId}/choices`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          text: "Courir vers la tour pour vous mettre à l'abri",
          to: 'tower'
        })
      });

      await fetch(`${API}/stories/${gardien._id}/pages/${newPage.pageId}/choices`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          text: "Explorer la forêt pour identifier les créatures",
          to: story.pages.find(p => p.content.includes('sanctuaire'))?.pageId || 'forest'
        })
      });

      // Ajouter le choix "Observer" à la page de départ
      await fetch(`${API}/stories/${gardien._id}/pages/${story.startPageId}/choices`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          text: "Observer attentivement les alentours avant de décider",
          to: newPage.pageId
        })
      });

      console.log('✅ Nouveau choix "Observer" ajouté!');
    }
  }

  // Ajouter choix à la page de la tour
  if (towerPage && towerPage.choices.length < 4) {
    console.log('📝 Ajout de choix à la page de la tour...');
    
    // Créer page "examiner les runes"
    const runesPage = await fetch(`${API}/stories/${gardien._id}/pages`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        pageId: 'runes',
        content: `Vous vous approchez des portes de bronze pour examiner de plus près les runes qui y sont gravées. En les observant attentivement, vous commencez à comprendre leur signification. Ce ne sont pas de simples décorations, mais une sorte de carte ou de guide.

Les runes racontent l'histoire des Gardiens : leur création par les dieux anciens, leurs victoires contre les forces du chaos, et finalement leur disparition mystérieuse. Mais il y a aussi un avertissement, gravé plus profondément que les autres symboles.

"Celui qui entre dans la Tour doit faire un choix : chercher le pouvoir dans les hauteurs, ou la sagesse dans les profondeurs. Les deux chemins mènent à la vérité, mais par des voies différentes. Le pouvoir sans sagesse est destruction. La sagesse sans pouvoir est impuissance."

Soudain, les runes s'illuminent d'une lueur intense et vous sentez une énergie vous traverser. Des images déferlent dans votre esprit : des visions du passé, du présent et de futurs possibles. Vous comprenez maintenant que vous êtes lié à cette tour d'une manière que vous ne pouvez pas encore expliquer.

La porte s'ouvre complètement devant vous, vous invitant à entrer.`,
        isEnd: false
      })
    });

    if (runesPage.ok) {
      const newRunesPage = await runesPage.json();
      
      // Ajouter choix à la page des runes
      const existingUp = story.pages.find(p => p.content.includes('monter') || p.content.includes('sommet'));
      const existingDown = story.pages.find(p => p.content.includes('descend') || p.content.includes('sous-sol'));
      
      await fetch(`${API}/stories/${gardien._id}/pages/${newRunesPage.pageId}/choices`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          text: "Monter vers les hauteurs pour chercher le pouvoir",
          to: existingUp?.pageId || 'up'
        })
      });

      await fetch(`${API}/stories/${gardien._id}/pages/${newRunesPage.pageId}/choices`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          text: "Descendre dans les profondeurs pour trouver la sagesse",
          to: existingDown?.pageId || 'basement'
        })
      });

      // Ajouter le choix "Examiner les runes" à la page tour
      await fetch(`${API}/stories/${gardien._id}/pages/tower/choices`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          text: "Examiner attentivement les runes sur les portes",
          to: newRunesPage.pageId
        })
      });

      console.log('✅ Nouveau choix "Examiner les runes" ajouté!');
    }

    // Créer page "contourner la tour"
    const contourPage = await fetch(`${API}/stories/${gardien._id}/pages`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        pageId: 'contour',
        content: `Vous décidez de contourner la tour pour voir s'il existe une autre entrée ou pour mieux comprendre sa structure. En faisant le tour de l'édifice, vous découvrez que la tour est bien plus grande que vous ne le pensiez.

À l'arrière, vous trouvez un jardin abandonné mais encore empreint de magie. Des plantes luminescentes poussent entre les ruines de ce qui fut un magnifique jardin zen. Au centre, une fontaine asséchée présente une inscription.

"Ici reposait l'eau de vie, source du pouvoir des Gardiens. Tarie depuis la Grande Chute, elle ne pourra être restaurée que par celui qui unit pouvoir et sagesse."

En cherchant plus loin, vous découvrez une petite porte cachée derrière du lierre. Elle semble mener à un passage secret à l'intérieur de la tour, peut-être un raccourci vers des zones importantes.

Vous remarquez aussi des traces récentes : quelqu'un ou quelque chose est passé par ici il n'y a pas longtemps.`,
        isEnd: false
      })
    });

    if (contourPage.ok) {
      const newContourPage = await contourPage.json();
      
      await fetch(`${API}/stories/${gardien._id}/pages/${newContourPage.pageId}/choices`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          text: "Emprunter le passage secret",
          to: story.pages.find(p => p.content.includes('sous-sol') || p.content.includes('descend'))?.pageId || 'basement'
        })
      });

      await fetch(`${API}/stories/${gardien._id}/pages/${newContourPage.pageId}/choices`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          text: "Revenir à l'entrée principale",
          to: 'tower'
        })
      });

      await fetch(`${API}/stories/${gardien._id}/pages/${newContourPage.pageId}/choices`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          text: "Suivre les traces pour voir où elles mènent",
          to: story.pages.find(p => p.content.includes('sanctuaire'))?.pageId || 'forest'
        })
      });

      // Ajouter le choix à la page tour
      await fetch(`${API}/stories/${gardien._id}/pages/tower/choices`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          text: "Contourner la tour pour explorer ses alentours",
          to: newContourPage.pageId
        })
      });

      console.log('✅ Nouveau choix "Contourner la tour" ajouté!');
    }
  }

  // Ajouter choix au sanctuaire
  if (sanctuaryPage && sanctuaryPage.choices.length < 4) {
    console.log('📝 Ajout de choix à la page du sanctuaire...');
    
    // Page "examiner les statues"
    const statuesPage = await fetch(`${API}/stories/${gardien._id}/pages`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        pageId: 'statues',
        content: `Vous vous approchez des statues brisées qui entourent le sanctuaire. Malgré leur état de délabrement, vous pouvez encore distinguer qu'elles représentaient des guerriers en armure, similaire à celle que vous avez vue dans vos visions.

En examinant les débris, vous trouvez des fragments d'inscriptions. En les assemblant mentalement, vous reconstituez un message : "Les Gardiens de l'Ancien Ordre veillaient ici sur le Cristal de Vérité. Celui qui cherche la vérité doit d'abord prouver sa valeur."

Sous l'une des statues renversées, vous découvrez quelque chose d'étonnant : un médaillon ancien portant le même symbole que celui gravé sur votre armure. Lorsque vous le ramassez, il se met à briller et une voix résonne : "Le sang des Gardiens coule en toi. Tu as le droit de connaître la vérité."

Le cristal au centre du sanctuaire réagit au médaillon, brillant plus intensément. Vous sentez qu'il vous appelle maintenant avec plus de force.`,
        isEnd: false
      })
    });

    if (statuesPage.ok) {
      const newStatuesPage = await statuesPage.json();
      
      await fetch(`${API}/stories/${gardien._id}/pages/${newStatuesPage.pageId}/choices`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          text: "Toucher le cristal avec le médaillon",
          to: story.pages.find(p => p.content.includes('cristal vous transporte'))?.pageId || 'crystal'
        })
      });

      await fetch(`${API}/stories/${gardien._id}/pages/${newStatuesPage.pageId}/choices`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          text: "Garder le médaillon et retourner à la tour",
          to: 'tower'
        })
      });

      // Ajouter ce choix au sanctuaire
      await fetch(`${API}/stories/${gardien._id}/pages/${sanctuaryPage.pageId}/choices`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          text: "Examiner les statues brisées autour du sanctuaire",
          to: newStatuesPage.pageId
        })
      });

      console.log('✅ Nouveau choix "Examiner les statues" ajouté!');
    }
  }

  console.log('\n✅ Nouveaux choix ajoutés ! Rafraîchissez votre navigateur.');
}

addChoices().catch(console.error);
