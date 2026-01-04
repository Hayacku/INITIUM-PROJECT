# 🔑 Guide de Configuration OAuth - INITIUM

Ce guide vous aide à configurer les clés OAuth nécessaires pour INITIUM.

---

## ✅ Firebase - DÉJÀ CONFIGURÉ

Les credentials Firebase sont déjà présents et **confirmés à jour** par l'utilisateur.

**Aucune action requise** pour Firebase !

---

## 🔐 Google OAuth - Configuration Requise

### ⚠️ Important: SHA-1 n'est PAS nécessaire !

Le SHA-1 est **uniquement pour Android**. Pour une application web, **ignorez complètement cette demande**.

### Étapes Détaillées

#### 1. Accéder à Google Cloud Console
- Ouvrir [Google Cloud Console](https://console.cloud.google.com/)
- Sélectionner le projet `initium-c6948` (votre projet Firebase existant)

#### 2. Créer les Credentials OAuth
1. Menu de gauche → **APIs & Services** → **Credentials**
2. Cliquer sur **+ CREATE CREDENTIALS** (en haut)
3. Sélectionner **OAuth client ID**

#### 3. Configurer l'écran de consentement (si demandé)
Si c'est la première fois:
- Choisir **External** (pour tester avec n'importe quel compte Google)
- Remplir uniquement les champs obligatoires:
  - App name: `INITIUM`
  - User support email: votre email
  - Developer contact: votre email
- Cliquer **Save and Continue** plusieurs fois
- Cliquer **Back to Dashboard**

#### 4. Créer l'OAuth Client ID
1. Retourner à **Credentials** → **+ CREATE CREDENTIALS** → **OAuth client ID**
2. **Application type**: Sélectionner **Web application**
3. **Name**: `INITIUM Web Client`
4. **Authorized JavaScript origins** - Cliquer **+ ADD URI** et ajouter:
   ```
   http://localhost:3000
   ```
   Puis cliquer **+ ADD URI** à nouveau et ajouter:
   ```
   http://localhost:8001
   ```
5. **Authorized redirect URIs** - Cliquer **+ ADD URI** et ajouter:
   ```
   http://localhost:3000/auth/callback
   ```
   Puis cliquer **+ ADD URI** à nouveau et ajouter:
   ```
   http://localhost:3000
   ```
6. Cliquer **CREATE**

#### 5. Copier les Credentials
Une popup s'affiche avec:
- **Your Client ID**: `123456789-abc...apps.googleusercontent.com`
- **Your Client Secret**: `GOCSPX-abc...xyz`

**📋 Copiez ces deux valeurs** - vous en aurez besoin pour la configuration !

---

## 🐙 GitHub OAuth - Configuration Optionnelle

### Solution pour "Homepage URL"

Utilisez simplement `http://localhost:3000` comme URL temporaire pour le développement.

### Étapes Détaillées

#### 1. Accéder aux Developer Settings
- Ouvrir [GitHub Developer Settings](https://github.com/settings/developers)
- Cliquer sur **OAuth Apps** dans le menu de gauche
- Cliquer sur **New OAuth App**

#### 2. Remplir le Formulaire
```
Application name: INITIUM Local Dev
Homepage URL: http://localhost:3000
Application description: INITIUM productivity app - local development
Authorization callback URL: http://localhost:3000/auth/github/callback
```

#### 3. Créer l'Application
- Cliquer sur **Register application**
- Vous verrez votre **Client ID** affiché

#### 4. Générer le Client Secret
- Sur la page de votre OAuth App
- Cliquer sur **Generate a new client secret**
- **⚠️ IMPORTANT**: Copiez immédiatement le secret, il ne sera affiché qu'une fois !

#### 5. Copier les Credentials
Vous avez maintenant:
- **Client ID**: `abc123...`
- **Client Secret**: `xyz789...`

**📋 Copiez ces deux valeurs** !

---

## 📝 Prochaine Étape

Une fois que vous avez obtenu les clés OAuth:

### Pour Google OAuth:
```
GOOGLE_CLIENT_ID=votre_client_id_ici
GOOGLE_CLIENT_SECRET=votre_client_secret_ici
```

### Pour GitHub OAuth (optionnel):
```
GITHUB_CLIENT_ID=votre_client_id_ici
GITHUB_CLIENT_SECRET=votre_client_secret_ici
```

**Envoyez-moi ces valeurs** et je les configurerai automatiquement dans le projet !

---

## ❓ Questions Fréquentes

**Q: Pourquoi Google me demande SHA-1 ?**  
R: C'est une erreur courante. SHA-1 est pour Android. Choisissez bien "Web application" comme type, pas "Android".

**Q: Je n'ai pas de site web pour GitHub, que mettre ?**  
R: Mettez `http://localhost:3000` - c'est parfait pour le développement local.

**Q: Les clés OAuth sont-elles sécurisées ?**  
R: Le Client Secret doit rester secret et ne sera jamais exposé côté client. Il sera uniquement dans le fichier `.env` du backend.

**Q: Dois-je vraiment configurer GitHub OAuth ?**  
R: Non, c'est optionnel. Google OAuth suffit pour commencer. Vous pouvez ajouter GitHub plus tard.
