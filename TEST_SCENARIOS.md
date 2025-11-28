# Script de Test - Nouvelles Fonctionnalités

## 🧪 Scénarios de Test

### Scénario 1 : Création et Gestion d'une Histoire

**Étapes :**
1. Connectez-vous avec un compte utilisateur
2. Allez dans "Editeur"
3. Créez une nouvelle histoire :
   - Titre : "Test Histoire v2"
   - Description : "Histoire de test pour les nouvelles fonctionnalités"
   - Thème : Fantasy
4. Créez 3-4 pages avec des choix
5. Définissez une page de départ
6. Allez dans "Mes Histoires"

**Résultats attendus :**
- ✅ L'histoire apparaît avec le badge "Brouillon"
- ✅ Toutes les stats sont à 0 (car jamais jouée)
- ✅ Vous voyez 5 boutons d'action

---

### Scénario 2 : Mode Preview

**Étapes :**
1. Dans "Mes Histoires", sur votre histoire
2. Cliquez sur "👁️ Prévisualiser"
3. Jouez l'histoire jusqu'à une fin
4. Notez la présence du bandeau orange
5. Retournez à "Mes Histoires"

**Résultats attendus :**
- ✅ Bandeau "MODE PRÉVISUALISATION" visible pendant le jeu
- ✅ Stats toujours à 0 (aucune lecture comptabilisée)
- ✅ Possibilité de rejouer sans limites

---

### Scénario 3 : Publication

**Étapes :**
1. Dans "Mes Histoires"
2. Cliquez sur "🚀 Publier"
3. Confirmez dans la popup
4. Attendez le message de succès
5. Allez dans "Histoires" (liste publique)

**Résultats attendus :**
- ✅ Badge passe de "Brouillon" à "Publiée"
- ✅ L'histoire apparaît dans la liste publique
- ✅ Toast de confirmation affiché

---

### Scénario 4 : Statistiques Réelles

**Prérequis :** Histoire publiée

**Étapes :**
1. Déconnectez-vous
2. Créez un nouveau compte OU connectez-vous avec un autre compte
3. Dans "Histoires", jouez l'histoire jusqu'à la fin
4. Reconnectez-vous avec le compte auteur
5. Allez dans "Mes Histoires"

**Résultats attendus :**
- ✅ Total lectures : 1
- ✅ Parties complétées : 1
- ✅ Taux de complétion : 100%
- ✅ Distribution des fins : 1 fin atteinte à 100%

---

### Scénario 5 : Stats Avancées

**Prérequis :** Au moins 1 partie jouée

**Étapes :**
1. Dans "Mes Histoires"
2. Cliquez sur "📊 Stats avancées"
3. Examinez le modal

**Résultats attendus :**
- ✅ Lecteurs uniques : 1
- ✅ Longueur moyenne du parcours : X pages
- ✅ Durée moyenne : Y minutes
- ✅ Top 10 des pages visitées
- ✅ Distribution des fins avec graphique

---

### Scénario 6 : Dépublication

**Étapes :**
1. Dans "Mes Histoires", sur une histoire publiée
2. Cliquez sur "📦 Dépublier"
3. Confirmez
4. Allez dans "Histoires" (liste publique)

**Résultats attendus :**
- ✅ Badge passe à "Brouillon"
- ✅ L'histoire disparaît de la liste publique
- ✅ Les stats sont conservées

---

### Scénario 7 : Suppression

**Étapes :**
1. Créez une histoire de test
2. Dans "Mes Histoires", cliquez sur "🗑️ Supprimer"
3. Lisez le message d'avertissement
4. Confirmez

**Résultats attendus :**
- ✅ Message de confirmation détaillé
- ✅ Histoire supprimée de la liste
- ✅ Toast de confirmation
- ✅ Stats associées supprimées

---

### Scénario 8 : Responsive Mobile

**Étapes :**
1. Ouvrez DevTools (F12)
2. Activez le mode responsive (iPhone 12 Pro)
3. Naviguez dans "Mes Histoires"
4. Ouvrez le modal des stats avancées

**Résultats attendus :**
- ✅ Grille de cartes passe en 1 colonne
- ✅ Boutons empilés verticalement
- ✅ Modal prend toute la largeur
- ✅ Textes lisibles
- ✅ Pas de scroll horizontal

---

### Scénario 9 : Toasts de Notification

**Étapes :**
1. Dans "Mes Histoires"
2. Effectuez plusieurs actions :
   - Publier une histoire
   - Dépublier une histoire
   - Supprimer une histoire
3. Observez les toasts

**Résultats attendus :**
- ✅ Toast vert pour succès
- ✅ Toast rouge pour erreur
- ✅ Toast orange pour warning
- ✅ Toast bleu pour info
- ✅ Auto-dismiss après 4 secondes
- ✅ Clic pour fermer manuellement

---

### Scénario 10 : Permissions

**Étapes :**
1. Créez une histoire avec le Compte A
2. Connectez-vous avec le Compte B
3. Essayez d'accéder aux stats via l'API :
   ```
   GET /api/author/stories/:idHistoireA/advanced-stats
   ```

**Résultats attendus :**
- ✅ Erreur 403 Forbidden
- ✅ Message "Not authorized"

---

## 📊 Matrice de Test

| Fonctionnalité | Testé | Statut | Notes |
|----------------|-------|--------|-------|
| Liste Mes Histoires | ⬜ | - | - |
| Stats de base | ⬜ | - | - |
| Stats avancées | ⬜ | - | - |
| Mode preview | ⬜ | - | - |
| Publication | ⬜ | - | - |
| Dépublication | ⬜ | - | - |
| Suppression | ⬜ | - | - |
| Toasts | ⬜ | - | - |
| Responsive mobile | ⬜ | - | - |
| Responsive tablette | ⬜ | - | - |
| Permissions | ⬜ | - | - |

---

## 🐛 Template de Bug Report

```markdown
### Bug : [Titre court]

**Description :**
[Description détaillée du problème]

**Étapes pour reproduire :**
1. 
2. 
3. 

**Résultat attendu :**
[Ce qui devrait se passer]

**Résultat actuel :**
[Ce qui se passe réellement]

**Environnement :**
- OS : 
- Navigateur : 
- Version : 

**Logs :**
```
[Coller les logs console/backend]
```

**Screenshots :**
[Si applicable]
```

---

## ✅ Checklist Avant Fusion

- [ ] Tous les scénarios testés
- [ ] Aucune erreur console
- [ ] Aucune erreur backend
- [ ] Responsive vérifié
- [ ] Permissions vérifiées
- [ ] Documentation à jour
- [ ] Pas de régression sur fonctionnalités existantes
- [ ] Tests sur plusieurs navigateurs (Chrome, Firefox, Safari)

---

**Bon test ! 🚀**
