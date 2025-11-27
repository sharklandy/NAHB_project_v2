# Guide de Migration vers MongoDB Atlas

## Étape 1 : Obtenir votre chaîne de connexion MongoDB Atlas

1. Connectez-vous à [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sélectionnez votre cluster
3. Cliquez sur **"Connect"**
4. Choisissez **"Connect your application"**
5. Sélectionnez **Driver: Node.js** et **Version: 5.5 or later**
6. Copiez la chaîne de connexion qui ressemble à :
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```

## Étape 2 : Configurer les variables d'environnement

1. Ouvrez le fichier `backend/.env` qui a été créé
2. Remplacez la valeur de `MONGODB_URI` avec votre chaîne de connexion Atlas :
   ```env
   MONGODB_URI=mongodb+srv://votre_username:votre_password@votre_cluster.mongodb.net/nahb?retryWrites=true&w=majority
   ```
   
   **Important :** 
   - Remplacez `<username>` par votre nom d'utilisateur MongoDB Atlas
   - Remplacez `<password>` par votre mot de passe (URL encodé si nécessaire)
   - Remplacez `<cluster>` par le nom de votre cluster
   - Assurez-vous que `/nahb` est présent après `.mongodb.net/` pour spécifier la base de données

3. Changez également le `JWT_SECRET` par une valeur sécurisée :
   ```env
   JWT_SECRET=votre_secret_jwt_tres_securise_123456
   ```

## Étape 3 : Autoriser l'accès réseau sur Atlas

1. Dans MongoDB Atlas, allez dans **Network Access** (dans le menu de gauche)
2. Cliquez sur **"Add IP Address"**
3. Pour le développement local, cliquez sur **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ Pour la production, ajoutez uniquement les IPs de votre serveur de déploiement
4. Cliquez sur **"Confirm"**

## Étape 4 : Installer les dépendances

Installez le package `dotenv` dans le backend :

```powershell
cd backend
npm install dotenv
cd ..
```

## Étape 5 : Tester la connexion

Lancez le backend en mode local (sans Docker) :

```powershell
cd backend
npm start
```

Vous devriez voir :
```
✅ Connected to MongoDB
✅ Default admin created (ou message indiquant que l'admin existe déjà)
Server listening on port 4000
```

## Étape 6 : Mise à jour pour Docker (optionnel)

Si vous utilisez Docker en production, mettez à jour `docker-compose.yml` :

1. Commentez ou supprimez le service `mongodb` (car vous utilisez Atlas maintenant)
2. Mettez à jour les variables d'environnement du backend

Exemple de `docker-compose.yml` modifié :

```yaml
version: "3.8"
services:
  backend:
    build: ./backend
    container_name: nahb-backend
    ports:
      - "4000:4000"
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - MONGODB_URI=${MONGODB_URI}
      - PORT=4000
    restart: unless-stopped

  frontend:
    build: ./frontend
    container_name: nahb-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      - REACT_APP_API=${REACT_APP_API}
    restart: always
```

## Étape 7 : Vérifier vos données

Vos données sont déjà importées sur Atlas. Pour vérifier :

1. Allez sur MongoDB Atlas
2. Cliquez sur **"Browse Collections"**
3. Sélectionnez la base de données `nahb`
4. Vérifiez que vos collections sont présentes (users, stories, plays, ratings, reports, admins)

## Dépannage

### Erreur de connexion
- Vérifiez que votre IP est autorisée dans Network Access
- Vérifiez que le mot de passe ne contient pas de caractères spéciaux non encodés
- Si le mot de passe contient des caractères spéciaux, encodez-les (ex: @ = %40)

### Erreur d'authentification
- Vérifiez que l'utilisateur a les permissions sur la base de données `nahb`
- Allez dans Database Access et vérifiez les permissions de l'utilisateur

### Base de données vide
- Vérifiez que vous avez bien ajouté `/nahb` à la fin de l'URL de connexion
- Vérifiez que les données ont été importées correctement dans Atlas

## Pour le déploiement en production

1. Utilisez des variables d'environnement sécurisées sur votre plateforme de déploiement (Heroku, Vercel, AWS, etc.)
2. N'exposez jamais le fichier `.env` publiquement
3. Utilisez un `JWT_SECRET` fort et unique
4. Limitez les accès réseau sur Atlas aux IPs de votre serveur de production uniquement

## Structure des fichiers de configuration

```
NAHB_project_v2/
├── .env (variables pour le frontend en production)
├── .env.example (exemple de configuration)
├── backend/
│   └── .env (variables pour le backend)
└── ...
```
