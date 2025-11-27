# NAHB - Plateforme d'Histoires Interactives

Plateforme web de création et de lecture d'histoires à embranchements multiples avec système d'administration complet.

## 🚀 Technologies

- **Frontend**: React (port 3000)
- **Backend**: Node.js/Express (port 4000)  
- **Base de données**: MongoDB Atlas (Cloud)
- **Authentification**: JWT avec lecture publique optionnelle

## 📦 Installation et Démarrage

### Prérequis
- Node.js (v16 ou supérieur)
- npm ou yarn
- Compte MongoDB Atlas (gratuit)
- Ports 3000 et 4000 disponibles
- Git

### Configuration MongoDB Atlas

1. Créez un compte sur [MongoDB Atlas](https://cloud.mongodb.com/)
2. Créez un cluster gratuit
3. Configurez l'accès réseau (ajoutez votre IP ou 0.0.0.0/0 pour le dev)
4. Créez un utilisateur de base de données
5. Récupérez votre chaîne de connexion

### Installation

```bash
# Cloner le repository
git clone <votre-repo-url>
cd NAHB_project_v2

# Installer les dépendances backend
cd backend
npm install

# Installer les dépendances frontend
cd ../frontend
npm install
```

### Configuration

Créez un fichier `backend/.env` avec vos informations MongoDB Atlas :

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/BDD?retryWrites=true&w=majority
JWT_SECRET=votre_secret_jwt_securise
PORT=4000
```

### Lancement du projet

**Backend** (dans un terminal) :
```bash
cd backend
npm start
```

**Frontend** (dans un autre terminal) :
```bash
cd frontend
npm start
```

L'application sera accessible sur:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **MongoDB**: Atlas Cloud

---

## 👥 Comptes Utilisateurs

### Compte Administrateur
- **Email**: admin@nahb.local
- **Note**: Créé automatiquement au démarrage du backend

### Créer des utilisateurs
Utilisez le script fourni :
```bash
cd NAHB_project_v2
node scripts/create_user.js
```

---

## 🗂️ Structure du Projet

```
NAHB_project_v2/
├── backend/              # API Node.js/Express
│   ├── models/          # Modèles Mongoose (Story, User, Admin, Play)
│   ├── routes/          # Routes API organisées par domaine
│   ├── services/        # Logique métier
│   ├── middleware/      # Auth et validation
│   ├── index.js         # Point d'entrée backend
│   ├── .env            # Variables d'environnement (MongoDB Atlas)
│   └── package.json
├── frontend/            # Application React
│   ├── src/
│   │   ├── components/  # Composants React
│   │   │   ├── Editor.js       # Éditeur d'histoires
│   │   │   ├── PlayView.js     # Lecteur d'histoires
│   │   │   ├── AdminPanel.js   # Panneau admin
│   │   │   ├── StoryList.js    # Liste des histoires
│   │   │   ├── Login.js        # Authentification
│   │   │   └── Register.js     # Inscription
│   │   └── App.js
│   └── package.json
├── scripts/             # Scripts utilitaires
└── db_backup/          # Backup des données MongoDB
```

---

## 🔧 Scripts Utiles

### Gestion des utilisateurs
```bash
# Créer un nouvel utilisateur
node scripts/create_user.js

# Créer un admin
node scripts/create_admin.js

# Créer un admin
node scripts/create_admin.js

# Tester la connexion Atlas
node scripts/test_atlas_connection.js
```

### Gestion des histoires
```bash
# Créer toutes les histoires de démo
node scripts/create_all_stories.js
```

---

## 🎮 Fonctionnalités

### Pour les Visiteurs (sans compte)
- 📖 Lecture d'histoires publiées
- 🔄 Navigation dans les embranchements
- 📊 Visualisation des statistiques publiques

### Pour les Utilisateurs Connectés
- ✍️ Création d'histoires interactives avec pages et choix multiples
- 📖 Lecture d'histoires publiées
- 💾 Sauvegarde automatique des parties
- 🏆 Suivi des fins débloquées
- ⭐ Notation et commentaires
- 🚩 Signalement de contenu inapproprié
- 👤 Gestion de profil

### Pour les Administrateurs
- 📊 Panneau d'administration complet
- 👁️ Visualisation de toutes les histoires
- ⏸️ Suspension/Réactivation d'histoires
- 🗑️ Suppression d'histoires
- 👥 Gestion des utilisateurs (bannissement)
- 📈 Statistiques globales
- 🚩 Gestion des signalements

---

## 📝 API Endpoints

### Authentification
- `POST /api/register` - Inscription (email, password, username)
- `POST /api/login` - Connexion (retourne JWT token)

### Histoires (authentification requise pour création/modification)
- `GET /api/stories` - Liste des histoires publiées (public)
- `GET /api/stories/:id` - Détails d'une histoire (public)
- `POST /api/stories` - Créer une nouvelle histoire (auth requise)
- `PUT /api/stories/:id` - Modifier une histoire (auteur uniquement)
- `POST /api/stories/:id/pages` - Ajouter une page
- `PUT /api/stories/:id/pages/:pageId` - Modifier une page
- `DELETE /api/stories/:id/pages/:pageId` - Supprimer une page
- `POST /api/stories/:id/pages/:pageId/choices` - Ajouter un choix
- `DELETE /api/stories/:id/pages/:pageId/choices/:choiceId` - Supprimer un choix

### Lecture (auth optionnelle - sauvegarde uniquement si connecté)
- `POST /api/play/:storyId/start` - Commencer une histoire
- `POST /api/play/:storyId/choose` - Faire un choix
- `GET /api/play/:storyId/statistics` - Statistiques d'une histoire
- `GET /api/play/:storyId/endings` - Fins débloquées (si connecté)
- `POST /api/play/:storyId/path-stats` - Statistiques de parcours

### Notations et Signalements
- `POST /api/ratings` - Ajouter/modifier une note
- `GET /api/ratings/:storyId` - Notes d'une histoire
- `POST /api/reports` - Signaler un contenu
- `GET /api/reports` - Liste des signalements (admin)

### Administration (auth admin requise)
- `GET /api/admin/stats` - Statistiques globales
- `GET /api/admin/stories` - Toutes les histoires (tous statuts)
- `POST /api/admin/suspend-story/:id` - Suspendre une histoire
- `POST /api/admin/unsuspend-story/:id` - Réactiver une histoire
- `POST /api/admin/delete-story/:id` - Supprimer une histoire
- `POST /api/admin/ban-user/:id` - Bannir/débannir un utilisateur

---

## 🐳 Déploiement avec Docker (Optionnel)

Pour le déploiement en production, Docker est disponible :

```bash
# Construire et lancer avec Docker Compose
docker-compose up -d --build

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

**Note**: Vous devrez configurer les variables d'environnement MongoDB Atlas dans le `docker-compose.yml` pour la production.

---

## 🛠️ Migration MongoDB

Le projet utilise désormais **MongoDB Atlas** (cloud) au lieu de MongoDB local.

### Documents de référence
- `MONGODB_ATLAS_SETUP.md` - Guide complet de migration vers Atlas
- `ATLAS_VERIFICATION.md` - Rapport de vérification de la migration

---

## 🛠️ Développement Local (Alternative sans MongoDB Atlas)

Si vous préférez utiliser MongoDB en local :

### Backend
```bash
cd backend
npm install
# Modifier .env pour pointer vers MongoDB local
# MONGODB_URI=mongodb://localhost:27017/nahb
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## 📜 Historique du Projet

### Fonctionnalités Développées
- ✅ Migration vers MongoDB Atlas (Cloud)
- ✅ Lecture publique sans authentification
- ✅ Sauvegarde automatique pour utilisateurs connectés
- ✅ Système de notation et commentaires
- ✅ Signalement de contenu inapproprié
- ✅ Transformation MongoDB `_id` → `id` pour compatibilité frontend
- ✅ Éditeur d'histoires avec gestion des pages et choix multiples
- ✅ Système de lecture avec navigation interactive
- ✅ Panneau d'administration complet
- ✅ Suspension/Réactivation/Suppression d'histoires
- ✅ Gestion des utilisateurs et bannissement
- ✅ Statistiques de parcours et fins débloquées

### Architecture
- 🏗️ Séparation routes/services/middleware
- 🔐 Authentification optionnelle avec JWT
- ☁️ Base de données cloud avec MongoDB Atlas
- 🎨 Système de thèmes (fantasy, ocean, etc.)

---

## 📦 Technologies Détaillées

### Backend
- **Node.js** avec Express
- **MongoDB Atlas** (Cloud Database)
- **Mongoose** (ODM)
- **JWT** pour l'authentification
- **bcrypt** pour le hashing des mots de passe
- **dotenv** pour la gestion des variables d'environnement

### Frontend
- **React** (Create React App)
- **React Router** pour la navigation
- **Fetch API** pour les requêtes HTTP

### DevOps (Optionnel)
- **Docker** & **Docker Compose** pour le déploiement

---

## 🗄️ Base de Données MongoDB Atlas

### Configuration
- **Provider**: MongoDB Atlas (Cloud)
- **Database**: BDD
- **Collections**: users, stories, plays, admins, ratings, reports

### Connexion
L'URL de connexion est configurée dans `backend/.env` :
```
mongodb+srv://username:password@cluster.mongodb.net/BDD
```

---

## 📄 License

Projet développé pour NAHB.
