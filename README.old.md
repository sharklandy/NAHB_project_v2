Projet NAHB - Not Another Hero's Book
====================================

Contenu de l'archive:
- backend/ : Express backend using lowdb (JSON file) as storage
- frontend/: React demo UI (create-react-app style minimal)

Instructions rapides:
1. Backend:
   cd backend
   npm install
   node index.js
   -> API sera disponible sur http://localhost:4000/api

2. Frontend:
   cd frontend
   npm install
   npm start
   -> UI sur http://localhost:3000

Livrables demandés:
- Code source complet
- Instructions pour lancer localement (fournies)
- Démo : vous pouvez générer du contenu via l'API (ex: créer une story, pages, choix) ou modifier les fichiers db.json dans backend pour des données de démo.

Rendu César:
- Archive ZIP fournie: NAHB_project.zip
- Date limite: dimanche 30/11 23:55 (votre échéance)

Note:
- Ce projet est une base de travail, conçue pour être présentée et ensuite étendue (tests, docker, déploiement, UI plus riche).


Additional features added:
- Dockerfiles for backend and frontend, and docker-compose.yml for easy local deployment.
- Enhanced Editor UI to create/edit pages and choices from React.
- Script `scripts/populate_demo_more.js` to add multiple demo stories (IA-style templates) into db.json.

Docker quick start:
1. docker-compose up --build
This will expose frontend on http://localhost:3000 and backend on http://localhost:4000
