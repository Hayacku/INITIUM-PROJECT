@echo off
setlocal
title INITIUM - One-Click Starter

:: Configuration simple
set "PROJ_DIR=%~dp0"
set "BACKEND_DIR=%PROJ_DIR%app\backend"
set "FRONTEND_DIR=%PROJ_DIR%app\frontend"
set "BACKEND_PORT=8000"
set "FRONTEND_PORT=3000"
set "HEALTH_URL=http://localhost:8000/api/"

echo ==================================================
echo           INITIUM - DEMARRAGE COMPLET
echo ==================================================
echo.

:: 1. Verification des prerequis
echo [INFO] Verification des outils...

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Python n'est pas installe.
    pause
    exit /b 1
)

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe.
    pause
    exit /b 1
)

echo [OK] Outils detectes.
echo.

:: 2. Backend
echo ==================================================
echo    1/2 - BACKEND (FastAPI)
echo ==================================================
cd /d "%BACKEND_DIR%"

if not exist ".venv" (
    echo [INFO] Creation venv...
    python -m venv .venv
)

echo [INFO] Installation des dependances...
call .venv\Scripts\activate.bat
pip install -r requirements.txt

echo [INFO] Lancement du Backend...
start "INITIUM BACKEND" cmd /k "title INITIUM BACKEND && cd /d "%BACKEND_DIR%" && call .venv\Scripts\activate.bat && uvicorn server:app --reload --host 0.0.0.0 --port %BACKEND_PORT%"

echo.

:: 3. Frontend
echo ==================================================
echo    2/2 - FRONTEND (React)
echo ==================================================
cd /d "%FRONTEND_DIR%"

if not exist "node_modules" (
    echo [INFO] Installation des dependances frontend...
    npm install
)

echo [INFO] Lancement du Frontend...
start "INITIUM FRONTEND" cmd /k "title INITIUM FRONTEND && cd /d "%FRONTEND_DIR%" && npm start"

echo.

:: 4. Finalisation
echo ==================================================
echo    OUVERTURE DU NAVIGATEUR
echo ==================================================
echo.
echo [INFO] Attente du backend...

:wait_loop
powershell -Command "try { $r = Invoke-WebRequest -Uri '%HEALTH_URL%' -UseBasicParsing -TimeoutSec 2; exit 0 } catch { exit 1 }"
if %errorlevel% neq 0 (
    echo [INFO] Patience... encore quelques secondes...
    timeout /t 3 >nul
    goto wait_loop
)

echo [OK] Serveur pret.
echo [INFO] Ouverture de votre navigateur...
start http://localhost:%FRONTEND_PORT%

echo.
echo ==================================================
echo             INITIUM EST PRET !
echo ==================================================
echo.
echo  Backend:  http://localhost:%BACKEND_PORT%/docs
echo  Frontend: http://localhost:%FRONTEND_PORT%
echo.
timeout /t 10
exit
