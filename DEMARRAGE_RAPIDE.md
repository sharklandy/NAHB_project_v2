# 🚀 Guide de Démarrage Rapide - NAHB

## Configuration Initiale (une seule fois)

### 1. MongoDB Atlas
1. Créez un compte gratuit sur https://cloud.mongodb.com/
2. Créez un cluster (gratuit)
3. Dans "Network Access", ajoutez votre IP (ou 0.0.0.0/0 pour le dev)
4. Dans "Database Access", créez un utilisateur
5. Récupérez votre URL de connexion

### 2. Configuration Backend
Créez le fichier `backend/.env` :
```env
MONGODB_URI=mongodb+srv://votre_user:votre_pass@cluster.mongodb.net/BDD?retryWrites=true&w=majority
JWT_SECRET=un_secret_tres_securise_changez_moi
PORT=4000
```

### 3. Installation
```bash
# Backend
cd backend
npm install

# Frontend (nouveau terminal)
cd frontend
npm install
```

## Démarrage Quotidien

### Terminal 1 - Backend
```bash
cd backend
npm start
```
✅ Backend sur http://localhost:4000

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```
✅ Frontend sur http://localhost:3000

## Compte Admin

Le compte admin est créé automatiquement au démarrage du backend :
- Email : `admin@nahb.local`

## Créer un Utilisateur

```bash
node scripts/create_user.js
```

## Créer des Histoires de Démo

```bash
node scripts/create_all_stories.js
```

## En cas de Problème

### "Le site est inaccessible"
1. Vérifiez que les deux serveurs tournent (backend + frontend)
2. Vérifiez les ports avec : `netstat -ano | findstr "3000 4000"`

### "401 Unauthorized"
- La lecture d'histoires ne nécessite PAS de connexion
- Seule la création/modification nécessite un compte

### "Erreur de connexion MongoDB"
1. Vérifiez votre URL dans `backend/.env`
2. Vérifiez l'accès réseau sur MongoDB Atlas
3. Vérifiez que votre IP est autorisée

### Redémarrer proprement
```bash
# Arrêter tous les processus Node
Get-Process -Name node | Stop-Process -Force

# Relancer
cd backend; npm start  # Terminal 1
cd frontend; npm start # Terminal 2
```

## URLs Importantes

- Frontend : http://localhost:3000
- Backend API : http://localhost:4000/api
- MongoDB Atlas : https://cloud.mongodb.com/

## Fonctionnalités

### Sans Compte
✅ Lire toutes les histoires publiées
✅ Naviguer dans les embranchements
✅ Voir les statistiques

### Avec Compte Utilisateur
✅ Toutes les fonctionnalités ci-dessus
✅ Créer des histoires
✅ Sauvegarder ses parties
✅ Voir ses fins débloquées
✅ Noter et commenter

### Avec Compte Admin
✅ Toutes les fonctionnalités ci-dessus
✅ Gérer toutes les histoires
✅ Suspendre/Supprimer du contenu
✅ Bannir des utilisateurs
✅ Voir les signalements
