# 🔧 Solution : Erreur 400 redirect_uri_mismatch

## 🎯 Problème Identifié

**Erreur** : "Accès bloqué : la demande de cette appli n'est pas valide"  
**Code** : `Erreur 400 : redirect_uri_mismatch`

![Erreur Google OAuth](file:///C:/Users/venan/.gemini/antigravity/brain/36fbd10b-fc97-4a06-b01c-1c1a603e1b7d/uploaded_image_0_1765539990736.png)

**Cause** : Les URIs de redirection autorisés dans Google Cloud Console ne correspondent pas à ceux utilisés par Firebase.

---

## ✅ Solution Étape par Étape

### Étape 1 : Aller sur Google Cloud Console

1. Ouvrez : https://console.cloud.google.com/apis/credentials?project=initium-c6948
2. Vous verrez la liste de vos "OAuth 2.0 Client IDs"

### Étape 2 : Modifier le Client OAuth

1. Trouvez le client que vous avez créé (probablement nommé "INITIUM Backend" ou "INITIUM Web Client")
2. **Cliquez sur le nom** du client pour l'éditer

### Étape 3 : Ajouter les URIs Autorisés

Dans la section **"Authorized redirect URIs"**, vous devez avoir **EXACTEMENT** ces URIs :

```
https://initium-c6948.firebaseapp.com/__/auth/handler
http://localhost:3000/auth/callback
http://localhost:3000
```

**IMPORTANT** : Le premier URI (`https://initium-c6948.firebaseapp.com/__/auth/handler`) est **OBLIGATOIRE** pour Firebase !

### Étape 4 : Ajouter les Origines JavaScript

Dans la section **"Authorized JavaScript origins"**, ajoutez :

```
http://localhost:3000
http://localhost:8001
https://initium-c6948.firebaseapp.com
```

### Étape 5 : Sauvegarder

1. Cliquez sur **"SAVE"** en bas de la page
2. Attendez quelques secondes que les changements se propagent

---

## 🎯 Configuration Complète Requise

Voici exactement ce que vous devez avoir dans Google Cloud Console :

### OAuth 2.0 Client ID Configuration

**Application type** : Web application

**Authorized JavaScript origins** :
- `http://localhost:3000`
- `http://localhost:8001`
- `https://initium-c6948.firebaseapp.com`

**Authorized redirect URIs** :
- `https://initium-c6948.firebaseapp.com/__/auth/handler` ← **CRITIQUE pour Firebase**
- `http://localhost:3000/auth/callback`
- `http://localhost:3000`

---

## 🔍 Pourquoi cette erreur ?

Firebase utilise son propre handler OAuth à l'adresse :
```
https://initium-c6948.firebaseapp.com/__/auth/handler
```

Si cet URI n'est pas dans la liste des URIs autorisés, Google refuse la connexion.

---

## ✅ Après la Correction

1. **Sauvegardez** les changements dans Google Cloud Console
2. **Attendez 1-2 minutes** (propagation des changements)
3. **Rechargez** la page http://localhost:3000 (Ctrl+F5)
4. **Cliquez** à nouveau sur "Google"
5. **Ça devrait fonctionner !** ✨

---

## 📸 Vérification Visuelle

Votre configuration dans Google Cloud Console devrait ressembler à ceci :

```
Authorized JavaScript origins
┌─────────────────────────────────────────────────┐
│ http://localhost:3000                           │
│ http://localhost:8001                           │
│ https://initium-c6948.firebaseapp.com           │
└─────────────────────────────────────────────────┘

Authorized redirect URIs
┌─────────────────────────────────────────────────┐
│ https://initium-c6948.firebaseapp.com/__/auth/handler │
│ http://localhost:3000/auth/callback             │
│ http://localhost:3000                           │
└─────────────────────────────────────────────────┘
```

---

## 🚨 Points Importants

1. **L'URI Firebase est OBLIGATOIRE** : `https://initium-c6948.firebaseapp.com/__/auth/handler`
2. **Respectez exactement** les URLs (http vs https, avec ou sans slash final)
3. **Attendez** 1-2 minutes après la sauvegarde pour que Google propage les changements
4. **Rechargez** complètement la page (Ctrl+F5) après avoir fait les changements

---

## 🎊 Une fois corrigé

Vous pourrez :
1. Cliquer sur "Google"
2. Voir la popup Google
3. Sélectionner votre compte
4. Être automatiquement connecté à INITIUM !

**Faites ces modifications et testez à nouveau !** 🚀
