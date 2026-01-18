# Script de Diagnostic INITIUM
# Vérifie la configuration et l'état du projet

Write-Host "🔍 DIAGNOSTIC INITIUM - $(Get-Date -Format 'dd/MM/yyyy HH:mm')" -ForegroundColor Cyan
Write-Host "=" * 60

# 1. Vérifier Node.js
Write-Host "`n📦 Node.js:" -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✅ Installé: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Non installé" -ForegroundColor Red
}

# 2. Vérifier Python
Write-Host "`n🐍 Python:" -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "  ✅ Installé: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Non installé" -ForegroundColor Red
}

# 3. Vérifier Yarn
Write-Host "`n📦 Yarn:" -ForegroundColor Yellow
try {
    $yarnVersion = yarn --version
    Write-Host "  ✅ Installé: v$yarnVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Non installé" -ForegroundColor Red
}

# 4. Vérifier fichiers .env
Write-Host "`n⚙️  Fichiers de configuration:" -ForegroundColor Yellow

$backendEnv = "c:\INITIUM\app\backend\.env"
if (Test-Path $backendEnv) {
    Write-Host "  ✅ Backend .env existe" -ForegroundColor Green
    $content = Get-Content $backendEnv -Raw
    if ($content -match "MONGO_URL=") {
        Write-Host "     ✅ MONGO_URL configuré" -ForegroundColor Green
    } else {
        Write-Host "     ❌ MONGO_URL manquant" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ Backend .env manquant" -ForegroundColor Red
}

$frontendEnv = "c:\INITIUM\app\frontend\.env"
if (Test-Path $frontendEnv) {
    Write-Host "  ✅ Frontend .env existe" -ForegroundColor Green
    $content = Get-Content $frontendEnv -Raw
    if ($content -match "REACT_APP_API_URL=") {
        Write-Host "     ✅ REACT_APP_API_URL configuré" -ForegroundColor Green
    } else {
        Write-Host "     ❌ REACT_APP_API_URL manquant" -ForegroundColor Red
    }
    if ($content -match "REACT_APP_FIREBASE_API_KEY=.+") {
        Write-Host "     ✅ Firebase configuré" -ForegroundColor Green
    } else {
        Write-Host "     ⚠️  Firebase non configuré (mode invité uniquement)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ❌ Frontend .env manquant" -ForegroundColor Red
}

# 5. Vérifier dépendances backend
Write-Host "`n📚 Dépendances Backend:" -ForegroundColor Yellow
$backendPackages = @("fastapi", "uvicorn", "motor", "pydantic", "email-validator")
foreach ($package in $backendPackages) {
    try {
        $result = pip show $package 2>&1
        if ($result -match "Name: $package") {
            Write-Host "  ✅ $package installé" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $package manquant" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ❌ $package manquant" -ForegroundColor Red
    }
}

# 6. Vérifier dépendances frontend
Write-Host "`n📚 Dépendances Frontend:" -ForegroundColor Yellow
if (Test-Path "c:\INITIUM\app\frontend\node_modules") {
    Write-Host "  ✅ node_modules existe" -ForegroundColor Green
} else {
    Write-Host "  ❌ node_modules manquant - Exécutez: yarn install" -ForegroundColor Red
}

# 7. Vérifier ports
Write-Host "`n🔌 Ports:" -ForegroundColor Yellow
$port8001 = netstat -ano | Select-String ":8001"
if ($port8001) {
    Write-Host "  ✅ Port 8001 (Backend) en cours d'utilisation" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Port 8001 (Backend) libre - Serveur non lancé" -ForegroundColor Yellow
}

$port3000 = netstat -ano | Select-String ":3000"
if ($port3000) {
    Write-Host "  ✅ Port 3000 (Frontend) en cours d'utilisation" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Port 3000 (Frontend) libre - Serveur non lancé" -ForegroundColor Yellow
}

# 8. Vérifier fichiers critiques
Write-Host "`n📄 Fichiers critiques:" -ForegroundColor Yellow
$criticalFiles = @(
    "c:\INITIUM\app\backend\server.py",
    "c:\INITIUM\app\frontend\src\App.js",
    "c:\INITIUM\app\frontend\src\index.js",
    "c:\INITIUM\app\frontend\package.json"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $(Split-Path $file -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $(Split-Path $file -Leaf) manquant" -ForegroundColor Red
    }
}

# 9. Résumé
Write-Host "`n" + ("=" * 60)
Write-Host "📊 RÉSUMÉ" -ForegroundColor Cyan

$backendReady = (Test-Path $backendEnv) -and (Test-Path "c:\INITIUM\app\backend\server.py")
$frontendReady = (Test-Path $frontendEnv) -and (Test-Path "c:\INITIUM\app\frontend\src\App.js")

if ($backendReady -and $frontendReady) {
    Write-Host "`n✅ Configuration OK - Prêt à lancer !" -ForegroundColor Green
    Write-Host "`nCommandes de lancement:" -ForegroundColor Yellow
    Write-Host "  Terminal 1: cd c:\INITIUM\app\backend; uvicorn server:app --reload --port 8001"
    Write-Host "  Terminal 2: cd c:\INITIUM\app\frontend; yarn start"
} else {
    Write-Host "`n⚠️  Configuration incomplète" -ForegroundColor Yellow
    if (-not $backendReady) {
        Write-Host "  ❌ Backend: Vérifier .env et server.py" -ForegroundColor Red
    }
    if (-not $frontendReady) {
        Write-Host "  ❌ Frontend: Vérifier .env et App.js" -ForegroundColor Red
    }
}

Write-Host "`n📚 Documentation: c:\INITIUM\GUIDE_REPRISE.md" -ForegroundColor Cyan
Write-Host ("=" * 60)
