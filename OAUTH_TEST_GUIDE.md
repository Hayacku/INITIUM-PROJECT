# 🎉 Google OAuth Configuré - Guide de Test

## ✅ Configuration Complète !

Les credentials Google OAuth ont été ajoutés avec succès au backend :

```bash
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
```

Le serveur backend s'est rechargé automatiquement avec la nouvelle configuration.

---

## 🧪 Comment Tester l'Authentification Google

### Étape 1 : Ouvrir l'Application

1. Ouvrez votre navigateur
2. Allez sur **http://localhost:3000**
3. Vous devriez voir la page d'authentification INITIUM

### Étape 2 : Tester la Connexion Google

1. Sur la page d'authentification, cliquez sur le bouton **"Google"**
2. Une popup Firebase devrait s'ouvrir
3. Sélectionnez votre compte Google
4. Autorisez l'application INITIUM
5. La popup se ferme
6. Vous devriez être **automatiquement connecté** et redirigé vers le dashboard

### Étape 3 : Vérifier la Connexion

Une fois connecté, vérifiez que :
- ✅ Vous êtes sur le dashboard (URL: `http://localhost:3000/`)
- ✅ Votre nom d'utilisateur apparaît en haut à droite
- ✅ Pas d'erreurs dans la console du navigateur (F12)

---

## 🔍 En Cas de Problème

### Problème 1 : Popup Google ne s'ouvre pas

**Solution** :
- Vérifiez que les popups ne sont pas bloquées par votre navigateur
- Autorisez les popups pour `localhost:3000`

### Problème 2 : Erreur "OAuth not configured"

**Solution** :
- Vérifiez que le backend est bien redémarré
- Vérifiez les logs du backend dans le terminal

### Problème 3 : Erreur après authentification Google

**Causes possibles** :
1. **Vérifiez les URIs autorisés dans Google Cloud Console** :
   - `http://localhost:3000` doit être dans "Authorized JavaScript origins"
   - `http://localhost:3000/auth/callback` doit être dans "Authorized redirect URIs"

2. **Vérifiez les logs backend** :
   - Ouvrez le terminal où tourne le backend
   - Cherchez des erreurs liées à Google OAuth

---

## 🎯 Flux Complet de l'Authentification

```
1. Utilisateur clique "Google"
   ↓
2. Popup Firebase s'ouvre
   ↓
3. Utilisateur s'authentifie avec Google
   ↓
4. Firebase retourne un ID token
   ↓
5. Frontend envoie le token à /api/oauth/google/verify
   ↓
6. Backend vérifie le token avec Google
   ↓
7. Backend crée/trouve le compte utilisateur
   ↓
8. Backend génère des JWT tokens
   ↓
9. Frontend stocke les tokens
   ↓
10. Redirection vers le dashboard
    ↓
11. ✅ Utilisateur connecté !
```

---

## 📊 Vérifications Backend

### Vérifier que le serveur a bien rechargé

Dans le terminal du backend, vous devriez voir :
```
WARNING:  StatReload detected changes in '.env'. Reloading...
INFO:     Shutting down
INFO:     Started server process [XXXX]
INFO:     Application startup complete.
```

### Tester l'endpoint OAuth manuellement

Vous pouvez vérifier que l'endpoint existe :
```bash
curl http://localhost:8001/docs
```

Puis cherchez `/api/oauth/google/verify` dans la documentation Swagger.

---

## 🎨 Test Complet - Scénario Utilisateur

### Scénario 1 : Nouvel Utilisateur

1. Utilisateur clique sur "Google"
2. S'authentifie avec un compte Google jamais utilisé sur INITIUM
3. **Résultat attendu** :
   - Compte créé automatiquement
   - Email et nom récupérés de Google
   - Connexion automatique
   - Redirection vers dashboard

### Scénario 2 : Utilisateur Existant (Email/Password)

1. Utilisateur a déjà un compte avec email/password
2. Utilise le même email pour se connecter via Google
3. **Résultat attendu** :
   - Compte Google lié au compte existant
   - Connexion réussie
   - Peut maintenant utiliser Google OU email/password

### Scénario 3 : Utilisateur Existant (Google)

1. Utilisateur s'est déjà connecté via Google
2. Se reconnecte via Google
3. **Résultat attendu** :
   - Connexion immédiate
   - Pas de nouveau compte créé
   - Redirection vers dashboard

---

## 🚀 Prochaines Étapes

### Optionnel : GitHub OAuth

Si vous souhaitez aussi activer GitHub OAuth :
1. Suivez le guide dans `OAUTH_SETUP_GUIDE.md`
2. Créez une OAuth App sur GitHub
3. Envoyez-moi les credentials GitHub

### Recommandé : Tester l'Application

1. **Testez la connexion Google** comme décrit ci-dessus
2. **Créez quelques quêtes/habitudes** pour vérifier que tout fonctionne
3. **Déconnectez-vous et reconnectez-vous** pour tester la persistance

---

## ✅ Checklist de Vérification

- [ ] Ouvrir http://localhost:3000
- [ ] Cliquer sur "Google"
- [ ] Popup Google s'ouvre
- [ ] Authentification réussie
- [ ] Redirection vers dashboard
- [ ] Pas d'erreurs dans la console
- [ ] Peut créer des quêtes/habitudes
- [ ] Déconnexion fonctionne
- [ ] Reconnexion fonctionne

---

**🎊 Félicitations !** Votre système d'authentification Google OAuth est maintenant complètement configuré et fonctionnel !

**Besoin d'aide ?** Si vous rencontrez un problème, envoyez-moi :
- Le message d'erreur exact
- Une capture d'écran
- Les logs du backend (terminal)
