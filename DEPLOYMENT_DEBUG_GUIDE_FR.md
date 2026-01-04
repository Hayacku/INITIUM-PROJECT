# 🛠️ Guide de Résolution des Problèmes de Déploiement

Il semble que votre application ait des difficultés à connecter le Frontend (Vercel) au Backend (Render). Voici les étapes pour corriger cela.

## 1. Vérifier l'URL du Backend (Render)

Le Frontend doit savoir où se trouve le Backend.
1. Allez sur votre tableau de bord [Render.com](https://dashboard.render.com/).
2. Cliquez sur votre service Web (ex: `initium-backend`).
3. En haut à gauche, sous le nom du projet, vous verrez une URL (ex: `https://initium-backend.onrender.com`).
4. **Copiez cette URL**.
5. Testez-la dans votre navigateur : ajoutez `/api/status` à la fin (ex: `https://initium-backend.onrender.com/api/status`).
   - ✅ Si vous voyez `{ "message": "INITIUM API v2.0", ... }`, le backend fonctionne !
   - ❌ Si le site charge indéfiniment ou montre une erreur "Application Error", regardez les "Logs" dans Render.

## 2. Configurer Vercel

Vercel a besoin de cette URL pour faire fonctionner l'authentification.
1. Allez sur votre tableau de bord [Vercel.com](https://vercel.com/dashboard).
2. Sélectionnez votre projet `initium`.
3. Allez dans **Settings** > **Environment Variables**.
4. Cherchez `REACT_APP_API_URL`.
   - Si elle n'existe pas, ajoutez-la.
   - Si elle existe, vérifiez sa valeur.
5. **Valeur** : Collez l'URL de Render (SANS `/` à la fin).
   - Exemple correct : `https://initium-backend.onrender.com`
   - Exemple incorrect : `https://initium-backend.onrender.com/`
6. **IMPORTANT** : Après avoir modifié une variable, vous devez **Re-déployer** pour que ce soit pris en compte.
   - Allez dans **Deployments**.
   - Cliquez sur les 3 petits points du dernier déploiement > **Redeploy**.

## 3. Configurer les Clés Firebase (Vercel)

Si "l'auth ne fonctionne pas", c'est souvent les clés qui manquent.
Dans **Settings** > **Environment Variables** sur Vercel, assurez-vous d'avoir toutes les clés suivantes (copiées depuis votre `.env` local ou la console Firebase) :

- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`

## 4. Configurer CORS (Render) - CRITIQUE POUR LA PRODUCTION

Pour que Vercel puisse parler à Render en toute sécurité, Render doit connaître l'adresse de Vercel.
1. Sur [Render.com](https://dashboard.render.com/), allez dans votre service > **Environment**.
2. Ajoutez une variable : `CORS_ORIGINS`.
3. Valeur : Les URLs de votre frontend, séparées par une virgule.
   - Exemple : `https://initium-00-yye7.vercel.app,http://localhost:3000`
   - (Ajoutez localhost pour que ça continue de marcher quand vous développez sur votre PC).

## 5. Résumé des Actions à faire maintenant

1. [ ] Récupérer l'URL Render.
2. [ ] Mettre à jour `REACT_APP_API_URL` sur Vercel.
3. [ ] Ajouter `CORS_ORIGINS` sur Render avec l'URL de votre site Vercel.
4. [ ] **Redéployer** Vercel (Redeploy).
