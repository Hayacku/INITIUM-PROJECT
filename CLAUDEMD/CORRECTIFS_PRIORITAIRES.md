# 🔧 CORRECTIFS PRIORITAIRES - INITIUM

Ce document liste les corrections de code à appliquer **après** avoir suivi la `CHECKLIST_DEMARRAGE.md`.

---

## 🎯 Phase 2 - STABILISATION (À faire après le premier lancement réussi)

### ✅ Correctif #1 : Validation XP (Problème #11)

**Fichier** : `app/frontend/src/contexts/AppContext.js`  
**Ligne** : 109  
**Gravité** : 🔴 MAJEURE

**Code actuel** :
```javascript
const addXP = async (amount, source = 'general') => {
  if (!user) return;

  const newXP = user.xp + amount;
  // ...
};
```

**Code corrigé** :
```javascript
const addXP = async (amount, source = 'general') => {
  if (!user) return;
  
  // ✅ Validation ajoutée
  if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
    console.error('Invalid XP amount:', amount);
    return;
  }
  
  const newXP = user.xp + amount;
  let newLevel = user.level;
  let xpToNextLevel = user.xpToNextLevel;

  if (newXP >= xpToNextLevel) {
    newLevel += 1;
    xpToNextLevel = Math.floor(xpToNextLevel * 1.5);
  }

  const updatedUser = {
    ...user,
    xp: newXP,
    level: newLevel,
    xpToNextLevel
  };

  await db.users.update(user.id, updatedUser);
  setUser(updatedUser);

  // Analytics
  const today = new Date();
  today.setHours(0, 0, 0, 0); // ✅ Normalisation date
  
  const existingAnalytics = await db.analytics
    .where('date')
    .between(today, new Date(today.getTime() + 86400000))
    .first();

  if (existingAnalytics) {
    await db.analytics.update(existingAnalytics.id, {
      xpEarned: existingAnalytics.xpEarned + amount
    });
  } else {
    await db.analytics.add({
      id: `analytics-${Date.now()}`,
      date: today,
      xpEarned: amount,
      habitsCompleted: 0,
      questsCompleted: 0
    });
  }
};
```

---

### ✅ Correctif #2 : Layout marge responsive (Problème #10)

**Fichier** : `app/frontend/src/components/Layout.js`  
**Ligne** : 237-241  
**Gravité** : 🔴 MAJEURE

**Code actuel** :
```javascript
<main
  className={`flex-1 transition-all duration-300 min-h-screen flex flex-col mb-24 lg:mb-0
    lg:ml-[${sidebarOpen ? '256px' : '80px'}]
  `}
  style={{ marginLeft: window.innerWidth >= 1024 ? (sidebarOpen ? '16rem' : '5rem') : '0' }}
  data-testid="main-content"
>
```

**Code corrigé** :
```javascript
<main
  className={`flex-1 transition-all duration-300 min-h-screen flex flex-col mb-28 lg:mb-0 pb-safe
    ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
  `}
  data-testid="main-content"
>
```

**Explication** : Utilise Tailwind classes au lieu de style inline pour meilleure réactivité.

---

### ✅ Correctif #3 : Firebase Analytics conditionnel (Problème #8)

**Fichier** : `app/frontend/src/firebase.js`  
**Ligne** : 11-30  
**Gravité** : 🔴 MAJEURE

**Code actuel** :
```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  // ...
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export { app, analytics };
```

**Code corrigé** :
```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// ✅ Vérification avant initialisation
let app = null;
let analytics = null;
let auth = null;
let googleProvider = null;
let db = null;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
  }
} else {
  console.warn('⚠️ Firebase non configuré - Fonctionnalités OAuth Google désactivées');
}

export { app, analytics, auth, googleProvider, db };
```

---

### ✅ Correctif #4 : OAuth callback dependencies (Problème #7)

**Fichier** : `app/frontend/src/pages/Auth.js`  
**Ligne** : 33-45  
**Gravité** : 🔴 MAJEURE

**Code actuel** :
```javascript
useEffect(() => {
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');

  if (accessToken && refreshToken) {
    loginWithTokens(accessToken, refreshToken).then((result) => {
      if (result.success) {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    });
  }
}, [searchParams]);
```

**Code corrigé** :
```javascript
useEffect(() => {
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');

  if (accessToken && refreshToken) {
    loginWithTokens(accessToken, refreshToken).then((result) => {
      if (result.success) {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    });
  }
}, [searchParams, loginWithTokens, navigate, location.state]); // ✅ Toutes les dépendances
```

---

### ✅ Correctif #5 : Axios interceptor - Protection boucle infinie (Problème #9)

**Fichier** : `app/frontend/src/contexts/AuthContext.js`  
**Ligne** : 44-75  
**Gravité** : 🔴 MAJEURE

**Code actuel** :
```javascript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {
            refresh_token: refreshToken
          });

          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);
          setTokens(prev => ({ ...prev, access_token }));

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

**Code corrigé** :
```javascript
// ✅ Flag global pour éviter boucle infinie
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // ✅ Enqueue request si refresh en cours
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {
            refresh_token: refreshToken
          });

          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);
          setTokens(prev => ({ ...prev, access_token }));

          processQueue(null, access_token);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

---

## 🎯 Phase 3 - SÉCURITÉ PRÉ-PRODUCTION

### ✅ Correctif #6 : CORS strict (Problème #15)

**Fichier** : `app/backend/server.py`  
**Ligne** : 36-38, 105-111  
**Gravité** : 🟡 MINEURE (dev), ⚠️ CRITIQUE (prod)

**Code actuel** :
```python
origins = os.environ.get('CORS_ORIGINS', '*').split(',')
logger.info(f"CORS Allowed Origins: {origins}")
```

**Code corrigé** :
```python
# ✅ Protection production
origins_str = os.environ.get('CORS_ORIGINS', '')
env = os.environ.get('ENV', 'development')

if env == 'production' and (not origins_str or origins_str == '*'):
    raise ValueError(
        "CORS_ORIGINS must be explicitly set in production! "
        "Wildcard (*) is not allowed."
    )

if not origins_str:
    # Dev default
    origins = ['http://localhost:3000']
    logger.warning("⚠️ CORS_ORIGINS not set, using dev default: localhost:3000")
elif origins_str == '*':
    origins = ['*']
    logger.warning("⚠️ CORS set to wildcard (*) - OK for dev only!")
else:
    origins = [o.strip() for o in origins_str.split(',')]
    
logger.info(f"CORS Allowed Origins: {origins} (ENV: {env})")
```

---

### ✅ Correctif #7 : Rate Limiting (Problème #16)

**Fichier** : `app/backend/auth_routes.py`  
**Gravité** : 🟡 MINEURE (dev), 🔴 MAJEURE (prod)

**Installation** :
```bash
cd app/backend
pip install slowapi
```

**Ajouter au début de `auth_routes.py`** :
```python
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request

limiter = Limiter(key_func=get_remote_address)
```

**Modifier les routes sensibles** :
```python
@router.post("/login")
@limiter.limit("5/minute")  # ✅ Max 5 tentatives par minute
async def login(request: Request, credentials: dict):
    # ... existing code
    
@router.post("/register")
@limiter.limit("3/minute")  # ✅ Max 3 inscriptions par minute
async def register(request: Request, user: dict):
    # ... existing code
```

**Ajouter handler dans `server.py`** :
```python
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Trop de requêtes. Réessayez dans quelques instants."}
    )
```

---

## 🎯 Phase 4 - POLISH & OPTIMISATION

### ✅ Correctif #8 : Cleanup analytics (Problème #20)

**Fichier** : Créer `app/frontend/src/utils/cleanup.js`

```javascript
import { db } from '../lib/db';

/**
 * Nettoie les analytics de plus de 90 jours
 */
export const cleanupOldAnalytics = async () => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);
  
  try {
    const deleted = await db.analytics
      .where('date')
      .below(cutoffDate)
      .delete();
    
    console.log(`🧹 Cleaned up ${deleted} old analytics records`);
    return deleted;
  } catch (error) {
    console.error('Error cleaning up analytics:', error);
    return 0;
  }
};

/**
 * Nettoie tous les anciens événements terminés
 */
export const cleanupOldEvents = async () => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);
  
  try {
    const deleted = await db.events
      .where('endDate')
      .below(cutoffDate)
      .delete();
    
    console.log(`🧹 Cleaned up ${deleted} old events`);
    return deleted;
  } catch (error) {
    console.error('Error cleaning up events:', error);
    return 0;
  }
};
```

**Appeler dans `AppContext.js` useEffect** :
```javascript
import { cleanupOldAnalytics, cleanupOldEvents } from '../utils/cleanup';

useEffect(() => {
  (async () => {
    try {
      await initializeData();
      
      // ✅ Cleanup automatique au démarrage
      if (Math.random() < 0.1) { // 10% chance à chaque lancement
        cleanupOldAnalytics();
        cleanupOldEvents();
      }
      
      // ... rest of init
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  })();
}, []);
```

---

### ✅ Correctif #9 : Progress validation (Problème #21)

**Fichier** : Créer `app/frontend/src/utils/validators.js`

```javascript
/**
 * Clamp un nombre entre min et max
 */
export const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Valide et normalise un pourcentage de progression
 */
export const validateProgress = (progress) => {
  if (typeof progress !== 'number' || isNaN(progress)) {
    console.warn('Invalid progress:', progress);
    return 0;
  }
  return clamp(progress, 0, 100);
};

/**
 * Valide un montant d'XP
 */
export const validateXP = (xp) => {
  if (typeof xp !== 'number' || isNaN(xp) || xp < 0) {
    console.warn('Invalid XP:', xp);
    return 0;
  }
  return Math.max(0, xp);
};
```

**Utiliser dans les updates de quêtes** :
```javascript
import { validateProgress } from '../utils/validators';

const updateQuestProgress = async (questId, newProgress) => {
  const validProgress = validateProgress(newProgress);
  
  await db.quests.update(questId, {
    progress: validProgress,
    updatedAt: new Date()
  });
};
```

---

### ✅ Correctif #10 : Accessibilité (Problème #23)

**Fichier** : `app/frontend/src/components/QuickActionFab.jsx`

**Ajouter aria-labels partout** :
```javascript
<button 
  aria-label="Ouvrir le menu d'actions rapides"
  onClick={handleOpen}
>
  <Plus />
</button>

// Dans les items :
<button 
  aria-label="Ajouter une nouvelle quête"
  onClick={() => handleAction('quest')}
>
  <Target />
  <span>Nouvelle quête</span>
</button>
```

---

## 📊 PROGRESSION DES CORRECTIFS

```
✅ AUTOMATIQUES (déjà appliqués)
  ├─ App.js restauré
  └─ PrivateRoute corrigé

⏳ PHASE 2 - STABILISATION
  ├─ [ ] Correctif #1 : Validation XP
  ├─ [ ] Correctif #2 : Layout responsive
  ├─ [ ] Correctif #3 : Firebase conditionnel
  ├─ [ ] Correctif #4 : OAuth dependencies
  └─ [ ] Correctif #5 : Axios interceptor

⏳ PHASE 3 - SÉCURITÉ
  ├─ [ ] Correctif #6 : CORS strict
  └─ [ ] Correctif #7 : Rate limiting

⏳ PHASE 4 - POLISH
  ├─ [ ] Correctif #8 : Cleanup analytics
  ├─ [ ] Correctif #9 : Progress validation
  └─ [ ] Correctif #10 : Accessibilité
```

---

## 🚀 ORDRE D'APPLICATION RECOMMANDÉ

1. **D'abord** : Suivre `CHECKLIST_DEMARRAGE.md` pour lancer l'app
2. **Ensuite** : Appliquer Correctifs #1 à #5 (Phase 2)
3. **Avant déploiement** : Correctifs #6-7 (Phase 3)
4. **Polish final** : Correctifs #8-10 (Phase 4)

---

**Dernière mise à jour** : 2025-12-27  
**Prochaine étape** : Tester l'app après chaque correction
