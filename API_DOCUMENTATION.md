# Documentation API - Endpoints Auteur

## 🔐 Authentification

Tous les endpoints auteur nécessitent un token JWT dans le header :
```
Authorization: Bearer <token>
```

---

## 📚 Endpoints

### 1. Liste des Histoires de l'Auteur

**GET** `/api/author/stories`

Récupère toutes les histoires de l'auteur connecté avec leurs statistiques de base.

#### Headers
```
Authorization: Bearer <token>
```

#### Réponse (200 OK)
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "title": "Mon Histoire Fantastique",
    "description": "Une aventure épique",
    "theme": "fantasy",
    "status": "published",
    "authorId": "user123",
    "pages": [...],
    "startPageId": "page1",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "stats": {
      "totalPlays": 150,
      "completedPlays": 120,
      "abandonedPlays": 30,
      "inProgressPlays": 0,
      "completionRate": 80.00,
      "avgRating": 4.5,
      "totalRatings": 45,
      "endDistribution": [
        {
          "endPageId": "end1",
          "endLabel": "Fin Héroïque",
          "count": 54,
          "percentage": 45.00
        },
        {
          "endPageId": "end2",
          "endLabel": "Fin Tragique",
          "count": 36,
          "percentage": 30.00
        }
      ]
    }
  }
]
```

#### Erreurs
- `401` : Non authentifié
- `500` : Erreur serveur

---

### 2. Statistiques d'une Histoire

**GET** `/api/author/stories/:storyId/stats`

Récupère les statistiques de base d'une histoire spécifique.

#### Headers
```
Authorization: Bearer <token>
```

#### Paramètres URL
- `storyId` : ID de l'histoire (MongoDB ObjectId)

#### Réponse (200 OK)
```json
{
  "totalPlays": 150,
  "completedPlays": 120,
  "abandonedPlays": 30,
  "inProgressPlays": 0,
  "completionRate": 80.00,
  "avgRating": 4.5,
  "totalRatings": 45,
  "endDistribution": [
    {
      "endPageId": "end1",
      "endLabel": "Fin Héroïque",
      "count": 54,
      "percentage": 45.00
    }
  ]
}
```

#### Erreurs
- `401` : Non authentifié
- `404` : Histoire non trouvée
- `500` : Erreur serveur

---

### 3. Statistiques Avancées

**GET** `/api/author/stories/:storyId/advanced-stats`

Récupère des statistiques détaillées d'une histoire. L'utilisateur doit être l'auteur de l'histoire.

#### Headers
```
Authorization: Bearer <token>
```

#### Paramètres URL
- `storyId` : ID de l'histoire (MongoDB ObjectId)

#### Réponse (200 OK)
```json
{
  "totalPlays": 150,
  "completedPlays": 120,
  "abandonedPlays": 30,
  "inProgressPlays": 0,
  "completionRate": 80.00,
  "avgRating": 4.5,
  "totalRatings": 45,
  "endDistribution": [
    {
      "endPageId": "end1",
      "endLabel": "Fin Héroïque",
      "count": 54,
      "percentage": 45.00
    }
  ],
  "mostVisitedPages": [
    {
      "pageId": "page3",
      "content": "Vous arrivez devant un château mystérieux...",
      "visits": 145
    },
    {
      "pageId": "page7",
      "content": "Le dragon vous fait face, ses yeux brillent...",
      "visits": 98
    }
  ],
  "avgPathLength": 12.5,
  "avgDuration": 15.3,
  "totalUniqueReaders": 85
}
```

#### Champs Spécifiques
- `mostVisitedPages` : Top 10 des pages les plus visitées
  - `pageId` : ID de la page
  - `content` : Extrait du contenu (100 premiers caractères)
  - `visits` : Nombre de visites
- `avgPathLength` : Nombre moyen de pages parcourues
- `avgDuration` : Durée moyenne en minutes pour compléter l'histoire
- `totalUniqueReaders` : Nombre de lecteurs différents

#### Erreurs
- `401` : Non authentifié
- `403` : Non autorisé (pas l'auteur)
- `404` : Histoire non trouvée
- `500` : Erreur serveur

---

## 🎮 Endpoint Play (Mode Preview)

### Démarrer une Histoire en Mode Preview

**POST** `/api/play/:storyId/start?preview=true`

Démarre une histoire en mode preview. Les statistiques ne seront pas enregistrées.

#### Headers
```
Authorization: Bearer <token>
```

#### Paramètres Query
- `preview` : `true` pour activer le mode preview

#### Réponse (200 OK)
```json
{
  "page": {
    "pageId": "start",
    "content": "Votre aventure commence...",
    "imageUrl": "",
    "isEnd": false,
    "endLabel": "",
    "choices": [
      {
        "_id": "choice1",
        "text": "Entrer dans la forêt",
        "to": "page2"
      }
    ]
  },
  "savedGame": false,
  "playId": "507f1f77bcf86cd799439012",
  "isPreview": true
}
```

#### Notes
- En mode preview, `isPreview: true` est retourné
- Les parties en mode preview ne sont pas comptabilisées dans les stats
- L'auteur peut tester même si l'histoire est en brouillon

---

## 📊 Modèles de Données

### Story
```typescript
interface Story {
  _id: ObjectId;
  title: string;
  description: string;
  tags: string[];
  authorId: string;
  status: 'draft' | 'published' | 'suspended';
  pages: Page[];
  startPageId: string;
  theme: string;
  createdAt: Date;
}
```

### Page
```typescript
interface Page {
  pageId: string;
  content: string;
  imageUrl: string;  // ✨ NOUVEAU
  isEnd: boolean;
  endLabel: string;
  choices: Choice[];
}
```

### Play
```typescript
interface Play {
  _id: ObjectId;
  storyId: ObjectId;
  userId: string;
  endPageId: string | null;
  path: string[];
  currentPageId: string;
  isCompleted: boolean;
  isPreview: boolean;     // ✨ NOUVEAU
  isAbandoned: boolean;   // ✨ NOUVEAU
  createdAt: Date;
  completedAt: Date | null;
}
```

---

## 🔒 Permissions

| Endpoint | Authentification | Autorisation |
|----------|------------------|--------------|
| `GET /api/author/stories` | ✅ Requise | Utilisateur connecté |
| `GET /api/author/stories/:id/stats` | ✅ Requise | Utilisateur connecté |
| `GET /api/author/stories/:id/advanced-stats` | ✅ Requise | Auteur de l'histoire uniquement |
| `POST /api/play/:id/start?preview=true` | ✅ Requise | Utilisateur connecté |

---

## 🧪 Exemples de Requêtes

### cURL

```bash
# Liste des histoires de l'auteur
curl -X GET http://localhost:4000/api/author/stories \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Stats avancées
curl -X GET http://localhost:4000/api/author/stories/507f1f77bcf86cd799439011/advanced-stats \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Démarrer en mode preview
curl -X POST http://localhost:4000/api/play/507f1f77bcf86cd799439011/start?preview=true \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### JavaScript (fetch)

```javascript
// Liste des histoires
const response = await fetch('http://localhost:4000/api/author/stories', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const stories = await response.json();

// Stats avancées
const statsResponse = await fetch(
  `http://localhost:4000/api/author/stories/${storyId}/advanced-stats`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
const stats = await statsResponse.json();

// Mode preview
const previewResponse = await fetch(
  `http://localhost:4000/api/play/${storyId}/start?preview=true`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
const previewData = await previewResponse.json();
```

---

## 📈 Codes de Statut HTTP

| Code | Signification | Quand ? |
|------|---------------|---------|
| 200 | OK | Succès |
| 401 | Unauthorized | Token manquant ou invalide |
| 403 | Forbidden | Pas les permissions nécessaires |
| 404 | Not Found | Ressource introuvable |
| 500 | Internal Server Error | Erreur serveur |

---

**Version API** : 2.0  
**Dernière mise à jour** : Novembre 2025
