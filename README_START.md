# 🚀 Démarrage Rapide INITIUM

## Méthode 1: Double-clic (Plus Simple)

**Windows Explorer**:
1. Double-cliquez sur `start.bat`
2. Deux fenêtres PowerShell s'ouvriront automatiquement
3. Attendez que l'application démarre (~30 secondes)
4. Accédez à http://localhost:3000

## Méthode 2: PowerShell

**Depuis PowerShell**:
```powershell
.\start.ps1
```

## Méthode 3: Workflow Antigravity

**Dans l'agent**:
```
/init
```

---

## 🛑 Arrêter l'Application

Fermez simplement les deux fenêtres PowerShell qui ont été ouvertes:
- Fenêtre "Backend FastAPI"
- Fenêtre "Frontend React"

Ou utilisez `Ctrl+C` dans chaque fenêtre.

---

## 📍 URLs de l'Application

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8000 |
| **API Documentation** | http://localhost:8000/docs |
| **OpenAPI Schema** | http://localhost:8000/openapi.json |

---

## 🔧 Prérequis

Assurez-vous d'avoir:

✅ **Python 3.9+** installé  
✅ **Node.js 16+** et npm installés  
✅ **Variables d'environnement** configurées:
   - `app/backend/.env` (MongoDB, Firebase, etc.)
   - `app/frontend/.env` (React app config)

---

## ❓ Dépannage

### Le script ne démarre pas

1. **Vérifier les permissions PowerShell**:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Vérifier Python**:
   ```powershell
   python --version
   ```

3. **Vérifier Node.js**:
   ```powershell
   node --version
   npm --version
   ```

### Backend ne démarre pas

- Vérifier que le virtual environment est activé
- Installer les dépendances:
  ```powershell
  cd app\backend
  pip install -r requirements.txt
  ```

### Frontend ne démarre pas

- Réinstaller node_modules:
  ```powershell
  cd app\frontend
  rm -r node_modules
  npm install
  ```

---

## 💡 Conseils

- **Premier démarrage**: Peut prendre 1-2 minutes (installation dépendances)
- **Démarrages suivants**: ~10-20 secondes
- **Hot reload**: Les modifications de code sont détectées automatiquement
- **Ports utilisés**: 3000 (frontend), 8000 (backend)

---

**Besoin d'aide?** Consultez la [documentation complète](./docs/setup/QUICKSTART.md)
