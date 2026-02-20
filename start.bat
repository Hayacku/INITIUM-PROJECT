@echo off
setlocal
title Connecteur de demarrage INITIUM

echo ==============================================
echo       LANCEMENT DE INITIUM (FULL STACK)
echo ==============================================
echo.
echo [1/2] Lancement du Backend (FastAPI)...
start "INITIUM BACKEND" cmd /k "cd /d %~dp0app\backend && IF NOT EXIST .venv (echo Creation venv... & python -m venv .venv) && echo Activation venv... & call .venv\Scripts\activate && echo Installation dependances... & pip install -r requirements.txt && echo Demarrage serveur... & uvicorn server:app --reload --port 8000"

echo [2/2] Lancement du Frontend (React)...
start "INITIUM FRONTEND" cmd /k "cd /d %~dp0app\frontend && echo Installation dependances (si necessaire)... && npm install && echo Demarrage React... && npm start"

echo.
echo ==============================================
echo    APPLICATION LANCEE !
echo ==============================================
echo    Backend: http://localhost:8000/docs
echo    Frontend: http://localhost:3000
echo.
echo    Vous pouvez reduire cette fenetre.
echo ==============================================
timeout /t 5 >nul
exit
