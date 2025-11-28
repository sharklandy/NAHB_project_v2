# NAHB - Not Another Hero's Book

Plateforme d'histoires interactives à choix multiples.

## Prérequis

- Node.js (v14+)
- Un compte MongoDB Atlas configuré

## Configuration

1. Créer un fichier `.env` dans le dossier `backend/` :
```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
PORT=4000
```


2. Installer les dépendances :
```bash
cd backend
npm install

cd ../frontend
npm install
```

## Démarrage

Exécuter ces deux commandes dans PowerShell depuis la racine du projet :

```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; node index.js"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"
```

Le backend démarre sur `http://localhost:4000`  
Le frontend démarre sur `http://localhost:3000`
