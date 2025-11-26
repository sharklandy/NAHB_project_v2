// Script pour créer l'histoire complète dans MongoDB
db = db.getSiblingDB('nahb');

// ID de l'auteur (à récupérer depuis la collection users)
const authorId = db.users.findOne({email: 'author@nahb.local'})._id.toString();

// Générer les IDs pour les pages
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

const pageIds = Array.from({length: 28}, () => generateId());

// Créer l'histoire complète
db.stories.insertOne({
  title: "L'Eveil du Dernier Gardien",
  description: "Une aventure epique dans un monde ou la magie faconne le destin",
  tags: ["fantasy", "magie", "aventure", "creatures", "epique"],
  authorId: authorId,
  status: 'published',
  startPageId: pageIds[0],
  createdAt: new Date(),
  pages: [
    // PAGE 0 - Debut
    {
      pageId: pageIds[0],
      content: "Vous vous reveillez dans une tour abandonnee. Des runes lumineuses dansent sur les murs de pierre, et un grimoire ancien repose sur un piedestal au centre de la piece. Une fenetre brisee laisse entrevoir une foret magique ou des creatures ailees volent entre les arbres phosphorescents. Votre tete vous fait mal, et vous ne vous souvenez de rien... sauf d'un mot qui resonne dans votre esprit : Gardien.",
      isEnd: false,
      choices: [
        { text: "Examiner le grimoire sur le piedestal", to: pageIds[1] },
        { text: "Regarder par la fenetre et observer la foret", to: pageIds[2] }
      ]
    },
    // PAGE 1 - Grimoire
    {
      pageId: pageIds[1],
      content: "Vous ouvrez le grimoire. Les pages se tournent d'elles-memes, revelant des symboles qui s'illuminent a votre contact. Une voix spectrale s'eleve : Bienvenue, Dernier Gardien. Le Cristal d'Equilibre a ete brise. Les forces obscures se reveillent. Vous devez retrouver les trois fragments avant la Lune de Sang. Une carte magique apparait, montrant trois lieux : les Marais des Murmures, la Citadelle de Glace, et le Volcan des Ames.",
      isEnd: false,
      choices: [
        { text: "Partir immediatement vers les Marais des Murmures", to: pageIds[3] },
        { text: "Etudier d'abord les sorts du grimoire", to: pageIds[4] }
      ]
    },
    // PAGE 2 - Fenetre
    {
      pageId: pageIds[2],
      content: "Depuis la fenetre, vous observez des sylphes lumineux danser entre les arbres. Soudain, l'un d'eux s'approche et parle d'une voix cristalline : Gardien, le temps presse ! Les ombres grandissent. Prenez le grimoire et partez ! Un rugissement lointain fait trembler la tour. Des nuages noirs s'accumulent a l'horizon.",
      isEnd: false,
      choices: [
        { text: "Prendre le grimoire et partir immediatement", to: pageIds[1] },
        { text: "Descendre de la tour par la fenetre avec l'aide du sylphe", to: pageIds[5] }
      ]
    },
    // PAGE 3 - Marais
    {
      pageId: pageIds[3],
      content: "Vous traversez la foret magique. Les arbres murmurent sur votre passage. Apres des heures de marche, vous atteignez l'entree des Marais des Murmures. Une brume verte et toxique flotte au-dessus de l'eau stagnante. Vous voyez deux chemins : l'un longe la berge boueuse, l'autre traverse sur des pierres flottantes instables.",
      isEnd: false,
      choices: [
        { text: "Suivre la berge boueuse, plus long mais plus sur", to: pageIds[6] },
        { text: "Sauter sur les pierres flottantes, plus rapide mais risque", to: pageIds[7] }
      ]
    },
    // PAGE 4 - Etude sorts
    {
      pageId: pageIds[4],
      content: "Vous passez plusieurs heures a etudier le grimoire. Vous apprenez trois sorts : Bouclier de Lumiere, Langue des Anciens, et Detection Magique. Ces connaissances pourraient vous sauver la vie. Soudain, un tremblement secoue la tour. Le temps presse.",
      isEnd: false,
      choices: [
        { text: "Partir vers les Marais des Murmures", to: pageIds[3] },
        { text: "Partir vers la Citadelle de Glace", to: pageIds[8] }
      ]
    },
    // PAGE 5 - Lyra
    {
      pageId: pageIds[5],
      content: "Le sylphe vous fait descendre en douceur. Je m'appelle Lyra. Je vais vous guider. Elle vous conduit rapidement a travers la foret. En chemin, elle vous explique que les trois fragments du Cristal sont gardes par des creatures anciennes. Vous arrivez a une bifurcation.",
      isEnd: false,
      choices: [
        { text: "Aller aux Marais des Murmures avec Lyra", to: pageIds[9] },
        { text: "Aller a la Citadelle de Glace avec Lyra", to: pageIds[10] }
      ]
    },
    // PAGE 6 - Berge
    {
      pageId: pageIds[6],
      content: "Vous progressez lentement le long de la berge. Soudain, des creatures amphibies surgissent de l'eau ! L'une d'elles parle : Pourquoi un Gardien vient-il troubler notre repos ? Votre reponse determinera leur reaction.",
      isEnd: false,
      choices: [
        { text: "Expliquer votre quete du fragment avec diplomatie", to: pageIds[11] },
        { text: "Utiliser un sort de Bouclier de Lumiere pour vous defendre", to: pageIds[12] }
      ]
    },
    // PAGE 7 - Pierres
    {
      pageId: pageIds[7],
      content: "Vous sautez agilement de pierre en pierre. Au milieu du marais, vous decouvrez une grotte cachee. A l'interieur, un cristal bleu pale flotte dans les airs, garde par une hydre endormie a trois tetes. C'est le premier fragment !",
      isEnd: false,
      choices: [
        { text: "Tenter de prendre le fragment discretement", to: pageIds[13] },
        { text: "Utiliser la Langue des Anciens pour parler a l'hydre", to: pageIds[14] }
      ]
    },
    // PAGE 8 - Citadelle
    {
      pageId: pageIds[8],
      content: "Le voyage vers le nord est rude. Le froid devient mordant. Vous apercevez la Citadelle de Glace, une forteresse gigantesque taillee dans un glacier. Des golems de glace patrouillent a l'entree. Comment allez-vous entrer ?",
      isEnd: false,
      choices: [
        { text: "Utiliser la Detection Magique pour trouver une entree secrete", to: pageIds[15] },
        { text: "Affronter les golems de front", to: pageIds[16] }
      ]
    },
    // PAGE 9 - Marais avec Lyra
    {
      pageId: pageIds[9],
      content: "Avec Lyra, vous traversez les Marais rapidement. Elle connait les passages secrets. Vous arrivez devant la grotte du fragment. L'hydre est dangereuse, mais elle respecte le courage, vous previent Lyra.",
      isEnd: false,
      choices: [
        { text: "Entrer dans la grotte avec confiance", to: pageIds[14] },
        { text: "Demander a Lyra de distraire l'hydre pendant que vous prenez le fragment", to: pageIds[17] }
      ]
    },
    // PAGE 10 - Citadelle avec Lyra
    {
      pageId: pageIds[10],
      content: "Lyra vous guide vers la Citadelle. Le gardien de ce fragment est le Dragon de Glace, Frostharion. Il n'est pas mauvais, mais il teste tous ceux qui viennent. Vous arrivez devant les portes gelees.",
      isEnd: false,
      choices: [
        { text: "Frapper aux portes et demander audience", to: pageIds[18] },
        { text: "Chercher une entree derobee avec Lyra", to: pageIds[15] }
      ]
    },
    // PAGE 11 - Diplomatie
    {
      pageId: pageIds[11],
      content: "Les creatures ecoutent votre histoire. Leur chef hoche la tete : Nous connaissons l'hydre. Elle garde le fragment depuis des siecles. Prenez ceci. Il vous donne une perle lumineuse. Montrez-lui ceci. Elle comprendra. Vous continuez vers la grotte.",
      isEnd: false,
      choices: [
        { text: "Entrer dans la grotte avec la perle", to: pageIds[19] }
      ]
    },
    // PAGE 12 - Combat
    {
      pageId: pageIds[12],
      content: "Votre bouclier les repousse, mais ils sont nombreux. Le combat est intense. Vous finissez par les vaincre, mais vous etes epuise et blesse. Vous devez continuer malgre tout.",
      isEnd: false,
      choices: [
        { text: "Continuer vers la grotte de l'hydre", to: pageIds[7] }
      ]
    },
    // PAGE 13 - Vol
    {
      pageId: pageIds[13],
      content: "Vous vous approchez silencieusement du fragment. Votre main se referme dessus... mais l'hydre ouvre ses six yeux ! Elle rugit et vous attaque ! Vous devez fuir avec le fragment. Vous reussissez de justesse, mais l'hydre libere un poison dans les marais qui vous suivra.",
      isEnd: false,
      choices: [
        { text: "Fuir vers la Citadelle de Glace pour le deuxieme fragment", to: pageIds[20] }
      ]
    },
    // PAGE 14 - Langue Anciens
    {
      pageId: pageIds[14],
      content: "Utilisant la Langue des Anciens, vous vous adressez a l'hydre : Noble gardienne, je suis le Dernier Gardien. Le Cristal doit etre restaure. L'hydre ouvre les yeux et vous observe longuement. Enfin... un vrai Gardien. Prenez le fragment. Mais sachez que deux epreuves vous attendent encore.",
      isEnd: false,
      choices: [
        { text: "Remercier l'hydre et partir vers la Citadelle de Glace", to: pageIds[20] }
      ]
    },
    // PAGE 15 - Entree secrete
    {
      pageId: pageIds[15],
      content: "Votre sort revele un passage cache derriere une cascade gelee. Vous entrez dans la citadelle par les sous-sols. Les couloirs de glace scintillent de magie ancienne. Vous entendez le souffle d'un dragon au loin.",
      isEnd: false,
      choices: [
        { text: "Suivre le souffle du dragon", to: pageIds[21] }
      ]
    },
    // PAGE 16 - Golems
    {
      pageId: pageIds[16],
      content: "Le combat contre les golems est brutal. Vous utilisez votre magie, mais ils se regenerent sans cesse. Finalement, vous trouvez leur coeur de glace et les detruisez. Blesse, vous entrez dans la citadelle.",
      isEnd: false,
      choices: [
        { text: "Avancer prudemment dans la citadelle", to: pageIds[21] }
      ]
    },
    // PAGE 17 - Lyra distrait
    {
      pageId: pageIds[17],
      content: "Lyra vole vers l'hydre en chantant. Fascinee, l'hydre la suit du regard. Vous saisissez le fragment, mais l'hydre remarque le vol ! Elle attaque Lyra qui est blessee. Vous devez fuir rapidement.",
      isEnd: false,
      choices: [
        { text: "Fuir avec Lyra blessee vers la Citadelle", to: pageIds[22] }
      ]
    },
    // PAGE 18 - Audience
    {
      pageId: pageIds[18],
      content: "Les portes s'ouvrent. Un dragon majestueux de glace vous attend dans une salle immense. Gardien... Prouvez votre valeur. Repondez : Qu'est-ce qui est plus fort que la magie ? C'est une enigme cruciale.",
      isEnd: false,
      choices: [
        { text: "Repondre : La volonte", to: pageIds[23] },
        { text: "Repondre : L'amour et le sacrifice", to: pageIds[24] }
      ]
    },
    // PAGE 19 - Perle
    {
      pageId: pageIds[19],
      content: "Vous montrez la perle a l'hydre. Ses yeux brillent de reconnaissance. Les amphibiens vous ont juge digne. Prenez le fragment, Gardien. Allez restaurer l'equilibre. Elle s'incline respectueusement.",
      isEnd: false,
      choices: [
        { text: "Prendre le fragment et partir vers la Citadelle de Glace", to: pageIds[20] }
      ]
    },
    // PAGE 20 - Voyage Citadelle
    {
      pageId: pageIds[20],
      content: "Avec le premier fragment en votre possession, vous voyagez vers le nord. Le froid vous saisit. La Citadelle de Glace apparait, majestueuse et terrifiante. Vous etes maintenant a mi-chemin de votre quete.",
      isEnd: false,
      choices: [
        { text: "Entrer dans la Citadelle", to: pageIds[8] }
      ]
    },
    // PAGE 21 - Face dragon
    {
      pageId: pageIds[21],
      content: "Vous entrez dans la salle du trone de glace. Frostharion, le Dragon de Glace, vous observe de ses yeux d'un bleu profond. Un Gardien... Enfin. Mais etes-vous digne ? Il attend votre reponse.",
      isEnd: false,
      choices: [
        { text: "Montrer le premier fragment comme preuve", to: pageIds[23] },
        { text: "Defier le dragon en duel magique", to: pageIds[25] }
      ]
    },
    // PAGE 22 - Lyra blessee
    {
      pageId: pageIds[22],
      content: "Vous portez Lyra blessee jusqu'a la Citadelle. Le froid la fait souffrir davantage. Frostharion vous accueille : Votre ami est blesse par votre faute. Prouvez que vous meritez le fragment en sauvant d'abord votre compagnon.",
      isEnd: false,
      choices: [
        { text: "Demander au dragon de soigner Lyra", to: pageIds[24] },
        { text: "Utiliser votre magie pour tenter de soigner Lyra", to: pageIds[26] }
      ]
    },
    // PAGE 23 - Fragment 2
    {
      pageId: pageIds[23],
      content: "Frostharion hoche la tete avec respect. Sage reponse. Vous comprenez que la vraie force vient de l'interieur, pas de la magie seule. Il vous donne le deuxieme fragment. Il reste le Volcan des Ames. C'est la que votre choix final vous attendra. Le Seigneur des Ombres vous y attend.",
      isEnd: false,
      choices: [
        { text: "Partir immediatement vers le Volcan des Ames", to: pageIds[25] }
      ]
    },
    // PAGE 24 - Amour
    {
      pageId: pageIds[24],
      content: "Le dragon sourit, un spectacle rare. L'amour et le sacrifice... Oui. Vous avez un coeur de Gardien. Il souffle sur Lyra qui guerit instantanement. Il vous remet le deuxieme fragment. Le dernier fragment est au Volcan. Mais attention... un choix terrible vous y attend.",
      isEnd: false,
      choices: [
        { text: "Partir vers le Volcan des Ames avec Lyra guerie", to: pageIds[25] }
      ]
    },
    // PAGE 25 - CHOIX FINAL
    {
      pageId: pageIds[25],
      content: "Vous atteignez le Volcan des Ames. La chaleur est insupportable. Au sommet, dans un cratere de lave, le troisieme fragment flotte dans les airs. Mais le Seigneur des Ombres est la, une entite pure de tenebres. Gardien... Je te propose un marche : prends le fragment et restaure le Cristal, mais ton monde connaitra mille ans de paix fragile. OU... rejoins-moi. Ensemble, nous creerons un nouvel ordre, plus fort, eternel, mais au prix de ta liberte et de ton humanite. Choisis.",
      isEnd: false,
      choices: [
        { text: "Refuser et combattre le Seigneur des Ombres pour la liberte", to: pageIds[26] },
        { text: "Accepter son offre pour un ordre eternel", to: pageIds[27] }
      ]
    },
    // PAGE 26 - FIN LUMIERE
    {
      pageId: pageIds[26],
      content: "Vous refusez avec force. Le combat est titanesque. Utilisant les trois fragments et toute votre magie, vous affrontez le Seigneur des Ombres. La bataille fait rage pendant des heures. Finalement, avec un dernier sort de Lumiere, vous le bannissez dans les abysses. Vous restaurez le Cristal d'Equilibre. Le monde est sauve. La paix revient, fragile mais reelle. Vous devenez le nouveau Gardien, protecteur de l'equilibre. Lyra reste a vos cotes. Des annees de vigilance vous attendent, mais le monde est libre. Vous avez choisi la voie de la Lumiere et de la Liberte. -- FIN : Le Gardien de l'Equilibre --",
      isEnd: true,
      choices: []
    },
    // PAGE 27 - FIN OMBRE
    {
      pageId: pageIds[27],
      content: "Apres une longue hesitation, vous tendez la main vers le Seigneur des Ombres. La fusion commence. Vous sentez une puissance immense vous envahir. Votre humanite se dissout lentement. Vous devenez un etre de pure magie, ni bon ni mauvais, mais absolu. Avec le Seigneur des Ombres, vous creez un nouvel ordre. Le monde connait la paix... mais une paix imposee, sans choix. Vous etes immortel, tout-puissant, mais vous n'etes plus vraiment vous. Parfois, dans les profondeurs de votre conscience, un echo de votre ancien vous se demande si le prix etait trop eleve. Mais il est trop tard. Vous etes maintenant le Gardien Eternel, pour toujours. -- FIN : Le Gardien de l'Ombre Eternelle --",
      isEnd: true,
      choices: []
    }
  ]
});

print('Histoire creee avec succes !');
print('Titre: Eveil du Dernier Gardien');
print('Pages: 28 avec 2 fins');
print('Statut: published');
