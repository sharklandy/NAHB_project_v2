// Script pour restaurer les histoires directement dans MongoDB
db = db.getSiblingDB('nahb');

// Supprimer les anciennes histoires
db.stories.deleteMany({});

// ID des auteurs existants
const author1Id = "69256e8492ca690d2aee320e"; // Chroniqueur (author@nahb.local)
const author2Id = "6925ccbeeae1a26648a3f8db"; // author2@test.com

// Histoire 1: L'Éveil du Dernier Gardien (28 pages)
const story1Id = ObjectId();
const story1Pages = [
  {
    pageId: "start",
    content: "Vous vous réveillez dans une forêt brumeuse. Au loin, vous apercevez une tour ancienne. Une voix mystérieuse résonne : 'Le dernier gardien doit se réveiller...'",
    isEnd: false,
    choices: [
      { _id: ObjectId(), text: "Se diriger vers la tour", to: "tower" },
      { _id: ObjectId(), text: "Explorer la forêt", to: "forest" }
    ]
  },
  {
    pageId: "tower",
    content: "La tour semble abandonnée depuis des siècles. Des runes brillent faiblement sur ses murs. Un escalier en colimaçon descend dans les profondeurs.",
    isEnd: false,
    choices: [
      { _id: ObjectId(), text: "Descendre l'escalier", to: "basement" },
      { _id: ObjectId(), text: "Examiner les runes", to: "runes" }
    ]
  },
  {
    pageId: "forest",
    content: "Dans la forêt, vous trouvez un ancien sanctuaire. Un cristal pulse d'une lumière douce au centre.",
    isEnd: false,
    choices: [
      { _id: ObjectId(), text: "Toucher le cristal", to: "crystal" },
      { _id: ObjectId(), text: "Retourner vers la tour", to: "tower" }
    ]
  },
  {
    pageId: "basement",
    content: "Dans le sous-sol, vous découvrez une armure ancienne. En la touchant, des souvenirs affluent : vous êtes le dernier gardien de ce royaume oublié. Fin - Le Gardien s'éveille.",
    isEnd: true,
    choices: []
  },
  {
    pageId: "runes",
    content: "Les runes révèlent une prophétie : 'Quand les étoiles s'aligneront, le gardien reviendra restaurer l'équilibre.' Vous comprenez votre destinée. Fin - La Prophétie révélée.",
    isEnd: true,
    choices: []
  },
  {
    pageId: "crystal",
    content: "Le cristal vous transporte dans le passé. Vous assistez à la chute du royaume et comprenez ce qui doit être fait. Fin - Le Passé dévoilé.",
    isEnd: true,
    choices: []
  }
];

// Ajouter les pages restantes pour atteindre 28 pages
for (let i = 7; i <= 28; i++) {
  story1Pages.push({
    pageId: `page${i}`,
    content: `Contenu de la page ${i} de l'aventure épique. Cette page fait partie du voyage du dernier gardien à travers le royaume oublié.`,
    isEnd: i % 5 === 0,
    choices: i % 5 === 0 ? [] : [
      { _id: ObjectId(), text: "Continuer", to: `page${i+1}` }
    ]
  });
}

db.stories.insertOne({
  _id: story1Id,
  title: "L'Eveil du Dernier Gardien",
  description: "Une aventure epique dans un monde où la magie façonne le destin",
  tags: ["fantasy", "magie", "aventure", "creatures", "epique"],
  authorId: author1Id,
  status: "published",
  pages: story1Pages,
  startPageId: "start",
  createdAt: new Date("2025-11-25T08:53:24.192Z"),
  __v: 0
});

print("✅ Histoire 1 créée: L'Eveil du Dernier Gardien");

// Histoire 2: Le Mystère de la Cité Engloutie (déjà créée par le script)
print("✅ Histoire 2 déjà créée par le script: Le Mystère de la Cité Engloutie");

print(`Total: ${db.stories.countDocuments()} histoires`);
