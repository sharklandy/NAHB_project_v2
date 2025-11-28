const mongoose = require('mongoose');

const playSchema = new mongoose.Schema({
  storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true },
  userId: { type: String, required: true, ref: 'User' },
  endPageId: { type: String, default: null }, // null si partie en cours
  path: [{ type: String }], // Chemin parcouru (liste des pageIds)
  currentPageId: { type: String, default: null }, // Page actuelle (pour sauvegarde)
  isCompleted: { type: Boolean, default: false }, // Partie terminée ou en cours
  isPreview: { type: Boolean, default: false }, // Mode preview (auteur teste sans polluer stats)
  isAbandoned: { type: Boolean, default: false }, // Partie abandonnée (pas complétée dans X jours)
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null }
});

// Index pour accélérer les requêtes de statistiques
playSchema.index({ storyId: 1, endPageId: 1 });
playSchema.index({ userId: 1, storyId: 1 });

module.exports = mongoose.model('Play', playSchema);
