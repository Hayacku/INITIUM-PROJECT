# 🔧 Correction de la Configuration Render

Votre déploiement échoue car **Render pense que c'est un projet Node.js** (il essaie d'utiliser `yarn start`), alors que c'est un projet **Python**.

Cela arrive si on clique sur "Web Service" au lieu de "Blueprint", ou si la détection automatique s'est trompée.

## Pas à Pas pour Corriger

Allez sur votre tableau de bord [Render.com](https://dashboard.render.com/) et cliquez sur votre service `initium-backend`.

### 1. Changer le type d'Environnement

1. Cliquez sur l'onglet **Settings** dans le menu de gauche.
2. Descendez jusqu'à la section **Runtime**.
3. Il est probablement sur "Node". Changez-le pour **Python 3**.

### 2. Vérifier le Dossier Racine (Root Directory)

1. Toujours dans **Settings**, cherchez **Root Directory**.
2. Par défaut, il est peut-être vide ou sur `./`.
3. Changez-le pour : `app/backend`
   - C'est **très important** car c'est là que se trouve le fichier `requirements.txt`.

### 3. Vérifier les Commandes

Une fois le dossier racine changé, vérifiez les commandes juste en dessous :

*   **Build Command** : doit être `pip install -r requirements.txt`
*   **Start Command** : doit être `uvicorn server:app --host 0.0.0.0 --port $PORT`

### 4. Sauvegarder et Redéployer

1. Cliquez sur **Save Changes**.
2. Render devrait relancer un déploiement automatiquement.
3. Si ce n'est pas le cas, cliquez sur le bouton bleu **Manual Deploy** en haut à droite > **Deploy latest commit**.

### 5. Vérification Finale

Regardez les logs. Vous devriez voir :
- `Using Python version 3.x.x`
- `pip install -r requirements.txt` ... (installation des librairies)
- `Build successful`
- `Uvicorn running on http://0.0.0.0:10000`

Une fois que vous voyez "Live", retournez au guide précédent pour configurer l'URL dans Vercel !
