# 🤝 Guide pour les Nouveaux Collaborateurs

Bienvenue sur le projet NAHB ! Voici comment configurer votre environnement de développement.

## 📋 Prérequis

- Node.js (v16+)
- npm
- Git
- Un éditeur de code (VS Code recommandé)

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/sharklandy/NAHB_project_v2.git
cd NAHB_project_v2
```

### 2. Configuration de la Base de Données

⚠️ **IMPORTANT** : Le projet utilise MongoDB Atlas (cloud). Vous devez configurer l'accès.

#### Créer le fichier backend/.env

Créez un fichier `backend/.env` avec le contenu suivant :

```env
MONGODB_URI=DEMANDEZ_L_URL_AU_PROPRIETAIRE
JWT_SECRET=DEMANDEZ_LE_SECRET_AU_PROPRIETAIRE
PORT=4000
```

**Demandez au propriétaire du projet** :
- L'URL de connexion MongoDB Atlas
- Le JWT_SECRET (doit être identique pour tous)

### 3. Installer les dépendances

```bash
# Backend
cd backend
npm install

# Frontend (nouveau terminal)
cd ../frontend
npm install
```

### 4. Lancer le projet

**Terminal 1 - Backend :**
```bash
cd backend
npm start
```

✅ Backend disponible sur http://localhost:4000

**Terminal 2 - Frontend :**
```bash
cd frontend
npm start
```

✅ Frontend disponible sur http://localhost:3000

## 📁 Structure du Projet

```
NAHB_project_v2/
├── backend/              # API Node.js/Express
│   ├── .env             # À CRÉER (jamais sur Git!)
│   ├── models/          # Modèles MongoDB
│   ├── routes/          # Routes API
│   ├── services/        # Logique métier
│   └── middleware/      # Auth et validation
├── frontend/            # Application React
│   └── src/
│       └── components/  # Composants React
└── scripts/             # Scripts utilitaires
```

## 🔐 Sécurité

**JAMAIS** commiter :
- Le fichier `backend/.env`
- Les identifiants MongoDB
- Le JWT_SECRET

Ces fichiers sont déjà dans `.gitignore`.

## 🐛 Problèmes Courants

### "Ce site est inaccessible"
- Vérifiez que les deux serveurs (backend + frontend) tournent
- Vérifiez les ports : `netstat -ano | findstr "3000 4000"`

### "Cannot connect to MongoDB"
- Vérifiez votre fichier `backend/.env`
- Vérifiez que votre IP est autorisée sur MongoDB Atlas
  - Allez sur MongoDB Atlas → Network Access
  - Ajoutez votre IP ou 0.0.0.0/0 pour le dev

### "401 Unauthorized"
- Vérifiez que le JWT_SECRET est le même que celui du propriétaire
- Pour lire les histoires, pas besoin de connexion
- Pour créer/modifier, vous devez créer un compte

## 👥 Créer un Compte Utilisateur

```bash
node scripts/create_user.js
```

Le compte admin existe déjà : `admin@nahb.local`

## 📚 Documentation Complète

- Lisez `README.md` pour toutes les fonctionnalités
- Consultez `DEMARRAGE_RAPIDE.md` pour un guide rapide
- `MONGODB_ATLAS_SETUP.md` pour les détails sur Atlas

## 🆘 Besoin d'Aide ?

Contactez le propriétaire du projet pour :
- Les identifiants MongoDB Atlas
- Le JWT_SECRET
- Toute question technique

Bon développement ! 🚀
