// Script MongoDB Shell pour mettre à jour les thèmes des histoires
db = db.getSiblingDB('nahb');

// Mettre à jour toutes les histoires avec le tag fantasy
db.stories.updateMany(
  { tags: { $in: ['fantasy'] } },
  { $set: { theme: 'Fantasy' } }
);

// Mettre à jour toutes les histoires avec le tag ocean
db.stories.updateMany(
  { tags: { $in: ['ocean'] } },
  { $set: { theme: 'Ocean' } }
);

print('Themes mis a jour !');
print('\nHistoires actuelles:');
db.stories.find({}, { title: 1, theme: 1, tags: 1 }).forEach(s => {
  print(`  - ${s.title}: ${s.theme} (tags: ${s.tags.join(', ')})`);
});

