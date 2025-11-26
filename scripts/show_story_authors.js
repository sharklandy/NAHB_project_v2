// Show stories with their authors

db = db.getSiblingDB('nahb');

const stories = db.stories.find().toArray();

print('\n=== HISTOIRES ET LEURS AUTEURS ===\n');

stories.forEach(story => {
  const author = db.users.findOne({ _id: ObjectId(story.authorId) });
  
  print(`Histoire: ${story.title}`);
  print(`  authorId: ${story.authorId}`);
  print(`  Auteur: ${author ? author.email : 'INTROUVABLE'}`);
  print('');
});
