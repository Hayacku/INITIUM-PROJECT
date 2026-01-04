# 🔧 DÉPANNAGE BACKEND - INITIUM

## ❌ Erreur : "email-validator is not installed"

### Symptôme
```
ImportError: email-validator is not installed, run `pip install pydantic[email]`
```

### Cause
Vous avez plusieurs versions de Python installées (3.13, 3.14) et `email-validator` n'est pas installé dans la version utilisée par `uvicorn`.

### ✅ Solution (DÉJÀ APPLIQUÉE)

J'ai installé `email-validator` dans toutes vos installations Python :

```powershell
# Python 3.14 (par défaut)
python -m pip install email-validator --user

# Python 3.13 (utilisé par uvicorn)
C:\Users\venan\AppData\Local\Programs\Python\Python313\python.exe -m pip install email-validator --user
```

### 🚀 Action requise

**Redémarrez le serveur backend** :

1. **Arrêtez** le serveur actuel : Appuyez sur **Ctrl+C** dans le terminal backend

2. **Relancez** :
   ```powershell
   cd c:\INITIUM\app\backend
   uvicorn server:app --reload --host 0.0.0.0 --port 8001
   ```

3. **Vérifiez** : Vous devriez voir
   ```
   INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
   INFO:     Started reloader process [xxxx] using WatchFiles
   INFO:     Started server process [xxxx]
   INFO:     Waiting for application startup.
   INFO:     Application startup complete.
   ```

4. **Testez** : Ouvrir http://localhost:8001/api dans votre navigateur
   - Doit afficher : `{"message": "INITIUM API v2.0", ...}`

---

## ❌ Erreur : "Failed to connect to MongoDB"

### Solution rapide

Vérifiez votre `.env` backend :

```powershell
# Ouvrir le fichier
notepad c:\INITIUM\app\backend\.env
```

**Vérifiez la ligne MONGO_URL** :
```env
# Si MongoDB Atlas :
MONGO_URL=mongodb+srv://initium_admin:26353249Victor@cluster0.rdlt4yv.mongodb.net/?appName=Cluster0

# IMPORTANT : Retirez les <> autour du mot de passe !
# ❌ FAUX : mongodb+srv://initium_admin:<26353249Victor>@...
# ✅ BON : mongodb+srv://initium_admin:26353249Victor@...
```

**Puis redémarrez le backend** (Ctrl+C puis relancer).

---

## ❌ Erreur : "ModuleNotFoundError: No module named 'xxx'"

### Solution

Installez la dépendance manquante :

```powershell
# Dans le terminal backend
pip install nom-du-module

# Ou pour être sûr (toutes les versions Python)
python -m pip install nom-du-module --user
C:\Users\venan\AppData\Local\Programs\Python\Python313\python.exe -m pip install nom-du-module --user
```

---

## ✅ Backend démarre mais erreurs au runtime

### Checklist

1. **MongoDB connecté** ?
   - Atlas : Vérifier IP whitelist (0.0.0.0/0)
   - Atlas : Vérifier user/password
   - Local : Service MongoDB lancé (`mongod --dbpath C:\data\db`)

2. **Variables .env correctes** ?
   ```env
   MONGO_URL=mongodb+srv://... (pas de <> !)
   DB_NAME=initium_db
   SECRET_KEY=dev_secret_key_change_in_production_12345678901234567890
   CORS_ORIGINS=http://localhost:3000
   ```

3. **Ports libres** ?
   - Port 8001 ne doit pas être utilisé par autre chose
   - Vérifier : `netstat -ano | findstr :8001`
   - Si occupé : `taskkill /PID <PID> /F`

---

## 🎯 COMMANDES UTILES

### Vérifier version Python utilisée
```powershell
python --version
C:\Users\venan\AppData\Local\Programs\Python\Python313\python.exe --version
```

### Lister packages installés
```powershell
pip list | findstr email
pip list | findstr pydantic
```

### Tester connexion MongoDB
```powershell
# Si MongoDB Atlas, remplacer par votre URL
mongosh "mongodb+srv://initium_admin:26353249Victor@cluster0.rdlt4yv.mongodb.net/"
```

### Logs backend détaillés
```powershell
# Lancer avec logs debug
uvicorn server:app --reload --log-level debug --port 8001
```

---

## 📞 SI LE PROBLÈME PERSISTE

1. **Vérifier les logs** exacts de l'erreur
2. **Copier** le message d'erreur complet
3. **Vérifier** les fichiers :
   - `app/backend/.env` existe et contient les bonnes valeurs
   - `app/backend/server.py` n'a pas d'erreurs de syntaxe

---

**Status** : ✅ `email-validator` installé dans Python 3.13 et 3.14  
**Action** : Redémarrer le backend avec Ctrl+C puis relancer uvicorn
