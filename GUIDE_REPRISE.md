# 🚀 GUIDE DE REPRISE - INITIUM (04/01/2026)

## 📊 ÉTAT ACTUEL DU PROJET

### ✅ Ce qui fonctionne
- ✅ Code corrigé (10 bugs majeurs)
- ✅ Configuration `.env` créée
- ✅ Dépendances installées
- ✅ Nouveaux composants ajoutés :
  - `NotificationCenter.jsx`
  - `QuickActionFab.jsx`
  - `TutorialOverlay.jsx`
  - `WhatsNewModal.jsx`
  - `lib/notifications.js`
  - `utils/validators.js`

### ⚠️ Problème actuel
- OAuth Google : Erreur de connexion (diagnostic en cours)

### 🎯 Serveurs
- ❌ Backend : Non lancé (port 8001 libre)
- ❌ Frontend : Non lancé (port 3000 libre)

---

## 🚀 RELANCER L'APPLICATION

### Étape 1 : Démarrer le Backend

```powershell
# Terminal 1
cd c:\INITIUM\app\backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

**Vérification** :
- ✅ Doit afficher : `Application startup complete`
- ✅ Tester : http://localhost:8001/api
- ✅ Devrait retourner : `{"message": "INITIUM API v2.0", ...}`

**Si erreur `email-validator`** :
```powershell
pip install email-validator
# Puis relancer uvicorn
```

---

### Étape 2 : Démarrer le Frontend

```powershell
# Terminal 2 (nouveau)
cd c:\INITIUM\app\frontend
yarn start
```

**Vérification** :
- ✅ Doit ouvrir automatiquement http://localhost:3000
- ✅ Page d'authentification visible

---

## 🧪 TESTER L'APPLICATION

### Test 1 : Mode Invité (Sans OAuth)

1. Ouvrir http://localhost:3000
2. Cliquer sur **"Continuer en mode invité"**
3. Vérifier :
   - ✅ Dashboard s'affiche
   - ✅ Banner jaune "MODE INVITÉ"
   - ✅ Navigation fonctionne
   - ✅ Créer une quête → Données persistent après refresh

**Si ça fonctionne** : ✅ L'app est opérationnelle ! OAuth est optionnel.

---

### Test 2 : OAuth Google (Optionnel)

**Prérequis** :
- Firebase configuré dans `app/frontend/.env`
- Google Cloud Console configuré

**Test** :
1. Sur la page d'auth, cliquer sur **"Google"**
2. Observer :
   - ✅ Popup Google s'ouvre
   - ✅ Sélection de compte
   - ✅ Redirection vers Dashboard

**Si erreur** : Voir section "Résoudre OAuth" ci-dessous

---

## 🔧 RÉSOUDRE PROBLÈME OAUTH GOOGLE

### Diagnostic Rapide

**Ouvrir la console navigateur** (F12 → Console) et chercher :

#### Erreur 1 : "Firebase: Error (auth/popup-blocked)"
**Solution** :
- Autoriser les popups pour localhost:3000
- Cliquer sur l'icône dans la barre d'adresse

#### Erreur 2 : "Firebase non configuré"
**Solution** :
```powershell
# Vérifier app/frontend/.env
notepad c:\INITIUM\app\frontend\.env

# Doit contenir (avec vraies valeurs) :
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=votre-projet
# ... etc
```

**Si vide** : Firebase n'est pas configuré → Mode invité uniquement

#### Erreur 3 : "Failed to fetch" ou "Network Error"
**Solution** :
- Vérifier que le backend tourne : http://localhost:8001/docs
- Vérifier CORS dans `app/backend/.env` :
  ```env
  CORS_ORIGINS=http://localhost:3000
  ```

#### Erreur 4 : "redirect_uri_mismatch"
**Solution** :
1. Aller sur https://console.cloud.google.com
2. APIs & Services → Credentials
3. Cliquer sur votre OAuth 2.0 Client ID
4. Ajouter dans "Authorized JavaScript origins" :
   ```
   http://localhost:3000
   ```
5. Ajouter dans "Authorized redirect URIs" :
   ```
   http://localhost:3000
   http://localhost:3000/auth/callback
   ```

---

## 📝 MODIFICATIONS RÉCENTES

Depuis la dernière session, vous avez modifié :

### Backend
- `server.py` - Améliorations CORS/routes

### Frontend
- `App.js` - Router restauré ✅
- `Layout.js` - Responsive corrigé ✅
- `PrivateRoute.jsx` - Mode invité corrigé ✅
- `AppContext.js` - Validation XP ✅
- `AuthContext.js` - Interceptor sécurisé ✅
- `firebase.js` - Initialisation conditionnelle ✅
- `Auth.js` - OAuth dependencies ✅
- `Dashboard.js` - Analytics normalisées ✅
- `Habits.js` - Améliorations
- `Settings.js` - Améliorations
- `index.css` - Styles
- `tailwind.config.js` - Config
- `lib/db.js` - Base de données

### Nouveaux fichiers
- ✅ `components/NotificationCenter.jsx`
- ✅ `components/QuickActionFab.jsx`
- ✅ `components/TutorialOverlay.jsx`
- ✅ `components/WhatsNewModal.jsx`
- ✅ `lib/notifications.js`
- ✅ `utils/validators.js`

---

## 🎯 PROCHAINES ÉTAPES RECOMMANDÉES

### Option A : Utiliser sans OAuth (Recommandé pour tester)
1. Lancer backend + frontend
2. Utiliser mode invité
3. Tester toutes les fonctionnalités
4. Configurer OAuth plus tard si besoin

### Option B : Configurer OAuth maintenant
1. Créer projet Firebase (si pas fait)
2. Activer Google Sign-In
3. Copier les clés dans `app/frontend/.env`
4. Configurer Google Cloud Console
5. Tester OAuth

---

## 📚 DOCUMENTATION DISPONIBLE

| Fichier | Usage |
|---------|-------|
| `INDEX.md` | Navigation générale |
| `DÉMARRAGE_RAPIDE.md` | Guide de lancement |
| `DÉPANNAGE_BACKEND.md` | Erreurs backend |
| `OAUTH_ERROR_DIAGNOSTIC.md` | Diagnostic OAuth |
| `AUDIT_TECHNIQUE_COMPLET.md` | Liste complète des bugs |
| `RÉSUMÉ_CORRECTIONS.md` | Corrections appliquées |

---

## 🔍 COMMANDES UTILES

### Vérifier si serveurs tournent
```powershell
netstat -ano | findstr :8001  # Backend
netstat -ano | findstr :3000  # Frontend
```

### Logs backend détaillés
```powershell
cd c:\INITIUM\app\backend
uvicorn server:app --reload --log-level debug --port 8001
```

### Rebuild frontend (si problèmes)
```powershell
cd c:\INITIUM\app\frontend
yarn install
yarn start
```

### Vérifier MongoDB
```powershell
# Tester connexion Atlas
mongosh "mongodb+srv://initium_admin:26353249Victor@cluster0.rdlt4yv.mongodb.net/"
```

---

## ✅ CHECKLIST DE REPRISE

- [ ] Backend lancé (port 8001)
- [ ] Frontend lancé (port 3000)
- [ ] Mode invité fonctionne
- [ ] Créer une quête → OK
- [ ] Créer une habitude → OK
- [ ] Données persistent après refresh → OK
- [ ] (Optionnel) OAuth Google fonctionne

---

## 🆘 EN CAS DE PROBLÈME

### Backend ne démarre pas
1. Vérifier `.env` existe : `Get-Content c:\INITIUM\app\backend\.env`
2. Vérifier MongoDB URL correcte (sans `<>`)
3. Installer dépendances manquantes : `pip install email-validator`

### Frontend écran blanc
1. Ouvrir console (F12)
2. Vérifier erreurs
3. Rebuild : `yarn install` puis `yarn start`

### OAuth ne fonctionne pas
1. Vérifier console navigateur (F12)
2. Voir `OAUTH_ERROR_DIAGNOSTIC.md`
3. Mode invité fonctionne toujours !

---

**Dernière mise à jour** : 04/01/2026  
**Status** : ✅ Prêt à relancer  
**Action** : Lancer backend + frontend puis tester mode invité
