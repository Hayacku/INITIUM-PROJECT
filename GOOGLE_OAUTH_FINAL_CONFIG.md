# ✅ Checklist Complète - Configuration Google OAuth

## 🎯 Problèmes Identifiés et Solutions

### ✅ Problème 1 : Import Manquant (RÉSOLU)
- **Erreur** : "Erreur lors de la connexion Google" (toast immédiat)
- **Cause** : Import `signInWithPopup` manquant
- **Solution** : ✅ Corrigé - Import ajouté

### ✅ Problème 2 : Backend Non Rechargé (RÉSOLU)
- **Erreur** : "Google OAuth not configured"
- **Cause** : Backend n'avait pas rechargé le .env
- **Solution** : ✅ Corrigé - Backend redémarré

### ⏳ Problème 3 : Invalid Google ID Token (EN COURS)
- **Erreur** : "Invalid Google ID token"
- **Cause** : URIs de redirection manquants dans Google Cloud Console
- **Solution** : À faire maintenant ⬇️

---

## 🔧 Action Requise : Configurer Google Cloud Console

### Étape 1 : Accéder à Google Cloud Console

Ouvrez ce lien :
https://console.cloud.google.com/apis/credentials?project=initium-c6948

### Étape 2 : Modifier Votre OAuth Client ID

1. Dans la liste des credentials, trouvez votre OAuth 2.0 Client ID
2. **Cliquez sur le nom** pour l'éditer (icône crayon ou cliquez directement sur le nom)

### Étape 3 : Ajouter les URIs de Redirection

Dans la section **"Authorized redirect URIs"**, vous DEVEZ avoir ces 3 URIs :

```
https://initium-c6948.firebaseapp.com/__/auth/handler
http://localhost:3000/auth/callback
http://localhost:3000
```

**⚠️ CRITIQUE** : Le premier URI (`https://initium-c6948.firebaseapp.com/__/auth/handler`) est **OBLIGATOIRE** pour Firebase !

### Étape 4 : Ajouter les Origines JavaScript

Dans la section **"Authorized JavaScript origins"**, ajoutez :

```
http://localhost:3000
http://localhost:8001
https://initium-c6948.firebaseapp.com
```

### Étape 5 : Sauvegarder

1. Cliquez sur **"SAVE"** en bas
2. **Attendez 1-2 minutes** pour que Google propage les changements

---

## 🎯 Configuration Finale Requise

Votre OAuth Client ID doit avoir exactement ceci :

### Authorized JavaScript origins (3 URIs)
```
✓ http://localhost:3000
✓ http://localhost:8001
✓ https://initium-c6948.firebaseapp.com
```

### Authorized redirect URIs (3 URIs)
```
✓ https://initium-c6948.firebaseapp.com/__/auth/handler  ← OBLIGATOIRE
✓ http://localhost:3000/auth/callback
✓ http://localhost:3000
```

---

## ✅ Après Configuration

1. **Sauvegardez** dans Google Cloud Console
2. **Attendez 2 minutes** (propagation)
3. **Rechargez** http://localhost:3000 (Ctrl+F5)
4. **Cliquez** sur "Google"
5. **Ça devrait fonctionner !** 🎉

---

## 🔍 Vérification Rapide

Pour vérifier que vous avez bien tout configuré :

1. Allez sur https://console.cloud.google.com/apis/credentials?project=initium-c6948
2. Cliquez sur votre OAuth Client ID
3. Vérifiez que vous avez **exactement** les 3 redirect URIs listés ci-dessus
4. Vérifiez que vous avez les 3 JavaScript origins

---

## 📸 Aide Visuelle

Si vous ne trouvez pas où ajouter les URIs :

1. Sur la page Credentials
2. Cherchez "OAuth 2.0 Client IDs"
3. Cliquez sur le nom de votre client (pas sur "Download JSON")
4. Vous verrez deux sections :
   - **Authorized JavaScript origins** (en haut)
   - **Authorized redirect URIs** (en bas)
5. Cliquez sur "+ ADD URI" pour ajouter chaque URI

---

**Une fois fait, testez et dites-moi si ça fonctionne !** 🚀
