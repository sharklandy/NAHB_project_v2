# NAHB - Not Another Hero's Book

Plateforme d'histoires interactives à choix multiples.

## Prérequis

- Node.js (v14+)

## Installation rapide

### 1. Configuration de la base de données

**Pour le correcteur/professeur** : Le fichier de configuration est déjà prêt !

Renommez simplement le fichier `backend/.env.example` en `backend/.env` :

```powershell
# Depuis la racine du projet
Copy-Item backend\.env.example backend\.env
```

La base de données MongoDB Atlas est déjà configurée et accessible.

### 2. Installer les dépendances

```powershell
# Backend
cd backend
npm install

# Frontend
cd ..\frontend
npm install
cd ..
```

## Démarrage

Exécuter ces deux commandes dans PowerShell depuis la racine du projet :

```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; node index.js"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"
```

Le backend démarre sur `http://localhost:4000`  
Le frontend démarre sur `http://localhost:3000`

## Compte de test

Pour tester l'application, vous pouvez :
- Créer un nouveau compte via l'interface d'inscription
- Ou utiliser les comptes existants dans la base de données

identifiant : admin@nahb.local
psswd : admin123

on a converti le draw.io avec claudeadded
┌─────────────────────────────────────────────────────────────────┐
│                         COLLECTIONS                              │
└─────────────────────────────────────────────────────────────────┘

┌───────────── USERS ─────────────┐
│ _id: ObjectId                   │
│ username: String (required)     │
│ email: String (unique, required)│
│ password: String (hashed)       │
│ banned: Boolean (default: false)│
│ bannedAt: Date                  │
│ lastLogin: Date                 │
│ loginCount: Number              │
│ createdAt: Date                 │
└─────────────────────────────────┘
           │
           │ 1:N (authorId)
           ↓
┌───────────── STORIES ───────────┐
│ _id: ObjectId                   │
│ title: String (required)        │
│ description: String             │
│ tags: [String]                  │
│ authorId: String → User._id     │
│ status: Enum ['draft',          │
│         'published','suspended']│
│ startPageId: String             │
│ theme: String                   │
│ createdAt: Date                 │
│                                 │
│ pages: [{                       │──┐
│   pageId: String                │  │
│   content: String               │  │ EMBEDDED
│   imageUrl: String              │  │ DOCUMENTS
│   isEnd: Boolean                │  │
│   endLabel: String              │  │
│   choices: [{                   │  │
│     text: String                │  │
│     to: String (pageId)         │  │
│   }]                            │  │
│ }]                              │──┘
└─────────────────────────────────┘
           │
           │ 1:N
           ↓
┌───────────── PLAYS ─────────────┐
│ _id: ObjectId                   │
│ storyId: ObjectId → Story._id   │
│ userId: String → User._id       │
│ endPageId: String               │
│ path: [String] (pageIds)        │
│ currentPageId: String           │
│ isCompleted: Boolean            │
│ isPreview: Boolean              │
│ isAbandoned: Boolean            │
│ createdAt: Date                 │
│ completedAt: Date               │
│                                 │
│ INDEX: (storyId, endPageId)     │
│ INDEX: (userId, storyId)        │
└─────────────────────────────────┘

┌───────────── RATINGS ───────────┐
│ _id: ObjectId                   │
│ storyId: ObjectId → Story._id   │
│ userId: String → User._id       │
│ rating: Number (1-5)            │
│ comment: String                 │
│ createdAt: Date                 │
│ updatedAt: Date                 │
│                                 │
│ UNIQUE INDEX: (storyId, userId) │
└─────────────────────────────────┘

┌───────────── REPORTS ───────────┐
│ _id: ObjectId                   │
│ storyId: ObjectId → Story._id   │
│ userId: String → User._id       │
│ reason: Enum ['inappropriate',  │
│         'offensive','spam',     │
│         'copyright','other']    │
│ description: String             │
│ status: Enum ['pending',        │
│         'reviewed','resolved',  │
│         'dismissed']            │
│ createdAt: Date                 │
│ reviewedAt: Date                │
│ reviewedBy: String → User._id   │
│                                 │
│ INDEX: (storyId, status)        │
│ INDEX: (status, createdAt)      │
└─────────────────────────────────┘

┌───────────── ADMINS ────────────┐
│ _id: ObjectId                   │
│ email: String (unique)          │
│ createdAt: Date                 │
└─────────────────────────────────┘