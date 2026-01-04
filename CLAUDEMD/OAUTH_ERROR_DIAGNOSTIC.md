# 🔧 Diagnostic Erreur Google OAuth

## 📋 Informations Nécessaires

Pour résoudre votre erreur "Erreur lors de la connexion Google", j'ai besoin de savoir :

### 1. Message d'Erreur Exact
- Quel est le message d'erreur complet affiché ?
- Apparaît-il dans un toast/notification ou dans la console ?

### 2. Console du Navigateur (IMPORTANT)
**Étapes** :
1. Ouvrez http://localhost:3000
2. Appuyez sur **F12** pour ouvrir les outils développeur
3. Allez dans l'onglet **"Console"**
4. Cliquez sur le bouton "Google"
5. **Copiez tous les messages d'erreur en rouge**

### 3. Logs Backend
Dans le terminal où tourne `uvicorn`, y a-t-il des erreurs quand vous cliquez sur "Google" ?

---

## 🔍 Erreurs Courantes et Solutions

### Erreur 1 : Popup Bloquée
**Message** : "Firebase: Error (auth/popup-blocked)"
**Solution** :
- Autorisez les popups pour localhost:3000
- Cliquez sur l'icône de popup bloquée dans la barre d'adresse

### Erreur 2 : Firebase Non Initialisé
**Message** : "Firebase: No Firebase App '[DEFAULT]'"
**Solution** :
- Vérifiez que le frontend a bien compilé
- Rechargez la page (Ctrl+F5)

### Erreur 3 : Backend Non Accessible
**Message** : "Failed to fetch" ou "Network Error"
**Solution** :
- Vérifiez que le backend tourne sur port 8001
- Testez : http://localhost:8001/docs

### Erreur 4 : OAuth Non Configuré
**Message** : "Google OAuth not configured"
**Solution** :
- Redémarrez le serveur backend
- Vérifiez que les credentials sont dans .env

### Erreur 5 : URIs Non Autorisés
**Message** : "redirect_uri_mismatch" ou "origin_mismatch"
**Solution** :
- Allez sur Google Cloud Console
- Vérifiez les URIs autorisés :
  - JavaScript origins: `http://localhost:3000`
  - Redirect URIs: `http://localhost:3000/auth/callback`

---

## 🧪 Tests de Diagnostic

### Test 1 : Vérifier le Backend
```bash
curl http://localhost:8001/api/oauth/google/verify
```
Devrait retourner une erreur 422 (c'est normal, on n'envoie pas de token)

### Test 2 : Vérifier Firebase
Ouvrez la console du navigateur et tapez :
```javascript
console.log(window.firebase)
```

### Test 3 : Vérifier les Variables d'Environnement
Dans le terminal backend, arrêtez le serveur (Ctrl+C) et tapez :
```bash
cd app/backend
python -c "import os; from dotenv import load_dotenv; load_dotenv('.env'); print('GOOGLE_CLIENT_ID:', os.getenv('GOOGLE_CLIENT_ID'))"
```

---

## 📸 Captures d'Écran Utiles

Si possible, envoyez-moi des captures d'écran de :
1. La console du navigateur (F12 → Console) avec l'erreur
2. Le terminal backend avec les logs
3. La page d'authentification au moment de l'erreur

---

**Envoyez-moi ces informations et je résoudrai le problème immédiatement !**
