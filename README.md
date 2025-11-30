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
