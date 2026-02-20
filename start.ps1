#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Demarre INITIUM (Backend FastAPI + Frontend React) en un seul clic

.DESCRIPTION
    Lance automatiquement:
    - Backend FastAPI sur http://localhost:8000
    - Frontend React sur http://localhost:3000
    
    Les deux services demarrent en parallele dans des fenetres PowerShell separees.
    
.EXAMPLE
    .\start.ps1
    Demarre l'application complete
    
.NOTES
    Prerequis:
    - Python avec uvicorn installe (backend)
    - Node.js avec npm installe (frontend)
    - Variables d'environnement configurees (.env files)
#>

# Configuration
$BackendPath = "app\backend"
$FrontendPath = "app\frontend"
$BackendPort = 8000
$FrontendPort = 3000

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "   INITIUM - Demarrage Rapide    " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verifier que nous sommes dans le bon repertoire
if (-not (Test-Path "app")) {
    Write-Host "[ERREUR] Veuillez executer ce script depuis la racine du projet INITIUM" -ForegroundColor Red
    pause
    exit 1
}

# Verifier les prerequis
Write-Host "[INFO] Verification des prerequis..." -ForegroundColor Yellow

# Verifier Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[OK] Python: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "[ERREUR] Python n'est pas installe ou non disponible dans PATH" -ForegroundColor Red
    pause
    exit 1
}

# Verifier Node.js
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "[ERREUR] Node.js n'est pas installe ou non disponible dans PATH" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "[INFO] Verification des installations..." -ForegroundColor Yellow

# Verifier backend dependencies
if (-not (Test-Path "$BackendPath\.venv")) {
    Write-Host "[WARN] Virtual environment non trouve. Creation en cours..." -ForegroundColor Yellow
    python -m venv "$BackendPath\.venv"
    Write-Host "[OK] Virtual environment cree" -ForegroundColor Green
    
    # Installer les dependances
    Write-Host "[INFO] Installation des dependances Python..." -ForegroundColor Yellow
    & "$BackendPath\.venv\Scripts\python.exe" -m pip install --upgrade pip
    & "$BackendPath\.venv\Scripts\python.exe" -m pip install -r "$BackendPath\requirements.txt"
    Write-Host "[OK] Dependencies backend installees" -ForegroundColor Green
}

# Verifier frontend dependencies
if (-not (Test-Path "$FrontendPath\node_modules")) {
    Write-Host "[WARN] node_modules non trouve. Installation en cours..." -ForegroundColor Yellow
    Push-Location $FrontendPath
    npm install
    Pop-Location
    Write-Host "[OK] Dependencies frontend installees" -ForegroundColor Green
}

Write-Host ""
Write-Host "[INFO] Lancement des services..." -ForegroundColor Cyan
Write-Host ""

# Demarrer Backend dans une nouvelle fenetre PowerShell
Write-Host "[BACKEND] Ouverture dans une nouvelle fenetre..." -ForegroundColor Magenta

$BackendCommand = @"
Write-Host '======================================' -ForegroundColor Magenta
Write-Host '   INITIUM Backend - FastAPI          ' -ForegroundColor Magenta
Write-Host '======================================' -ForegroundColor Magenta
Write-Host ''
Write-Host 'Port: $BackendPort' -ForegroundColor Gray
Write-Host 'URL:  http://localhost:$BackendPort' -ForegroundColor Gray
Write-Host 'Docs: http://localhost:$BackendPort/docs' -ForegroundColor Gray
Write-Host ''
cd '$PWD\$BackendPath'
if (Test-Path '.venv\Scripts\Activate.ps1') {
    & .venv\Scripts\Activate.ps1
} else {
    Write-Host '[WARN] Virtual environment non trouve, utilisation Python global' -ForegroundColor Yellow
}
uvicorn server:app --reload --port $BackendPort --host 0.0.0.0
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $BackendCommand

# Attendre 2 secondes pour que le backend demarre
Start-Sleep -Seconds 2

# Demarrer Frontend dans une nouvelle fenetre PowerShell
Write-Host "[FRONTEND] Ouverture dans une nouvelle fenetre..." -ForegroundColor Cyan

$FrontendCommand = @"
Write-Host '======================================' -ForegroundColor Cyan
Write-Host '   INITIUM Frontend - React           ' -ForegroundColor Cyan
Write-Host '======================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Port: $FrontendPort' -ForegroundColor Gray
Write-Host 'URL:  http://localhost:$FrontendPort' -ForegroundColor Gray
Write-Host ''
cd '$PWD\$FrontendPath'
`$env:PORT = '$FrontendPort'
npm start
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $FrontendCommand

Write-Host ""
Write-Host "[OK] Services en cours de demarrage!" -ForegroundColor Green
Write-Host ""
Write-Host "==================================" -ForegroundColor Yellow
Write-Host "  URLs de l'application:" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow
Write-Host "  Backend:  http://localhost:$BackendPort" -ForegroundColor White
Write-Host "  Frontend: http://localhost:$FrontendPort" -ForegroundColor White
Write-Host "  API Docs: http://localhost:$BackendPort/docs" -ForegroundColor White
Write-Host ""
Write-Host "[INFO] Attendez quelques secondes que les services demarrent" -ForegroundColor Gray
Write-Host "[INFO] Pour arreter: Fermez les fenetres PowerShell ou Ctrl+C" -ForegroundColor Gray
Write-Host ""
Write-Host "INITIUM est pret! Bon developpement!" -ForegroundColor Green
Write-Host ""
