# 🚀 Guide de Déploiement Gratuit - INITIUM

Félicitations ! Votre application est prête. Voici la méthode la plus simple et efficace pour la mettre en ligne gratuitement.

## 🧱 Architecture du Déploiement

Nous allons utiliser le "Tier Gratuit" (Free Tier) des meilleurs services actuels :
1.  **MongoDB Atlas** : Pour la base de données (Le Cerveau).
2.  **Render** : Pour le Backend Python (Le Moteur).
3.  **Vercel** : Pour le Frontend React (La Carrosserie).

---

## Étape 1 : Le Code (GitHub)

Assurez-vous que tout votre code est sur GitHub.
1.  Créez un repository sur [GitHub](https://github.com/new).
2.  Publiez votre code actuel dessus (via VS Code ou terminal).

---

## Étape 2 : La Base de Données (MongoDB Atlas)

1.  Allez sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) et créez un compte.
2.  Créez un nouveau cluster **GRATUIT** (M0 Sandbox).
3.  Créez un utilisateur de base de données (ex: `user_initium` / `motdepasse`).
4.  Dans "Network Access", ajoutez l'IP `0.0.0.0/0` (pour autoriser l'accès depuis n'importe où).
5.  Cliquez sur **"Connect"** > **"Drivers"** et copiez votre URL de connexion.
    *   Elle ressemble à : `mongodb+srv://user_initium:motdepasse@cluster0.xyz.mongodb.net/?retryWrites=true&w=majority`
    *   ⚠️ Gardez-la précieusement !

---

## Étape 3 : Le Backend (Render)

1.  Allez sur [Render.com](https://render.com/) et créez un compte (avec GitHub c'est plus simple).
2.  Cliquez sur **"New"** > **"Web Service"**.
3.  Sélectionnez votre repository GitHub (INITIUM).
4.  Render va détecter automatiquement le fichier `render.yaml` que j'ai créé.
5.  Il va vous demander de valider la configuration.
6.  **IMPORTANT** : Vous devez ajouter vos variables d'environnement (Environment Variables) :
    *   `MONGO_URL` : Collez l'URL de MongoDB Atlas (étape 2).
    *   `JWT_SECRET_KEY` : Mettez une longue phrase secrète aléatoire.
    *   `GOOGLE_CLIENT_ID` : `867635326049-201h7k1in0vshp1gfgs9ru1f464chan4.apps.googleusercontent.com` (ou celui de votre console, si différent).
    *   `FIREBASE_PROJECT_ID` : `initium-c6948`.
7.  Lancez le déploiement.
8.  Une fois terminé, Render vous donnera une URL (ex: `https://initium-backend.onrender.com`). **Copiez-la.**

---

## Étape 4 : Le Frontend (Vercel)

1.  Allez sur [Vercel.com](https://vercel.com/) et créez un compte.
2.  Cliquez sur **"Add New..."** > **"Project"**.
3.  Importez votre repository GitHub.
4.  Configurez le projet :
    *   **Framework Preset** : Create React App (détecté auto).
    *   **Root Directory** : Cliquez sur "Edit" et sélectionnez `app/frontend`.
5.  **Environment Variables** :
    *   `REACT_APP_API_URL` : Collez l'URL de votre Backend Render (ex: `https://initium-backend.onrender.com`). Attention : pas de slash `/` à la fin.
    *   `REACT_APP_FIREBASE_API_KEY` : (Votre clé API Firebase)
    *   `REACT_APP_FIREBASE_AUTH_DOMAIN` : `initium-c6948.firebaseapp.com`
    *   `REACT_APP_FIREBASE_PROJECT_ID` : `initium-c6948`
    *   `REACT_APP_FIREBASE_STORAGE_BUCKET` : `initium-c6948.firebasestorage.app`
    *   `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` : `867635326049`
    *   `REACT_APP_FIREBASE_APP_ID` : `1:867635326049:web:8ed9de0f8ce2720ec60e20`
6.  Cliquez sur **"Deploy"**.

---

## 🎉 C'est fini !

Vercel va vous donner l'URL finale de votre site (ex: `https://initium-app.vercel.app`).
Vous pouvez maintenant partager cette adresse, vous connecter et utiliser votre application INITIUM partout !
