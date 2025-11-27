# 🚀 Guide rapide : Créer une histoire interactive

## Étape 1️⃣ : Créer l'histoire

Dans la **sidebar gauche** :
1. Titre : `L'aventure du dragon`
2. Description : `Une quête épique...`
3. **Thème** : `Fantasy` (OBLIGATOIRE !)
4. Cliquez sur **"➕ Créer"**

✅ L'histoire apparaît dans la liste en dessous

---

## Étape 2️⃣ : Créer la première page

1. Cliquez sur **"➕ Créer une page"** (en haut)
2. Écrivez le contenu :
   ```
   Vous vous réveillez dans une forêt sombre. 
   Deux chemins s'offrent à vous.
   ```
3. Ajoutez des choix :
   - Cliquez sur **"➕ Ajouter un choix"**
   - Choix 1 : `Prendre le chemin de gauche`
   - Choix 2 : `Prendre le chemin de droite`
4. Laissez-les **"-- Relier plus tard --"** pour l'instant
5. Cliquez sur **"✅ Créer cette page"**

✅ La page est créée et devient automatiquement la page de départ !

---

## Étape 3️⃣ : Voir la structure

1. Cliquez sur **"🌳 Vue arborescente"**
2. Vous voyez :
   - 🏁 **Début** : Votre première page
   - Les 2 choix avec ⚠️ **Non relié**

---

## Étape 4️⃣ : Créer les pages suivantes

Pour **chaque choix**, créez une page :

### Pour le chemin de gauche :
1. Mode **"➕ Créer une page"**
2. Contenu : `Vous arrivez devant une grotte...`
3. Ajoutez 2-3 choix
4. Créez

### Pour le chemin de droite :
1. Mode **"➕ Créer une page"**
2. Contenu : `Vous croisez un vieil ermite...`
3. Ajoutez 2-3 choix
4. Créez

---

## Étape 5️⃣ : Relier les choix

1. Retournez en **"🌳 Vue arborescente"**
2. Pour chaque choix **⚠️ Non relié** :
   - Cliquez sur **"🔗 Relier à une page existante"**
   - **Copiez le `pageId`** de la page de destination (en bas de chaque carte)
   - **Collez** dans le prompt
3. Le choix est maintenant relié ✅

---

## Étape 6️⃣ : Créer les fins

Créez plusieurs fins possibles :

1. Mode **"➕ Créer une page"**
2. Contenu : `Vous avez vaincu le dragon ! Vous êtes un héros.`
3. ✅ Cochez **"Page finale"**
4. Label : `Victoire héroïque`
5. Créez

Répétez pour d'autres fins :
- `Fin tragique`
- `Fuite honteuse`
- `Sacrifice ultime`

---

## Étape 7️⃣ : Finaliser

1. Vérifiez en **"🌳 Vue arborescente"** :
   - ✅ Tous les choix sont reliés
   - ✅ Plusieurs fins existent
   - ✅ Pas d'impasses (sauf les fins)

2. **Publiez** l'histoire :
   - Dans la sidebar, cliquez sur **"📤 Publier"**

3. Testez en allant dans **"Histoires"** puis **"Jouer"**

---

## 💡 Astuces

### Copier un pageId rapidement
- Chaque carte affiche son `ID: abc123` en bas
- Sélectionnez et copiez (Ctrl+C)
- Collez dans le prompt de liaison

### Voir la destination d'un choix
- En mode arborescence
- Sous chaque choix : `➡️ Vous arrivez devant une grotte...`

### Modifier un choix existant
- Cliquez sur **"✏️ Modifier"** à côté d'un choix relié
- Changez le pageId de destination

### Supprimer une page
- Attention ! Supprime aussi tous les choix qui pointent vers elle
- Utilisez **"🗑️"** en haut à droite de chaque carte

---

## ⚠️ Erreurs courantes

### "Le thème est requis"
→ Sélectionnez un thème dans le menu déroulant avant de créer

### "Le contenu de la page est requis"
→ Écrivez du texte dans la zone de contenu

### Choix non relié
→ Normal ! Reliez-le après avoir créé toutes les pages

### Page introuvable
→ Vérifiez que le pageId copié est correct

---

## 🎯 Exemple d'arborescence simple

```
🏁 DÉBUT : Forêt sombre
   ├─ 💬 Chemin gauche → Grotte
   │    ├─ 💬 Entrer → 🏁 FIN : Trésor trouvé
   │    └─ 💬 Fuir → 🏁 FIN : Survie
   └─ 💬 Chemin droite → Ermite
        ├─ 💬 Parler → Village
        │    └─ 💬 Aider → 🏁 FIN : Héros du village
        └─ 💬 Ignorer → 🏁 FIN : Solitude
```

---

Bon courage pour votre première histoire ! 📖✨
