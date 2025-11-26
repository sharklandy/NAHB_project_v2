/*
Generate multiple demo stories into backend/db.json.
This simulates "IA-generated" content using simple templates.
Run: node scripts/populate_demo_more.js
*/
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

const file = path.join(__dirname,'..','backend','db.json');
const db = JSON.parse(fs.readFileSync(file,'utf8'));
const authorId = 'demo-author';
if(!db.users.find(u=>u.id===authorId)) db.users.push({ id:authorId, username:'demo', email:'demo@nahb.local', password:'<hidden>' });

function makeStory(title, summary, pages){
  const pObjs = pages.map(p => ({ id: nanoid(), content: p.content, isEnd: !!p.isEnd, choices: [] }));
  // link choices by index
  pages.forEach((p, idx) => {
    if(p.choices){
      p.choices.forEach(ch => {
        const from = pObjs[idx];
        const toIdx = ch.toIndex;
        const to = (toIdx !== undefined && pObjs[toIdx]) ? pObjs[toIdx].id : null;
        from.choices.push({ id: nanoid(), text: ch.text, to });
      });
    }
  });
  return { id: nanoid(), title, description: summary, tags:['demo','ia'], authorId, status:'published', pages: pObjs, startPageId: pObjs[0].id, createdAt: Date.now() };
}

const stories = [];
stories.push(makeStory('La Forêt des Échos', 'Un court périple dans une forêt qui répond.', [
  { content: "Vous entrez dans une forêt où chaque mot revient en écho.", choices: [{text:'Parler fort', toIndex:1}, {text:'Se taire', toIndex:2}] },
  { content: "Votre voix réveille un ancien esprit. Fin.", isEnd:true },
  { content: "Le silence vous montre un chemin secret. Fin.", isEnd:true }
]));

stories.push(makeStory('Le Marchand de Temps', 'Un marchand vend des minutes en bocaux.', [
  { content: "Un étal couvert d'horloges moussues vous attend.", choices: [{text:'Acheter une minute', toIndex:1}, {text:'Partir', toIndex:2}] },
  { content: "La minute achetée vous permet de réparer une erreur. Fin.", isEnd:true },
  { content: "Vous partez, mais regrettez l'occasion manquée. Fin.", isEnd:true }
]));

stories.push(makeStory('La Cité Sous-Mer', 'Explorez les ruines d'une ville engloutie.', [
  { content: "La mer s'écarte et révèle des dômes cristallins.", choices: [{text:'Entrer dans un dôme', toIndex:1}, {text:'Remonter à la surface', toIndex:2}] },
  { content: "Le dôme renferme une bibliothèque perdue. Fin.", isEnd:true },
  { content: "À la surface, le monde a changé. Fin.", isEnd:true }
]));

db.stories = db.stories.concat(stories);
fs.writeFileSync(file, JSON.stringify(db,null,2));
console.log('Added', stories.length, 'demo stories.');
