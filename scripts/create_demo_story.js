const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');

const MONGODB_URI = 'mongodb://admin:admin123@localhost:27017/nahb?authSource=admin';

// Schemas
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  banned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const choiceSchema = new mongoose.Schema({
  text: String,
  to: String
}, { _id: true });

const pageSchema = new mongoose.Schema({
  pageId: String,
  content: String,
  isEnd: Boolean,
  choices: [choiceSchema]
}, { _id: false });

const storySchema = new mongoose.Schema({
  title: String,
  description: String,
  tags: [String],
  authorId: String,
  status: String,
  pages: [pageSchema],
  startPageId: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Story = mongoose.model('Story', storySchema);

async function createDemoStory() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Créer ou récupérer l'auteur
    let author = await User.findOne({ email: 'author@nahb.local' });
    if (!author) {
      const hashed = await bcrypt.hash('author123', 10);
      author = await User.create({
        username: 'Chroniqueur',
        email: 'author@nahb.local',
        password: hashed
      });
      console.log('✅ Auteur créé');
    }

    // Générer les IDs pour les pages
    const pageIds = Array.from({ length: 27 }, () => nanoid());

    // Créer l'histoire
    const story = await Story.create({
      title: "L'Éveil du Dernier Gardien",
      description: "Une aventure épique dans un monde où la magie façonne le destin",
      tags: ["fantasy", "magie", "aventure", "créatures", "épique"],
      authorId: author._id.toString(),
      status: 'published',
      startPageId: pageIds[0],
      pages: [
        // PAGE 0 - Début
        {
          pageId: pageIds[0],
          content: "Vous vous réveillez dans une tour abandonnée. Des runes lumineuses dansent sur les murs de pierre, et un grimoire ancien repose sur un piédestal au centre de la pièce. Une fenêtre brisée laisse entrevoir une forêt magique où des créatures ailées volent entre les arbres phosphorescents. Votre tête vous fait mal, et vous ne vous souvenez de rien... sauf d'un mot qui résonne dans votre esprit : 'Gardien'.",
          isEnd: false,
          choices: [
            { text: "Examiner le grimoire sur le piédestal", to: pageIds[1] },
            { text: "Regarder par la fenêtre et observer la forêt", to: pageIds[2] }
          ]
        },
        // PAGE 1 - Grimoire
        {
          pageId: pageIds[1],
          content: "Vous ouvrez le grimoire. Les pages se tournent d'elles-mêmes, révélant des symboles qui s'illuminent à votre contact. Une voix spectrale s'élève : 'Bienvenue, Dernier Gardien. Le Cristal d'Équilibre a été brisé. Les forces obscures se réveillent. Vous devez retrouver les trois fragments avant la Lune de Sang.' Une carte magique apparaît, montrant trois lieux : les Marais des Murmures, la Citadelle de Glace, et le Volcan des Âmes.",
          isEnd: false,
          choices: [
            { text: "Partir immédiatement vers les Marais des Murmures", to: pageIds[3] },
            { text: "Étudier d'abord les sorts du grimoire", to: pageIds[4] }
          ]
        },
        // PAGE 2 - Fenêtre
        {
          pageId: pageIds[2],
          content: "Depuis la fenêtre, vous observez des sylphes lumineux danser entre les arbres. Soudain, l'un d'eux s'approche et parle d'une voix cristalline : 'Gardien, le temps presse ! Les ombres grandissent. Prenez le grimoire et partez !' Un rugissement lointain fait trembler la tour. Des nuages noirs s'accumulent à l'horizon.",
          isEnd: false,
          choices: [
            { text: "Prendre le grimoire et partir immédiatement", to: pageIds[1] },
            { text: "Descendre de la tour par la fenêtre avec l'aide du sylphe", to: pageIds[5] }
          ]
        },
        // PAGE 3 - Départ vers les Marais
        {
          pageId: pageIds[3],
          content: "Vous traversez la forêt magique. Les arbres murmurent sur votre passage. Après des heures de marche, vous atteignez l'entrée des Marais des Murmures. Une brume verte et toxique flotte au-dessus de l'eau stagnante. Vous voyez deux chemins : l'un longe la berge boueuse, l'autre traverse sur des pierres flottantes instables.",
          isEnd: false,
          choices: [
            { text: "Suivre la berge boueuse, plus long mais plus sûr", to: pageIds[6] },
            { text: "Sauter sur les pierres flottantes, plus rapide mais risqué", to: pageIds[7] }
          ]
        },
        // PAGE 4 - Étude des sorts
        {
          pageId: pageIds[4],
          content: "Vous passez plusieurs heures à étudier le grimoire. Vous apprenez trois sorts : Bouclier de Lumière, Langue des Anciens, et Détection Magique. Ces connaissances pourraient vous sauver la vie. Soudain, un tremblement secoue la tour. Le temps presse.",
          isEnd: false,
          choices: [
            { text: "Partir vers les Marais des Murmures", to: pageIds[3] },
            { text: "Partir vers la Citadelle de Glace", to: pageIds[8] }
          ]
        },
        // PAGE 5 - Descente avec le sylphe
        {
          pageId: pageIds[5],
          content: "Le sylphe vous fait descendre en douceur. 'Je m'appelle Lyra. Je vais vous guider.' Elle vous conduit rapidement à travers la forêt. En chemin, elle vous explique que les trois fragments du Cristal sont gardés par des créatures anciennes. Vous arrivez à une bifurcation.",
          isEnd: false,
          choices: [
            { text: "Aller aux Marais des Murmures avec Lyra", to: pageIds[9] },
            { text: "Aller à la Citadelle de Glace avec Lyra", to: pageIds[10] }
          ]
        },
        // PAGE 6 - Berge boueuse
        {
          pageId: pageIds[6],
          content: "Vous progressez lentement le long de la berge. Soudain, des créatures amphibies surgissent de l'eau ! L'une d'elles parle : 'Pourquoi un Gardien vient-il troubler notre repos ?' Votre réponse déterminera leur réaction.",
          isEnd: false,
          choices: [
            { text: "Expliquer votre quête du fragment avec diplomatie", to: pageIds[11] },
            { text: "Utiliser un sort de Bouclier de Lumière pour vous défendre", to: pageIds[12] }
          ]
        },
        // PAGE 7 - Pierres flottantes
        {
          pageId: pageIds[7],
          content: "Vous sautez agilement de pierre en pierre. Au milieu du marais, vous découvrez une grotte cachée. À l'intérieur, un cristal bleu pâle flotte dans les airs, gardé par une hydre endormie à trois têtes. C'est le premier fragment !",
          isEnd: false,
          choices: [
            { text: "Tenter de prendre le fragment discrètement", to: pageIds[13] },
            { text: "Utiliser la Langue des Anciens pour parler à l'hydre", to: pageIds[14] }
          ]
        },
        // PAGE 8 - Vers la Citadelle
        {
          pageId: pageIds[8],
          content: "Le voyage vers le nord est rude. Le froid devient mordant. Vous apercevez la Citadelle de Glace, une forteresse gigantesque taillée dans un glacier. Des golems de glace patrouillent à l'entrée. Comment allez-vous entrer ?",
          isEnd: false,
          choices: [
            { text: "Utiliser la Détection Magique pour trouver une entrée secrète", to: pageIds[15] },
            { text: "Affronter les golems de front", to: pageIds[16] }
          ]
        },
        // PAGE 9 - Marais avec Lyra
        {
          pageId: pageIds[9],
          content: "Avec Lyra, vous traversez les Marais rapidement. Elle connaît les passages secrets. Vous arrivez devant la grotte du fragment. 'L'hydre est dangereuse, mais elle respecte le courage', vous prévient Lyra.",
          isEnd: false,
          choices: [
            { text: "Entrer dans la grotte avec confiance", to: pageIds[14] },
            { text: "Demander à Lyra de distraire l'hydre pendant que vous prenez le fragment", to: pageIds[17] }
          ]
        },
        // PAGE 10 - Citadelle avec Lyra
        {
          pageId: pageIds[10],
          content: "Lyra vous guide vers la Citadelle. 'Le gardien de ce fragment est le Dragon de Glace, Frostharion. Il n'est pas mauvais, mais il teste tous ceux qui viennent.' Vous arrivez devant les portes gelées.",
          isEnd: false,
          choices: [
            { text: "Frapper aux portes et demander audience", to: pageIds[18] },
            { text: "Chercher une entrée dérobée avec Lyra", to: pageIds[15] }
          ]
        },
        // PAGE 11 - Diplomatie avec les amphibiens
        {
          pageId: pageIds[11],
          content: "Les créatures écoutent votre histoire. Leur chef hoche la tête : 'Nous connaissons l'hydre. Elle garde le fragment depuis des siècles. Prenez ceci.' Il vous donne une perle lumineuse. 'Montrez-lui ceci. Elle comprendra.' Vous continuez vers la grotte.",
          isEnd: false,
          choices: [
            { text: "Entrer dans la grotte avec la perle", to: pageIds[19] }
          ]
        },
        // PAGE 12 - Combat amphibiens
        {
          pageId: pageIds[12],
          content: "Votre bouclier les repousse, mais ils sont nombreux. Le combat est intense. Vous finissez par les vaincre, mais vous êtes épuisé et blessé. Vous devez continuer malgré tout.",
          isEnd: false,
          choices: [
            { text: "Continuer vers la grotte de l'hydre", to: pageIds[7] }
          ]
        },
        // PAGE 13 - Vol discret
        {
          pageId: pageIds[13],
          content: "Vous vous approchez silencieusement du fragment. Votre main se referme dessus... mais l'hydre ouvre ses six yeux ! Elle rugit et vous attaque ! Vous devez fuir avec le fragment. Vous réussissez de justesse, mais l'hydre libère un poison dans les marais qui vous suivra.",
          isEnd: false,
          choices: [
            { text: "Fuir vers la Citadelle de Glace pour le deuxième fragment", to: pageIds[20] }
          ]
        },
        // PAGE 14 - Parler à l'hydre
        {
          pageId: pageIds[14],
          content: "Utilisant la Langue des Anciens, vous vous adressez à l'hydre : 'Noble gardienne, je suis le Dernier Gardien. Le Cristal doit être restauré.' L'hydre ouvre les yeux et vous observe longuement. 'Enfin... un vrai Gardien. Prenez le fragment. Mais sachez que deux épreuves vous attendent encore.'",
          isEnd: false,
          choices: [
            { text: "Remercier l'hydre et partir vers la Citadelle de Glace", to: pageIds[20] }
          ]
        },
        // PAGE 15 - Entrée secrète
        {
          pageId: pageIds[15],
          content: "Votre sort révèle un passage caché derrière une cascade gelée. Vous entrez dans la citadelle par les sous-sols. Les couloirs de glace scintillent de magie ancienne. Vous entendez le souffle d'un dragon au loin.",
          isEnd: false,
          choices: [
            { text: "Suivre le souffle du dragon", to: pageIds[21] }
          ]
        },
        // PAGE 16 - Combat golems
        {
          pageId: pageIds[16],
          content: "Le combat contre les golems est brutal. Vous utilisez votre magie, mais ils se régénèrent sans cesse. Finalement, vous trouvez leur cœur de glace et les détruisez. Blessé, vous entrez dans la citadelle.",
          isEnd: false,
          choices: [
            { text: "Avancer prudemment dans la citadelle", to: pageIds[21] }
          ]
        },
        // PAGE 17 - Lyra distrait l'hydre
        {
          pageId: pageIds[17],
          content: "Lyra vole vers l'hydre en chantant. Fascinée, l'hydre la suit du regard. Vous saisissez le fragment, mais l'hydre remarque le vol ! Elle attaque Lyra qui est blessée. Vous devez fuir rapidement.",
          isEnd: false,
          choices: [
            { text: "Fuir avec Lyra blessée vers la Citadelle", to: pageIds[22] }
          ]
        },
        // PAGE 18 - Audience avec Frostharion
        {
          pageId: pageIds[18],
          content: "Les portes s'ouvrent. Un dragon majestueux de glace vous attend dans une salle immense. 'Gardien... Prouvez votre valeur. Répondez : Qu'est-ce qui est plus fort que la magie ?' C'est une énigme cruciale.",
          isEnd: false,
          choices: [
            { text: "Répondre : 'La volonté'", to: pageIds[23] },
            { text: "Répondre : 'L'amour et le sacrifice'", to: pageIds[24] }
          ]
        },
        // PAGE 19 - Perle des amphibiens
        {
          pageId: pageIds[19],
          content: "Vous montrez la perle à l'hydre. Ses yeux brillent de reconnaissance. 'Les amphibiens vous ont jugé digne. Prenez le fragment, Gardien. Allez restaurer l'équilibre.' Elle s'incline respectueusement.",
          isEnd: false,
          choices: [
            { text: "Prendre le fragment et partir vers la Citadelle de Glace", to: pageIds[20] }
          ]
        },
        // PAGE 20 - Voyage vers la Citadelle (après Marais)
        {
          pageId: pageIds[20],
          content: "Avec le premier fragment en votre possession, vous voyagez vers le nord. Le froid vous saisit. La Citadelle de Glace apparaît, majestueuse et terrifiante. Vous êtes maintenant à mi-chemin de votre quête.",
          isEnd: false,
          choices: [
            { text: "Entrer dans la Citadelle", to: pageIds[8] }
          ]
        },
        // PAGE 21 - Face au dragon
        {
          pageId: pageIds[21],
          content: "Vous entrez dans la salle du trône de glace. Frostharion, le Dragon de Glace, vous observe de ses yeux d'un bleu profond. 'Un Gardien... Enfin. Mais êtes-vous digne ?' Il attend votre réponse.",
          isEnd: false,
          choices: [
            { text: "Montrer le premier fragment comme preuve", to: pageIds[23] },
            { text: "Défier le dragon en duel magique", to: pageIds[25] }
          ]
        },
        // PAGE 22 - Citadelle avec Lyra blessée
        {
          pageId: pageIds[22],
          content: "Vous portez Lyra blessée jusqu'à la Citadelle. Le froid la fait souffrir davantage. Frostharion vous accueille : 'Votre ami est blessé par votre faute. Prouvez que vous méritez le fragment en sauvant d'abord votre compagnon.'",
          isEnd: false,
          choices: [
            { text: "Demander au dragon de soigner Lyra", to: pageIds[24] },
            { text: "Utiliser votre magie pour tenter de soigner Lyra", to: pageIds[26] }
          ]
        },
        // PAGE 23 - Bonne réponse/Fragment montré
        {
          pageId: pageIds[23],
          content: "Frostharion hoche la tête avec respect. 'Sage réponse. Vous comprenez que la vraie force vient de l'intérieur, pas de la magie seule.' Il vous donne le deuxième fragment. 'Il reste le Volcan des Âmes. C'est là que votre choix final vous attendra. Le Seigneur des Ombres vous y attend.'",
          isEnd: false,
          choices: [
            { text: "Partir immédiatement vers le Volcan des Âmes", to: pageIds[25] }
          ]
        },
        // PAGE 24 - Amour et sacrifice
        {
          pageId: pageIds[24],
          content: "Le dragon sourit, un spectacle rare. 'L'amour et le sacrifice... Oui. Vous avez un cœur de Gardien.' Il souffle sur Lyra qui guérit instantanément. Il vous remet le deuxième fragment. 'Le dernier fragment est au Volcan. Mais attention... un choix terrible vous y attend.'",
          isEnd: false,
          choices: [
            { text: "Partir vers le Volcan des Âmes avec Lyra guérie", to: pageIds[25] }
          ]
        },
        // PAGE 25 - Volcan des Âmes (CHOIX FINAL) *** DÉCISIF ***
        {
          pageId: pageIds[25],
          content: "Vous atteignez le Volcan des Âmes. La chaleur est insupportable. Au sommet, dans un cratère de lave, le troisième fragment flotte dans les airs. Mais le Seigneur des Ombres est là, une entité pure de ténèbres. 'Gardien... Je te propose un marché : prends le fragment et restaure le Cristal, mais ton monde connaîtra mille ans de paix fragile. OU... rejoins-moi. Ensemble, nous créerons un nouvel ordre, plus fort, éternel, mais au prix de ta liberté et de ton humanité. Choisis.'",
          isEnd: false,
          choices: [
            { text: "Refuser et combattre le Seigneur des Ombres pour la liberté", to: pageIds[26] },
            { text: "Accepter son offre pour un ordre éternel", to: pageIds[27] }
          ]
        },
        // PAGE 26 - FIN 1 : Victoire et Liberté (FIN LUMIÈRE)
        {
          pageId: pageIds[26],
          content: "Vous refusez avec force. Le combat est titanesque. Utilisant les trois fragments et toute votre magie, vous affrontez le Seigneur des Ombres. La bataille fait rage pendant des heures. Finalement, avec un dernier sort de Lumière, vous le bannissez dans les abysses. Vous restaurez le Cristal d'Équilibre. Le monde est sauvé. La paix revient, fragile mais réelle. Vous devenez le nouveau Gardien, protecteur de l'équilibre. Lyra reste à vos côtés. Des années de vigilance vous attendent, mais le monde est libre. Vous avez choisi la voie de la Lumière et de la Liberté.\n\n🌟 FIN - Le Gardien de l'Équilibre 🌟",
          isEnd: true,
          choices: []
        },
        // PAGE 27 - FIN 2 : Ordre Éternel (FIN OMBRE)
        {
          pageId: pageIds[27],
          content: "Après une longue hésitation, vous tendez la main vers le Seigneur des Ombres. La fusion commence. Vous sentez une puissance immense vous envahir. Votre humanité se dissout lentement. Vous devenez un être de pure magie, ni bon ni mauvais, mais absolu. Avec le Seigneur des Ombres, vous créez un nouvel ordre. Le monde connaît la paix... mais une paix imposée, sans choix. Vous êtes immortel, tout-puissant, mais vous n'êtes plus vraiment vous. Parfois, dans les profondeurs de votre conscience, un écho de votre ancien vous se demande si le prix était trop élevé. Mais il est trop tard. Vous êtes maintenant le Gardien Éternel, pour toujours.\n\n⚫ FIN - Le Gardien de l'Ombre Éternelle ⚫",
          isEnd: true,
          choices: []
        }
      ]
    });

    console.log('✅ Histoire créée avec succès !');
    console.log(`   Titre: ${story.title}`);
    console.log(`   ID: ${story._id}`);
    console.log(`   Pages: ${story.pages.length}`);
    console.log(`   Statut: ${story.status}`);
    console.log(`   Auteur: ${author.username}`);

    await mongoose.disconnect();
    console.log('✅ Déconnecté de MongoDB');
  } catch (err) {
    console.error('❌ Erreur:', err);
    process.exit(1);
  }
}

createDemoStory();
