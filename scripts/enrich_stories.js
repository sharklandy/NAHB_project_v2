// Script pour enrichir le contenu des histoires existantes
// À exécuter avec: docker exec -i nahb-mongodb mongosh nahb -u admin -p admin123 --authenticationDatabase admin < scripts/enrich_stories.js

// Enrichissement de "L'Éveil du Dernier Gardien"
db.stories.updateOne(
  { title: "L'Éveil du Dernier Gardien" },
  {
    $set: {
      "pages.$[p1].content": `Vous ouvrez lentement les yeux. Une lumière douce filtre à travers les vitraux colorés d'une immense tour de pierre. Les rayons du soleil matinal dessinent des motifs complexes sur le sol de marbre blanc. Vos membres sont engourdis, comme si vous aviez dormi pendant une éternité.

En vous redressant, vous remarquez que vous êtes allongé sur un lit de pierre orné de symboles anciens gravés dans la roche. Ces symboles semblent pulser d'une faible lueur bleutée, répondant à votre éveil. L'air est chargé d'une énergie mystique que vous n'aviez jamais ressentie auparavant.

Une voix résonne alors dans votre esprit, grave et puissante : "Enfin... Le Dernier Gardien s'éveille. Le monde a besoin de toi. Depuis des siècles, nous avons attendu ce moment. Les ténèbres s'étendent, et seul un Gardien peut restaurer l'équilibre."

Vous vous levez péniblement, découvrant que vous portez une armure légère ornée de runes lumineuses. Sur une table près de vous repose une épée ancienne, sa lame brillant d'une aura argentée. Un grand miroir sur le mur vous renvoie votre reflet : vous semblez différent, plus fort, comme si une force ancestrale coulait maintenant dans vos veines.

Deux portes s'offrent à vous dans cette salle circulaire. La première, à votre gauche, mène vers le sommet de la tour où vous pourrez observer le monde extérieur et comprendre l'ampleur de votre mission. La seconde, à votre droite, descend vers les profondeurs de la tour, là où reposent les archives des anciens Gardiens et les secrets de votre pouvoir.`
    },
    $set: {
      "pages.$[p2].content": `Vous gravissez les marches de pierre usées par le temps, votre main glissant sur la rampe sculptée de scènes de batailles anciennes. À chaque pas, vous sentez l'air se rafraîchir et le vent s'intensifier. Les fenêtres étroites laissent apercevoir un paysage de plus en plus vaste.

Enfin, vous poussez la lourde porte de bois renforcé et émergez au sommet de la tour. Le spectacle qui s'offre à vous vous coupe le souffle. La tour s'élève à des centaines de mètres au-dessus d'une vaste plaine verdoyante, parsemée de ruines antiques et de forêts luxuriantes.

Mais ce qui attire immédiatement votre attention, c'est l'horizon. Au nord, un voile d'obscurité s'étend comme une mer de ténèbres, avalant lentement la lumière du jour. Des éclairs violacés zèbrent cette masse sombre, et vous pouvez percevoir, même à cette distance, une présence malveillante qui fait frissonner votre âme.

Sur un piédestal au centre de la terrasse, vous trouvez un orbe de cristal flottant. Lorsque vous l'effleurez, des images se forment dans sa surface translucide : des villages en ruines, des créatures d'ombre dévorant tout sur leur passage, des guerriers tombant les uns après les autres face à une horde infernale.

"Le Fléau des Ombres", murmure la voix dans votre esprit. "Il a déjà détruit trois royaumes. Les défenses s'effondrent. Tu dois choisir : rassembler des alliés dans les terres encore libres, ou affronter directement la source de cette corruption au Cœur des Ténèbres. Mais sache que chaque jour qui passe renforce l'ennemi."

À vos pieds, une carte magique se déploie dans les airs, montrant deux chemins possibles : l'un vers les royaumes de l'Est où résident encore de puissants mages et guerriers, l'autre vers le Nord, droit vers le cœur de la tempête d'ombres.`
    },
    $set: {
      "pages.$[p3].content": `Vous décidez de descendre dans les profondeurs de la tour. Un escalier en colimaçon s'enfonce dans les ténèbres, éclairé seulement par des torches enchantées qui s'allument à votre passage. Les murs sont couverts de fresques représentant l'histoire des Gardiens : des héros légendaires combattant des forces obscures, scellant des portails démoniaques, protégeant les innocents.

Plus vous descendez, plus l'air devient chargé de magie ancienne. Vous pouvez sentir le poids des siècles, la sagesse et le sacrifice de ceux qui vous ont précédé. Enfin, après ce qui semble une éternité, vous atteignez une immense bibliothèque souterraine.

Des milliers de volumes s'alignent sur des étagères qui semblent défier les lois de la physique, montant jusqu'à un plafond invisible dans l'obscurité. Au centre trône un grimoire massif posé sur un lutrin de pierre. Le livre s'ouvre de lui-même à votre approche, révélant des pages couvertes de caractères lumineux.

"Bienvenue, Gardien", lit-on sur la première page, les mots s'écrivant comme par magie. "Ici réside toute la connaissance de tes prédécesseurs. Le Fléau des Ombres que tu affrontes n'est pas une simple armée, mais une entité ancienne, bannie il y a mille ans par le Premier Gardien."

Les pages tournent d'elles-mêmes, révélant des sorts oubliés, des techniques de combat perdues, et surtout, l'histoire de la dernière bataille : "Le Sceau est brisé. L'entité nommée Nyx'therion a été libérée. Pour la vaincre définitivement, tu dois réunir les trois Reliques des Gardiens : l'Épée du Crépuscule, le Bouclier de l'Aube et la Couronne des Étoiles."

Une carte holographique apparaît au-dessus du livre, montrant l'emplacement des reliques : l'une dans les Montagnes de Cristal à l'Est, une autre dans les Marais Maudits au Sud, et la dernière dans les Ruines Célestes au-dessus des nuages.

"Mais attention", avertit le grimoire, "chaque relique est gardée par une épreuve mortelle. Et Nyx'therion envoie déjà ses champions pour les récupérer en premier. Le temps presse."`
    }
  },
  { arrayFilters: [
    { "p1.pageId": { $exists: true } },
    { "p2.pageId": { $exists: true } },
    { "p3.pageId": { $exists: true } }
  ]}
);

// Enrichissement de "Le Mystère de la Cité Engloutie"
db.stories.updateOne(
  { title: "Le Mystère de la Cité Engloutie" },
  {
    $set: {
      description: "Plongez dans les profondeurs de l'océan pour découvrir les secrets d'une civilisation perdue. Une aventure sous-marine épique où chaque choix peut révéler des trésors inestimables ou des dangers mortels. Explorez des temples engloutis, déchiffrez des inscriptions anciennes et percez le mystère de la disparition d'Atlantis."
    }
  }
);

print("Histoires enrichies avec succès!");
