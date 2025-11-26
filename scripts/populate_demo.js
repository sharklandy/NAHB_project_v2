/*
A small helper that writes a demo story into backend/db.json
Run with: node scripts/populate_demo.js
*/
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');
const file = path.join(__dirname,'..','backend','db.json');
const db = JSON.parse(fs.readFileSync(file,'utf8'));
const authorId = 'demo-author';
if(!db.users.find(u=>u.id===authorId)) db.users.push({ id:authorId, username:'demo', email:'demo@nahb.local', password:'<hidden>' });
const sId = nanoid();
const p1 = { id: nanoid(), content: 'Vous vous réveillez dans une forêt étrange. Deux chemins se présentent.', isEnd:false, choices: [] };
const p2 = { id: nanoid(), content: 'Vous suivez le chemin de gauche et trouvez un trésor. Fin.', isEnd:true, choices: [] };
const p3 = { id: nanoid(), content: 'Vous suivez le chemin de droite et tombez dans une fosse. Fin.', isEnd:true, choices: [] };
p1.choices.push({ id: nanoid(), text: 'Aller à gauche', to: p2.id });
p1.choices.push({ id: nanoid(), text: 'Aller à droite', to: p3.id });
const story = { id: sId, title: 'Histoire Démo', description: 'Une petite histoire générée pour la démo', tags:['demo'], authorId, status:'published', pages: [p1,p2,p3], startPageId: p1.id, createdAt: Date.now() };
db.stories.push(story);
fs.writeFileSync(file, JSON.stringify(db,null,2));
console.log('Demo story added:', sId);
