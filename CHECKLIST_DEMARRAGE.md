# ✅ CHECKLIST DE DÉMARRAGE - INITIUM

## 🎯 Votre mission : Faire fonctionner INITIUM

Suite à l'audit technique, voici les actions **OBLIGATOIRES** pour lancer l'application.

---

## Phase 1 : Configuration Environnement (CRITIQUE)

### ✅ 1. Node.js Installation
**Statut actuel** : ❌ NOT FOUND  
**Action** :
```powershell
# Télécharger et installer Node.js 18+ LTS
# https://nodejs.org/en/download/

# Après installation, vérifier :
node --version  # Doit afficher v18.x.x ou supérieur
npm --version
yarn --version  # Si pas installé : npm install -g yarn
```

### ✅ 2. MongoDB Setup
**Statut actuel** : ⚠️ À VÉRIFIER  
**Option A - Local** :
```powershell
# Installer MongoDB Community Server
# https://www.mongodb.com/try/download/community

# Démarrer MongoDB
mongod --dbpath C:\data\db

# Ou utiliser MongoDB Compass pour GUI
```

**Option B - Cloud (Recommandé)** :
```
1. Créer compte gratuit sur MongoDB Atlas : https://www.mongodb.com/cloud/atlas
2. Créer un cluster gratuit (M0)
3. Whitelist IP : 0.0.0.0/0 (dev) ou votre IP
4. Créer un user avec mot de passe
5. Copier la connection string
```

### ✅ 3. Variables d'environnement Backend
**Fichier** : `c:\INITIUM\app\backend\.env`  
**Action** : Créer ce fichier avec :

```env
# MongoDB
MONGO_URL=mongodb://localhost:27017
# OU si Atlas :
# MONGO_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/

DB_NAME=initium_db

# Sécurité
SECRET_KEY=VotreCléSecrèteTrèsLongueEtAléatoire123456789

# CORS (ajouter Vercel URL si déployé)
CORS_ORIGINS=http://localhost:3000

# OAuth Google (OPTIONNEL - peut être configuré plus tard)
# GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
# GOOGLE_CLIENT_SECRET=your_google_client_secret

# OAuth GitHub (OPTIONNEL)
# GITHUB_CLIENT_ID=your_github_client_id
# GITHUB_CLIENT_SECRET=your_github_client_secret

# Environment
ENV=development
```

### ✅ 4. Variables d'environnement Frontend
**Fichier** : `c:\INITIUM\app\frontend\.env`  
**Action** : Créer ce fichier avec :

```env
# Backend API
REACT_APP_API_URL=http://localhost:8001

# Firebase (OPTIONNEL pour OAuth Google - peut laisser vide pour commencer)
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_MEASUREMENT_ID=
```

**Note** : Si vous voulez OAuth Google maintenant, suivez `FIREBASE_GUIDE.md`

---

## Phase 2 : Installation des dépendances

### ✅ 5. Backend Dependencies
```powershell
cd c:\INITIUM\app\backend
pip install -r requirements.txt

# Si erreur, utiliser un environnement virtuel :
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### ✅ 6. Frontend Dependencies
```powershell
cd c:\INITIUM\app\frontend
yarn install

# Si erreur de cache :
yarn cache clean
yarn install --force
```

---

## Phase 3 : Lancement de l'application

### ✅ 7. Démarrer MongoDB
```powershell
# Si local :
mongod --dbpath C:\data\db

# Si Atlas : rien à faire, déjà en ligne
```

### ✅ 8. Démarrer le Backend
```powershell
# Ouvrir un nouveau terminal
cd c:\INITIUM\app\backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Vérifier : http://localhost:8001/api
# Devrait afficher : {"message": "INITIUM API v2.0", ...}
```

### ✅ 9. Démarrer le Frontend
```powershell
# Ouvrir un AUTRE nouveau terminal
cd c:\INITIUM\app\frontend
yarn start

# Devrait ouvrir automatiquement : http://localhost:3000
```

---

## Phase 4 : Vérification

### ✅ 10. Tests de base

**10.1 - Page d'authentification**
- [ ] La page `/auth` s'affiche correctement
- [ ] Les boutons Google/GitHub sont visibles (même si non configurés)
- [ ] Le bouton "Continuer en mode invité" fonctionne

**10.2 - Mode Invité**
- [ ] Cliquer "Continuer en mode invité"
- [ ] Redirection vers le Dashboard
- [ ] Banner jaune "MODE INVITÉ" visible
- [ ] Les statistiques XP/Level s'affichent

**10.3 - Navigation**
- [ ] Sidebar desktop fonctionnelle (si écran large)
- [ ] Bottom nav mobile fonctionnelle (si mobile/petit écran)
- [ ] Tous les liens de navigation fonctionnent

**10.4 - Fonctionnalités de base**
- [ ] Dashboard affiche les widgets
- [ ] Page Quêtes affiche/ajoute une quête
- [ ] Page Habitudes affiche/ajoute une habitude
- [ ] Les données sont persistées (refresh = données toujours là)

---

## 🚨 En cas de problème

### Erreur : "Le terme «node.exe» n'est pas reconnu"
**Solution** : Node.js pas installé ou pas dans le PATH
```powershell
# Relancer le terminal après installation Node.js
# Ou redémarrer Windows
refreshenv
```

### Erreur : "KeyError: 'MONGO_URL'"
**Solution** : Fichier `.env` backend manquant ou mal configuré
```powershell
# Vérifier que le fichier existe :
Get-Content c:\INITIUM\app\backend\.env

# Doit contenir MONGO_URL=...
```

### Erreur : "Failed to connect to MongoDB"
**Solution** : MongoDB pas démarré
```powershell
# Vérifier que MongoDB tourne :
# - Process "mongod.exe" actif dans Task Manager
# - OU cluster Atlas est online
```

### Erreur : "CORS error" dans la console
**Solution** : Vérifier CORS_ORIGINS dans backend `.env`
```env
CORS_ORIGINS=http://localhost:3000
```

### Écran blanc ou erreur React
**Solution** : Vérifier la console navigateur (F12)
- Si erreur Firebase : Variables .env frontend manquantes (OK si pas OAuth)
- Si erreur import : Dependencies manquantes → `yarn install`

---

## 📊 Statut des correctifs

### ✅ DÉJÀ CORRIGÉ (automatiquement)
- ✅ **App.js restauré** - Router complet avec toutes les routes
- ✅ **PrivateRoute corrigé** - Mode invité fonctionne correctement

### ⏳ À FAIRE PAR L'UTILISATEUR
- [ ] Installer Node.js
- [ ] Configurer MongoDB
- [ ] Créer fichiers `.env`
- [ ] Installer dépendances
- [ ] Lancer l'application

### 📝 OPTIONNEL (peut attendre)
- [ ] Configurer Firebase pour OAuth Google
- [ ] Configurer GitHub OAuth
- [ ] Déploiement sur Vercel/Render

---

## 🎓 Workflow de développement recommandé

```
1. Ouvrir 3 terminaux :
   - Terminal 1 : MongoDB (si local)
   - Terminal 2 : Backend (uvicorn)
   - Terminal 3 : Frontend (yarn start)

2. Ordre de lancement :
   MongoDB → Backend → Frontend

3. Pour arrêter :
   Ctrl+C dans chaque terminal
```

---

## 📞 Ressources

- **Audit complet** : `AUDIT_TECHNIQUE_COMPLET.md`
- **Workflow init** : `.agent/workflows/init.md`
- **Guide Firebase** : `FIREBASE_GUIDE.md`
- **Guide OAuth** : `OAUTH_SETUP_GUIDE.md`

---

**Dernière mise à jour** : 2025-12-27  
**Prochaine étape** : Suivre Phase 1-3 dans l'ordre ✨
