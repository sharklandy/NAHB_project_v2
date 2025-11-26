# NAHB - Not Another Hero's Book

## 🚀 Quick Start avec Docker

### Prérequis
- Docker Desktop installé et démarré
- Ports 3000, 4000 et 27017 disponibles

### Lancement
```bash
docker-compose up --build
```

Ensuite :
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:4000/api
- **MongoDB** : localhost:27017

### Arrêt
```bash
docker-compose down
```

### Nettoyage complet (base de données incluse)
```bash
docker-compose down -v
```

---

## 📦 Architecture

```
NAHB_project_v2/
├── docker-compose.yml          # Orchestration Docker
├── backend/
│   ├── Dockerfile
│   ├── index.js                # API Express + MongoDB
│   ├── init-mongo.js           # Script d'initialisation MongoDB
│   ├── package.json
│   └── models/
│       ├── User.js             # Schéma utilisateur
│       ├── Story.js            # Schéma histoire
│       ├── Play.js             # Schéma partie jouée
│       └── Admin.js            # Schéma administrateur
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/
        └── components/
```

---

## 🗄️ Base de données MongoDB

### Configuration
- **User** : admin
- **Password** : admin123
- **Database** : nahb

### Collections
- `users` : Utilisateurs (auteurs/lecteurs)
- `stories` : Histoires interactives
- `plays` : Parties jouées
- `admins` : Liste des administrateurs

### Connexion directe
```bash
mongosh mongodb://admin:admin123@localhost:27017/nahb?authSource=admin
```

---

## 🎯 Fonctionnalités implémentées

### ✅ Authentification
- Inscription avec email/mot de passe
- Connexion/déconnexion
- JWT pour les sessions

### ✅ Gestion des histoires (Auteur)
- Créer/modifier/supprimer ses histoires
- Statuts : brouillon, publié, suspendu
- Gestion des pages/scènes avec choix multiples
- Définir page de départ et fins

### ✅ Lecture d'histoires (Lecteur)
- Liste des histoires publiées
- Recherche par titre/description/tags
- Navigation interactive avec choix
- Enregistrement automatique des parties terminées

### ✅ Administration
- Voir les statistiques globales
- Bannir/débannir des utilisateurs
- Suspendre des histoires
- Détails par histoire (nombre de parties jouées)

---

## 🔧 Développement local (sans Docker)

### Backend
```bash
cd backend
npm install
export MONGODB_URI="mongodb://admin:admin123@localhost:27017/nahb?authSource=admin"
export JWT_SECRET="dev_secret_change_me"
npm start
```

### Frontend
```bash
cd frontend
npm install
export REACT_APP_API="http://localhost:4000/api"
npm start
```

---

## 📝 API Endpoints

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Stories
- `GET /api/stories?published=1&q=search` - Liste des histoires
- `POST /api/stories` - Créer une histoire
- `PUT /api/stories/:id` - Modifier
- `DELETE /api/stories/:id` - Supprimer

### Pages & Choices
- `POST /api/stories/:id/pages` - Ajouter une page
- `PUT /api/stories/:id/pages/:pageId` - Modifier une page
- `DELETE /api/stories/:id/pages/:pageId` - Supprimer une page
- `POST /api/stories/:id/pages/:pageId/choices` - Ajouter un choix
- `DELETE /api/stories/:id/pages/:pageId/choices/:choiceId` - Supprimer un choix

### Play
- `POST /api/play/:storyId/start` - Commencer une histoire
- `POST /api/play/:storyId/choose` - Faire un choix

### Admin
- `GET /api/admin/stats` - Statistiques globales
- `POST /api/admin/suspend-story/:id` - Suspendre une histoire
- `POST /api/admin/ban-user/:id` - Bannir/débannir un utilisateur

---

## 🧪 Compte admin par défaut
- **Email** : admin@nahb.local
- **Mot de passe** : Créer le compte via `/api/auth/register`

---

## 📊 Présentation
- **Date** : Vendredi
- **Durée** : 15-20 minutes + 5min QA + 5min debrief
- **Rendu** : Dimanche 30/11 23h55 sur César

---

## 🛠️ Technologies utilisées
- **Backend** : Node.js, Express, MongoDB, Mongoose, JWT, bcrypt
- **Frontend** : React
- **DevOps** : Docker, Docker Compose
- **Base de données** : MongoDB 7.0

---

## 📦 Rendu final
```bash
# Créer l'archive pour le rendu
tar -czf NAHB_project.tar.gz NAHB_project_v2/
```

Ou sur Windows (PowerShell) :
```powershell
Compress-Archive -Path NAHB_project_v2 -DestinationPath NAHB_project.zip
```
