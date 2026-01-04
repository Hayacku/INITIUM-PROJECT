# 🚀 Solution Rapide : Démarrer MongoDB

## Option 1 : Utiliser MongoDB Compass (Le Plus Simple)

Si vous avez MongoDB Compass installé :

1. **Ouvrez MongoDB Compass**
2. **Connectez-vous** à `mongodb://localhost:27017`
3. MongoDB démarre automatiquement en arrière-plan

## Option 2 : Démarrer MongoDB Manuellement

### Étape 1 : Trouver MongoDB

Cherchez MongoDB dans ces emplacements :
```powershell
C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe
C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe
C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe
```

### Étape 2 : Créer le Dossier de Données

```powershell
mkdir C:\data\db
```

### Étape 3 : Démarrer MongoDB

**Ouvrez un NOUVEAU terminal PowerShell** et tapez :

```powershell
& "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath C:\data\db
```

**Remplacez `7.0`** par votre version de MongoDB.

**Laissez ce terminal ouvert** - MongoDB doit rester en cours d'exécution.

## Option 3 : MongoDB n'est PAS Installé

### Télécharger et Installer MongoDB

1. **Téléchargez** : https://www.mongodb.com/try/download/community
2. **Installez** avec les options par défaut
3. **Cochez** "Install MongoDB as a Service"
4. **Redémarrez** votre ordinateur
5. MongoDB démarrera automatiquement

## ✅ Vérifier que MongoDB Fonctionne

Dans un nouveau terminal :
```powershell
netstat -an | findstr 27017
```

Vous devriez voir :
```
TCP    0.0.0.0:27017    0.0.0.0:0    LISTENING
```

## 🎯 Après MongoDB Démarré

1. Rechargez http://localhost:3000
2. Cliquez sur "Google"
3. Authentifiez-vous
4. **Ça devrait fonctionner !** 🎉

---

**Besoin d'aide ?** Dites-moi quelle option vous choisissez et je vous guiderai !
