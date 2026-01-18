# Production Deployment Guide

Deploy INITIUM to production using free tier services: MongoDB Atlas (database), Render (backend), and Vercel (frontend).

## Prerequisites

- GitHub account with INITIUM repository
- MongoDB Atlas account
- Render account
- Vercel account

## Architecture

```
User → Vercel (Frontend) → Render (Backend) → MongoDB Atlas (Database)
```

## Step 1: Database - MongoDB Atlas

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create free M0 Sandbox cluster
3. **Database Access**: Add user (e.g., `initium_admin` / `secure_password`)
4. **Network Access**: Add IP `0.0.0.0/0` (allow all - for dev/testing)
5. **Connect** → **Drivers** → Copy connection string:
   ```
   mongodb+srv://initium_admin:PASSWORD@cluster0.xyz.mongodb.net/
   ```
   ⚠️ Replace `PASSWORD` with your actual password

## Step 2: Backend - Render

1. Go to [Render.com](https://render.com/) and sign in with GitHub
2. **New** → **Web Service**
3. Select your INITIUM repository
4. Render will auto-detect `render.yaml` configuration
5. **Environment Variables** (critical):
   ```
   MONGO_URL = mongodb+srv://initium_admin:PASSWORD@cluster0.xyz.mongodb.net/
   DB_NAME = initium_production
   SECRET_KEY = YourVeryLongRandomSecretKey123456789XYZ
   CORS_ORIGINS = https://your-app.vercel.app,http://localhost:3000
   ENV = production
   
   # OAuth (optional)
   GOOGLE_CLIENT_ID = your_google_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET = your_google_client_secret
   ```
6. **Deploy**
7. Copy your backend URL: `https://initium-backend.onrender.com`
8. **Verify**: Visit `https://initium-backend.onrender.com/api` 
   - Should show: `{"status": "operational", ...}`

## Step 3: Frontend - Vercel

1. Go to [Vercel.com](https://vercel.com/) and sign in
2. **Add New Project** → Import GitHub repository
3. **Framework Preset**: Create React App (auto-detected)
4. **Root Directory**: Click "Edit" → Select `app/frontend`
5. **Environment Variables** (critical):
   ```
   REACT_APP_API_URL = https://initium-backend.onrender.com
   
   # Firebase (optional for OAuth)
   REACT_APP_FIREBASE_API_KEY = your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN = your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID = your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET = your-project.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID = 123456789
   REACT_APP_FIREBASE_APP_ID = 1:123456789:web:abcdef123456
   ```
6. **Deploy**
7. Vercel will give you URL: `https://initium-app.vercel.app`

## Step 4: Update CORS on Render

**Critical**: After getting Vercel URL, update Render backend:

1. Render Dashboard → Your service → **Environment**
2. Find `CORS_ORIGINS` → **Edit**
3. Update value: `https://your-vercel-app.vercel.app,http://localhost:3000`
4. **Save** → Service will auto-redeploy

## Verification Checklist

- [ ] Visit your Vercel URL
- [ ] Click "Continuer en mode invité" (guest mode)
- [ ] Dashboard loads without errors
- [ ] Can create quests/habits
- [ ] Data persists after refresh
- [ ] Check browser console for no CORS errors

## Troubleshooting

### Frontend can't connect to Backend

**Symptom**: Network errors, CORS errors in console

**Check**:
1. `REACT_APP_API_URL` on Vercel matches Render URL exactly (no trailing `/`)
2. `CORS_ORIGINS` on Render includes your Vercel URL
3. Redeploy Vercel after changing environment variables

### Backend "Application Error"

**Check Render Logs**:
1. Render Dashboard → Your service → **Logs**
2. Look for MongoDB connection errors
3. Verify `MONGO_URL` is correct (password, cluster name)

### MongoDB Connection Failed

**Check**:
1. MongoDB Atlas → **Network Access**: `0.0.0.0/0` is whitelisted
2. Database user exists with correct password
3. Connection string format is correct

## Post-Deployment

### Custom Domain (Optional)
- Vercel: **Settings** → **Domains** → Add custom domain
- Update `CORS_ORIGINS` on Render to include new domain

### Environment Variables Updates
After changing any environment variable:
- **Vercel**: Must redeploy (Deployments → ••• → Redeploy)
- **Render**: Auto-redeploys on save

### Monitoring
- **Render**: Free tier sleeps after 15min inactivity (cold start ~30s)
- **MongoDB Atlas**: Monitor usage in Atlas dashboard
- **Vercel**: Check Analytics for traffic/errors

## Security Recommendations

Before production launch:
- [ ] Change MongoDB password to very strong password
- [ ] Restrict MongoDB Network Access to Render IP only
- [ ] Use environment-specific `SECRET_KEY` (different from dev)
- [ ] Enable MongoDB backup
- [ ] Set up error monitoring (Sentry)
