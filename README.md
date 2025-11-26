# NAHB - Plateforme d'Histoires Interactives

Plateforme web de création et de lecture d'histoires à embranchements multiples avec système d'administration complet.

## 🚀 Technologies

- **Frontend**: React (port 3000)
- **Backend**: Node.js/Express (port 4000)  
- **Base de données**: MongoDB
- **Containerisation**: Docker Compose

## 📦 Installation et Démarrage

### Prérequis
- Docker Desktop installé et démarré
- Ports 3000, 4000 et 27017 disponibles
- Git

### Lancement du projet

```bash
# Cloner le repository
git clone <votre-repo-url>
cd NAHB_project_v2

# Démarrer les conteneurs
docker-compose up -d

# Rebuild complet (si nécessaire)
docker-compose up -d --build
```

L'application sera accessible sur:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **MongoDB**: localhost:27017

### Arrêt
```bash
docker-compose down
```

### Nettoyage complet (base de données incluse)
```bash
docker-compose down -v
```

---

## 👥 Comptes de Démonstration

### Compte Administrateur
- **Email**: admin@nahb.local
- **Mot de passe**: admin123

### Compte Utilisateur Démo (avec histoire complète)
- **Email**: pierre@nahb.local
- **Mot de passe**: pierre123
- **Histoire**: "La Quête du Dragon Oublié" (26 pages, 4 victoires, 4 game overs)

---

## 🗂️ Structure du Projet

```
NAHB_project_v2/
├── backend/              # API Node.js/Express
│   ├── models/          # Modèles Mongoose (Story, User, Admin, Play)
│   ├── index.js         # Point d'entrée backend avec tous les endpoints
│   ├── init-mongo.js    # Script d'initialisation MongoDB
│   ├── package.json
│   └── Dockerfile
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
│   ├── package.json
│   └── Dockerfile
├── scripts/             # Scripts utilitaires MongoDB
└── docker-compose.yml   # Configuration Docker
```

---

## 🔧 Commandes Utiles

### Docker
```bash
# Arrêter les conteneurs
docker-compose down

# Voir les logs en temps réel
docker logs -f nahb-frontend
docker logs -f nahb-backend

# Restart d'un service spécifique
docker-compose restart backend
docker-compose restart frontend
```

### Base de données
```bash
# Se connecter à MongoDB
docker exec -it nahb-mongo mongosh nahb_stories

# Exécuter un script d'initialisation
docker exec -i nahb-mongo mongosh nahb_stories < scripts/create_admin.js
```

---

## 🎮 Fonctionnalités

### Pour les Utilisateurs
- ✍️ Création d'histoires interactives avec pages et choix multiples
- 📖 Lecture d'histoires publiées
- 🔄 Navigation dans les embranchements
- 👤 Gestion de profil
- 💾 Enregistrement automatique des parties

### Pour les Administrateurs
- 📊 Panneau d'administration complet
- 👁️ Visualisation de toutes les histoires
- ⏸️ Suspension/Réactivation d'histoires
- 🗑️ Suppression d'histoires
- 👥 Gestion des utilisateurs (bannissement)
- 📈 Statistiques globales

---

## 📝 API Endpoints

### Authentification
- `POST /api/register` - Inscription (email, password, username)
- `POST /api/login` - Connexion (retourne JWT token)

### Histoires (authentification requise)
- `GET /api/stories` - Liste des histoires publiées
- `GET /api/stories/:id` - Détails d'une histoire
- `POST /api/stories` - Créer une nouvelle histoire
- `PUT /api/stories/:id` - Modifier une histoire (auteur uniquement)
- `POST /api/stories/:id/pages` - Ajouter une page
- `PUT /api/stories/:id/pages/:pageId` - Modifier une page
- `DELETE /api/stories/:id/pages/:pageId` - Supprimer une page
- `POST /api/stories/:id/pages/:pageId/choices` - Ajouter un choix
- `DELETE /api/stories/:id/pages/:pageId/choices/:choiceId` - Supprimer un choix

### Lecture
- `POST /api/play/:storyId/start` - Commencer une histoire
- `POST /api/play/:storyId/choose` - Faire un choix

### Administration (auth admin requise)
- `GET /api/admin/stats` - Statistiques globales
- `GET /api/admin/stories` - Toutes les histoires (tous statuts)
- `POST /api/admin/suspend-story/:id` - Suspendre une histoire
- `POST /api/admin/unsuspend-story/:id` - Réactiver une histoire
- `POST /api/admin/delete-story/:id` - Supprimer une histoire
- `POST /api/admin/ban-user/:id` - Bannir/débannir un utilisateur

---

## 🛠️ Développement Local (sans Docker)

### Backend
```bash
cd backend
npm install
export MONGODB_URI="mongodb://localhost:27017/nahb_stories"
export JWT_SECRET="votre_secret_jwt"
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
- ✅ Transformation MongoDB `_id` → `id` pour compatibilité frontend
- ✅ Éditeur d'histoires avec gestion des pages et choix multiples
- ✅ Système de lecture avec navigation interactive
- ✅ Panneau d'administration complet
- ✅ Suspension/Réactivation/Suppression d'histoires
- ✅ Contournement des blocages DELETE (extension navigateur) via POST
- ✅ Création d'histoires de démonstration complexes
- ✅ Gestion des utilisateurs et bannissement

### Corrections Techniques
- 🔧 Gestion unifiée des champs `id` vs `_id` MongoDB
- 🔧 Correction des références d'ID dans tous les composants
- 🔧 Suppression des caractères parasites dans l'interface
- 🔧 Création de comptes demo avec histoires complètes
- 🔧 Rebuild Docker pour intégration des nouvelles fonctionnalités

---

## 📦 Technologies Détaillées

### Backend
- **Node.js** avec Express
- **MongoDB** avec Mongoose (ODM)
- **JWT** pour l'authentification
- **bcrypt** pour le hashing des mots de passe

### Frontend
- **React** (Create React App)
- **React Router** pour la navigation
- **Fetch API** pour les requêtes HTTP

### DevOps
- **Docker** & **Docker Compose**
- Multi-stage builds pour optimisation

---

## 🗄️ Base de Données MongoDB

### Configuration
- **Database**: nahb_stories
- **Collections**: users, stories, plays, admins

### Connexion Directe
```bash
mongosh mongodb://localhost:27017/nahb_stories
```

---

## 📄 License

Projet développé pour NAHB.
