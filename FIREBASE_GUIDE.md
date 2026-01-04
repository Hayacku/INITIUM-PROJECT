# 🔥 Guide Firebase - Obtenir les Clés Google OAuth

Vous êtes actuellement sur la console Firebase du projet **INITIUM**. Voici les étapes exactes à suivre :

---

## 📍 Vous êtes ici : Vue d'ensemble du projet

![Console Firebase INITIUM](file:///C:/Users/venan/.gemini/antigravity/brain/36fbd10b-fc97-4a06-b01c-1c1a603e1b7d/uploaded_image_1765537727346.png)

---

## 🎯 Étapes à Suivre

### Étape 1 : Activer l'Authentification Google

1. Dans le menu de gauche, cliquez sur **"Authentication"** (Authentification)
2. Cliquez sur l'onglet **"Sign-in method"** (Méthode de connexion)
3. Dans la liste des providers, trouvez **"Google"**
4. Cliquez sur **"Google"** pour l'activer
5. Activez le toggle **"Enable"** (Activer)
6. Remplissez les informations :
   - **Project support email** : Votre email
   - **Project public-facing name** : INITIUM
7. Cliquez sur **"Save"** (Enregistrer)

> ✅ **Note** : Firebase va automatiquement créer les credentials OAuth pour vous !

---

### Étape 2 : Obtenir les Clés OAuth pour le Backend

Maintenant que Google Auth est activé dans Firebase, vous devez obtenir les clés pour le **backend** :

#### Option A : Via Google Cloud Console (RECOMMANDÉ)

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez le projet **"initium-c6948"** (le même que Firebase)
3. Menu **"APIs & Services"** → **"Credentials"**
4. Vous verrez peut-être déjà un "Web client (auto created by Google Service)" créé par Firebase
5. Cliquez sur **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
6. **Application type** : Sélectionnez **"Web application"**
7. **Name** : `INITIUM Backend`
8. **Authorized JavaScript origins** :
   ```
   http://localhost:3000
   http://localhost:8001
   ```
9. **Authorized redirect URIs** :
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000
   ```
10. Cliquez **"CREATE"**
11. **📋 COPIEZ** le `Client ID` et le `Client secret` qui s'affichent

#### Option B : Utiliser les Credentials Firebase (Plus Simple)

1. Dans Firebase Console, allez dans **"Project Settings"** (⚙️ en haut à gauche)
2. Onglet **"Service accounts"**
3. Vous y trouverez des informations sur le projet
4. **OU** utilisez directement les credentials du Web client auto-créé par Firebase

---

### Étape 3 : Récupérer les Clés

Une fois que vous avez créé l'OAuth Client ID, vous obtiendrez :

```
Client ID: 123456789-abcdefghijklmnop.apps.googleusercontent.com
Client secret: GOCSPX-abcdefghijklmnopqrstuvwxyz
```

---

## 📝 Que Faire Ensuite ?

### Envoyez-moi les clés dans ce format :

```
GOOGLE_CLIENT_ID=votre_client_id_ici
GOOGLE_CLIENT_SECRET=votre_client_secret_ici
```

Je les configurerai automatiquement dans le fichier `.env` du backend !

---

## 🔍 Raccourci Rapide

Si vous voulez aller directement à Google Cloud Console pour votre projet :

**Lien direct** : https://console.cloud.google.com/apis/credentials?project=initium-c6948

---

## ⚠️ Points Importants

1. **SHA-1** : Si on vous demande SHA-1, **IGNOREZ** - c'est pour Android uniquement
2. **Type d'application** : Choisissez bien **"Web application"**, pas Android ou iOS
3. **Redirect URIs** : Utilisez exactement `http://localhost:3000/auth/callback`
4. **Client Secret** : Sera affiché **une seule fois**, copiez-le immédiatement !

---

## 🎯 Résumé Visuel

```
Firebase Console
    ↓
Authentication → Sign-in method → Enable Google
    ↓
Google Cloud Console
    ↓
APIs & Services → Credentials → Create OAuth Client ID
    ↓
Type: Web application
    ↓
Copier Client ID + Client Secret
    ↓
Me les envoyer !
```

---

**Besoin d'aide ?** Dites-moi où vous êtes bloqué et je vous guiderai étape par étape !
