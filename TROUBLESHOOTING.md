# 🔧 Troubleshooting - Backend qui redémarre en boucle

## Diagnostic

Si le backend redémarre constamment sur un autre PC, suivez ces étapes :

### 1. Vérifier les logs du backend
```bash
docker logs nahb-backend --tail 50 -f
```

### 2. Vérifier le statut des conteneurs
```bash
docker-compose ps
```

### 3. Vérifier la connexion MongoDB
```bash
docker logs nahb-mongodb --tail 20
```

## Causes communes

### ❌ Problème 1 : MongoDB pas prêt
**Symptôme** : Backend crash avec "MongoNetworkError" ou "connection refused"

**Solution** : Le healthcheck et `depends_on` ont été ajoutés. Attendez 30-40 secondes après `docker-compose up`.

### ❌ Problème 2 : Ports déjà utilisés
**Symptôme** : Erreur "port 4000 already in use"

**Solution** :
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:4000 | xargs kill -9
```

### ❌ Problème 3 : Problème de cache Docker
**Solution** :
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### ❌ Problème 4 : Erreur de code JavaScript
**Symptôme** : Logs montrent une erreur Node.js (SyntaxError, ReferenceError, etc.)

**Solution** : Vérifier que tous les fichiers sont synchronisés avec GitHub :
```bash
git pull origin main
```

## Test du health check

Une fois les conteneurs lancés, testez :
```bash
curl http://localhost:4000/api/health
```

Devrait retourner :
```json
{
  "uptime": 123.456,
  "message": "OK",
  "timestamp": 1234567890,
  "mongoStatus": "connected"
}
```

## Commandes utiles

### Restart propre
```bash
docker-compose down
docker-compose up -d
```

### Rebuild complet
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Voir tous les logs
```bash
docker-compose logs -f
```

### Entrer dans le conteneur backend
```bash
docker exec -it nahb-backend sh
```

## Configuration minimale requise

- Docker Desktop démarré
- Minimum 4GB RAM disponible
- Ports 3000, 4000, 27017 libres
- Connexion internet (pour le premier build)

## Contact

Si le problème persiste, envoyez :
1. Sortie de `docker logs nahb-backend --tail 100`
2. Sortie de `docker-compose ps`
3. Version Docker : `docker --version`
