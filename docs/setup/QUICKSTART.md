# Quick Start Guide - INITIUM

Complete setup guide to get INITIUM running in minutes.

## Prerequisites

**Required**:
- Node.js 18+ ([download](https://nodejs.org/))
- Python 3.11+ 
- MongoDB (local or cloud)

**Installed Tools**:
- ✅ Node.js v25.2.1
- ✅ Python 3.14.0
- ✅ Yarn 1.22.22

## Setup Steps

### 1. Choose MongoDB Option

#### Option A: MongoDB Atlas (Recommended - Cloud)

**Advantages**: No local installation, accessible anywhere, production-ready, free tier (512MB)

**Steps** (10 minutes):

1. **Create MongoDB Atlas Account**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Create free account
   - Choose "Free" M0 cluster
   - Region: Europe (Paris/Frankfurt)
   - Cluster name: `initium-cluster`

2. **Configure Security**
   - **Database Access** → Add New Database User
     - Username: `initium_admin`
     - Password: (choose secure password)
     - Role: Atlas Admin
   - **Network Access** → Add IP Address
     - Allow Access from Anywhere: `0.0.0.0/0`

3. **Get Connection String**
   - Databases → Connect → Connect your application
   - Driver: Python 3.11+
   - Copy connection string: `mongodb+srv://initium_admin:<password>@cluster0.xxxxx.mongodb.net/`
   - Replace `<password>` with your actual password

#### Option B: MongoDB Local (Development)

**Steps** (20 minutes):

1. Download MongoDB Community from https://www.mongodb.com/try/download/community
2. Install with "Complete" option, check "Install as Service"
3. Create data directory: `mkdir C:\data\db`
4. Start MongoDB: `mongod --dbpath C:\data\db`

### 2. Configure Environment Variables

#### Backend `.env`
Create `c:\INITIUM\app\backend\.env`:

```env
# MongoDB
MONGO_URL=mongodb://localhost:27017
# OR for Atlas:
# MONGO_URL=mongodb+srv://initium_admin:PASSWORD@cluster0.xxxxx.mongodb.net/

DB_NAME=initium_db

# Security
SECRET_KEY=YourVeryLongRandomSecretKey123456789

# CORS
CORS_ORIGINS=http://localhost:3000

# Environment
ENV=development
```

#### Frontend `.env`
Create `c:\INITIUM\app\frontend\.env`:

```env
# Backend API
REACT_APP_API_URL=http://localhost:8000

# Firebase (optional - leave empty for guest mode)
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
```

### 3. Install Dependencies

#### Backend:
```powershell
cd c:\INITIUM\app\backend
pip install -r requirements.txt
```

#### Frontend:
```powershell
cd c:\INITIUM\app\frontend
yarn install
```

### 4. Launch Application

Open **two terminals** (three if using local MongoDB):

#### Terminal 1: Backend
```powershell
cd c:\INITIUM\app\backend
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

Verify: http://localhost:8000/api should show `{"status": "operational", ...}`

#### Terminal 2: Frontend
```powershell
cd c:\INITIUM\app\frontend
yarn start
```

Automatically opens: http://localhost:3000

### 5. Test the Application

1. Go to http://localhost:3000
2. Click **"Continuer en mode invité"** (Continue as Guest)
3. Verify:
   - ✅ Dashboard displays
   - ✅ "MODE INVITÉ" banner visible
   - ✅ Navigation works
   - ✅ Can add quests and habits
   - ✅ Data persists after refresh

## Troubleshooting

### MongoDB Connection Failed

**Atlas**: Check connection string, password (no `<>`), and IP whitelist (`0.0.0.0/0`)

**Local**: Ensure `mongod` is running and `.env` has `MONGO_URL=mongodb://localhost:27017`

### Backend Won't Start: "KeyError: 'MONGO_URL'"

Verify `.env` file exists in `app/backend/` with required variables.

### Frontend White Screen

1. Open DevTools (F12)
2. Check Console for errors
3. If import errors: run `yarn install`
4. Restart: `Ctrl+C` then `yarn start`

### Firebase Warnings

```
⚠️ Firebase non configuré - OAuth Google désactivé
```

This is **normal and OK** - Guest mode works without Firebase. To enable Google OAuth, see [Firebase Integration](../auth/FIREBASE.md).

## Next Steps

- **Use guest mode** to explore all features
- **[Configure OAuth](../auth/OAUTH_SETUP.md)** for Google/GitHub login
- **[Deploy to production](../deployment/PRODUCTION.md)** (Render + Vercel + Atlas)

## Quick Reference Commands

```powershell
# Start MongoDB (if local)
mongod --dbpath C:\data\db

# Backend (Terminal 1)
cd c:\INITIUM\app\backend
uvicorn server:app --reload --port 8000

# Frontend (Terminal 2)
cd c:\INITIUM\app\frontend
yarn start

# Open http://localhost:3000 → "Continuer en mode invité"
```
