// Supprimer les histoires draft vides (0 pages)
db.stories.deleteMany({
  status: 'draft',
  $expr: { $eq: [{ $size: "$pages" }, 0] }
});

// Supprimer les histoires draft avec peu de pages (sauf s'il n'y a qu'une version)
const titlesToClean = [
  "Le Mystère de la Cité Engloutie",
  "L'Eveil du Dernier Gardien"
];

titlesToClean.forEach(title => {
  const stories = db.stories.find({ title: title }).toArray();
  
  if (stories.length > 1) {
    // Garder seulement la version published ou celle avec le plus de pages
    const sorted = stories.sort((a, b) => {
      if (a.status === 'published' && b.status !== 'published') return -1;
      if (a.status !== 'published' && b.status === 'published') return 1;
      return b.pages.length - a.pages.length;
    });
    
    const keepId = sorted[0]._id;
    
    // Supprimer toutes les autres versions
    db.stories.deleteMany({
      title: title,
      _id: { $ne: keepId }
    });
    
    print(`Nettoyé "${title}" - gardé ID: ${keepId}`);
  }
});

print("Nettoyage terminé !");
print("Histoires restantes: " + db.stories.countDocuments());
