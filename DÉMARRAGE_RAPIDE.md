# 🚀 GUIDE DE DÉMARRAGE RAPIDE - INITIUM

## ✅ État actuel de la configuration

**Environnement** : ✅ Prêt  
- Node.js : ✅ v25.2.1  
- Python : ✅ 3.14.0  
- Yarn : ✅ 1.22.22  

**Fichiers** :
- ✅ `.env` backend créé  
- ✅ `.env` frontend créé  
- ✅ Dépendances frontend installées  
- ✅ Dépendances backend installées (essentielles)  

**Correctifs appliqués** :
- ✅ App.js restauré (Router complet)  
- ✅ PrivateRoute corrigé (mode invité)  
- ✅ Validation XP ajoutée  
- ✅ Layout responsive corrigé  
- ✅ Firebase optionnel (pas de crash si manquant)  

---

## 🎯 POUR LANCER L'APPLICATION MAINTENANT

Vous avez **2 options** selon si vous voulez utiliser MongoDB local ou cloud :

### Option A : MongoDB Cloud (RECOMMANDÉ - Plus simple)

**Avantages** :
- ✅ Aucune installation locale
- ✅ Accessible partout
- ✅ Gratuit (512 Mo)
- ✅ Prêt pour production

**Étapes** (10 minutes) :

1. **Créer compte MongoDB Atlas**
   ```
   1. Aller sur : https://www.mongodb.com/cloud/atlas/register
   2. Créer un compte gratuit
   3. Choisir "Free" M0 cluster
   4. Région : Europe (Paris ou Frankfurt)
   5. Nom du cluster : "initium-cluster"
   ```

2. **Configuration sécurité**
   ```
   1. Database Access → Add New Database User
      - Username : initium_admin
      - Password : 26353249Victor
      - Role : Atlas Admin
   
   2. Network Access → Add IP Address
      - Allow Access from Anywhere : 0.0.0.0/0
      (Ou votre IP spécifique pour plus de sécurité)
   ```

3. **Obtenir connection string**
   ```
   1. Databases → Connect → Connect your application
   2. Driver : Python, Version : 3.11 or later
   3. Copier la connection string, exemple :
    mongodb+srv://initium_admin:<26353249Victor>@cluster0.rdlt4yv.mongodb.net/?appName=Cluster0
   4. Remplacer <password> par votre vrai mot de passe
   ```

4. **Mettre à jour .env backend**
   ```powershell
   # Éditez c:\INITIUM\app\backend\.env
   # Remplacez cette ligne :
   MONGO_URL=mongodb://localhost:27017
   
   # Par votre connection string Atlas :
   MONGO_URL=mongodb+srv://initium_admin:VOTRE_MOT_DE_PASSE@initium-cluster.xxxxx.mongodb.net/
   ```

5. **Lancer l'application** (voir section "Lancement" ci-dessous)

---

### Option B : MongoDB Local (Pour développement)

**Avantages** :
- Pas de connexion internet requise
- Données 100% locales

**Inconvénients** :
- Installation + configuration requise
- Pas portable

**Étapes** (20 minutes) :

1. **Télécharger MongoDB**
   ```
   https://www.mongodb.com/try/download/community
   - Version : 8.0 (Latest)
   - Platform : Windows x64
   - Package : MSI
   ```

2. **Installer**
   ```
   - Lancer le .msi
   - Choisir "Complete"
   - Cocher "Install MongoDB as a Service"
   - Cocher "Install MongoDB Compass" (GUI optionnelle)
   ```

3. **Vérifier installation**
   ```powershell
   mongod --version
   # Doit afficher : db version v8.0.x
   ```

4. **Créer dossier data**
   ```powershell
   mkdir C:\data\db
   ```

5. **Lancer MongoDB** (dans un terminal séparé)
   ```powershell
   mongod --dbpath C:\data\db
   # Laissez ce terminal ouvert !
   ```

---

## 🎬 LANCEMENT DE L'APPLICATION

Une fois MongoDB configuré (Option A ou B), lancez l'app :

### Terminal 1 : Backend FastAPI
```powershell
cd c:\INITIUM\app\backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

**Vérification** : 
- Aller sur http://localhost:8001/api
- Doit afficher : `{"message": "INITIUM API v2.0", ...}`

### Terminal 2 : Frontend React
```powershell
cd c:\INITIUM\app\frontend
yarn start
```

**Vérification** :
- Doit ouvrir automatiquement http://localhost:3000
- Page d'authentification avec logo INITIUM

---

## ✅ TEST DE L'APPLICATION

Une fois les deux serveurs lancés :

1. **Ouvrir** : http://localhost:3000

2. **Cliquer** : "Continuer en mode invité"

3. **Vérifier** :
   - ✅ Dashboard s'affiche
   - ✅ Banner jaune "MODE INVITÉ"
   - ✅ Statistiques (XP, Level, etc.)
   - ✅ Navigation fonctionne (sidebar ou bottom nav)

4. **Tester** :
   - Aller dans "Quêtes" → Ajouter une quête
   - Aller dans "Habitudes" → Ajouter une habitude
   - Rafraîchir la page → Données toujours là ✅

---

## 🐛 RÉSOLUTION DE PROBLÈMES

### ❌ Erreur : "Failed to connect to MongoDB"

**Cause** : MongoDB pas démarré ou mauvaise URL

**Solution Option A (Atlas)** :
```
1. Vérifier connection string dans .env
2. Vérifier mot de passe (pas de <> autour)
3. Vérifier IP whitelist (0.0.0.0/0)
```

**Solution Option B (Local)** :
```powershell
# Démarrer MongoDB
mongod --dbpath C:\data\db
# Vérifier dans .env :
MONGO_URL=mongodb://localhost:27017
```

### ❌ Backend ne démarre pas : "KeyError: 'MONGO_URL'"

**Solution** :
```powershell
# Vérifier que .env existe :
Get-Content c:\INITIUM\app\backend\.env

# Doit contenir ces lignes :
# MONGO_URL=mongodb://...
# DB_NAME=initium_db
# SECRET_KEY=...
```

### ❌ Frontend erreur Firebase

**Ce n'est PAS un problème** si vous voyez :
```
⚠️ Firebase non configuré - OAuth Google désactivé, mode invité disponible
```

**C'est normal** ! Firebase est optionnel. Le mode invité fonctionne sans.

### ❌ Page blanche

**Solution** :
```
1. Ouvrir DevTools (F12)
2. Vérifier Console pour erreurs
3. Si erreur import : yarn install
4. Redémarrer : Ctrl+C puis yarn start
```

---

## 📊 PROCHAINES ÉTAPES

### Maintenant que l'app fonctionne :

1. **Utiliser en mode invité** pour tester toutes les fonctionnalités

2. **Configurer Firebase** (optionnel) pour OAuth Google :
   - Voir `FIREBASE_GUIDE.md`

3. **Appliquer correctifs restants** (optionnel) :
   - Voir `CORRECTIFS_PRIORITAIRES.md`

4. **Déployer en ligne** (plus tard) :
   - Backend : Render.com (gratuit)
   - Frontend : Vercel (gratuit)
   - Database : MongoDB Atlas (déjà configuré si Option A)

---

## 💾 QUESTION STORAGE - Réponse

**Vous avez demandé** : "pour le storage, ne faudrait-il pas utiliser Supabase ?"

**Réponse** : Pour INITIUM, **MongoDB Atlas** (cloud) est le meilleur choix :

### ✅ MongoDB Atlas (Actuel)
- Déjà intégré dans votre code
- Cloud natif (accessible partout)
- Gratuit 512 Mo (suffisant pour débuter)
- 0 ligne de code à changer
- Prêt pour production

### 🤔 Supabase (Alternative)
- Excellent service (PostgreSQL + Auth + Storage)
- **Nécessiterait réécriture complète** :
  - ❌ Tout le backend FastAPI à adapter
  - ❌ Tous les modèles MongoDB → PostgreSQL
  - ❌ Toutes les requêtes Dexie → Queries SQL
  - ⏱️ Environ **20-40h de travail**
  
**Verdict** : Gardez MongoDB Atlas. C'est cloud, gratuit, et déjà fonctionnel. Si besoin de migrer plus tard (peu probable), ce sera toujours possible.

---

## 🎯 COMMANDES RÉSUMÉ

```powershell
# Si MongoDB Atlas : rien à faire (cloud)
# Si MongoDB Local :
Terminal 0 : mongod --dbpath C:\data\db

# Backend
Terminal 1 : cd c:\INITIUM\app\backend
Terminal 1 : uvicorn server:app --reload --port 8001

# Frontend
Terminal 2 : cd c:\INITIUM\app\frontend
Terminal 2 : yarn start

# Ouvrir : http://localhost:3000
# Cliquer : "Continuer en mode invité"
```

---

**Dernière mise à jour** : 2025-12-27  
**Status** : ✅ Prêt à lancer (MongoDB à configurer)  
**Prochaine étape** : Choisir Option A (Atlas) ou B (Local) puis lancer ! 🚀
