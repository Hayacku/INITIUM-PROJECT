# OAuth Setup Guide

Configure Google and GitHub OAuth for INITIUM authentication.

## Overview

INITIUM supports two OAuth providers:
- **Google OAuth** (Primary) - Via Firebase Authentication
- **GitHub OAuth** (Optional) - Direct integration

## Prerequisites

- Firebase project (see [Firebase Integration](./FIREBASE.md))
- Google Cloud Console access
- (Optional) GitHub account for GitHub OAuth

## Google OAuth Setup

### Step 1: Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project (e.g., `initium-c6948`)

### Step 2: Configure Consent Screen (First Time Only)

1. Navigate to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (allows any Google account to test)
3. Fill required fields:
   - **App name**: INITIUM
   - **User support email**: your email
   - **Developer contact**: your email
4. Click **Save and Continue** through all steps
5. Return to **Dashboard**

### Step 3: Create OAuth Client ID

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. **Application type**: **Web application**
4. **Name**: `INITIUM Web Client`
5. **Authorized JavaScript origins** - Add:
   ```
   http://localhost:3000
   http://localhost:8000
   https://initium-c6948.firebaseapp.com
   ```
6. **Authorized redirect URIs** - Add:
   ```
   https://initium-c6948.firebaseapp.com/__/auth/handler
   http://localhost:3000/auth/callback
   http://localhost:3000
   ```
7. Click **CREATE**

### Step 4: Copy Credentials

After creation, you'll see:
- **Client ID**: `123456789-abc...apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abc...xyz`

⚠️ **Save these immediately** - you'll need them for configuration.

### Step 5: Configure Backend Environment

Add to `app/backend/.env`:

```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret_here
```

### Step 6: Restart Backend

```powershell
cd c:\INITIUM\app\backend
# Ctrl+C to stop, then:
uvicorn server:app --reload --port 8000
```

## GitHub OAuth Setup (Optional)

### Step 1: Create OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill form:
   ```
   Application name: INITIUM Local Dev
   Homepage URL: http://localhost:3000
   Application description: INITIUM productivity app
   Authorization callback URL: http://localhost:3000/auth/github/callback
   ```
4. Click **Register application**

### Step 2: Generate Client Secret

1. On your OAuth App page, click **Generate a new client secret**
2. ⚠️ **Copy immediately** - it's shown only once!

### Step 3: Copy Credentials

You now have:
- **Client ID**: (displayed on page)
- **Client Secret**: (copied from step 2)

### Step 4: Configure Backend Environment

Add to `app/backend/.env`:

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## Verification

### Test Google OAuth

1. Start backend and frontend
2. Go to http://localhost:3000
3. Click **Sign in with Google**
4. Select Google account
5. Should redirect to dashboard with user logged in

**Expected**: User profile shows Google avatar and name

### Test GitHub OAuth (if configured)

1. Go to http://localhost:3000
2. Click **Sign in with GitHub**
3. Authorize INITIUM app
4. Should redirect to dashboard

## Troubleshooting

### "Invalid Google ID token"

**Cause**: Missing redirect URI in Google Cloud Console

**Fix**: Verify all redirect URIs are added, especially:
```
https://initium-c6948.firebaseapp.com/__/auth/handler
```

Wait 1-2 minutes after saving for changes to propagate.

### "Google OAuth not configured"

**Cause**: Backend hasn't loaded `.env` file

**Fix**: 
1. Verify `.env` file exists in `app/backend/`
2. Restart backend (Ctrl+C then rerun uvicorn)

### CORS Error

**Cause**: JavaScript origin not whitelisted

**Fix**: Add to Google Cloud Console Authorized JavaScript origins:
```
http://localhost:3000
https://initium-c6948.firebaseapp.com
```

## Production Configuration

When deploying to production:

1. **Google Cloud Console**: Add production URLs
   - JavaScript origins: `https://your-app.vercel.app`
   - Redirect URIs: `https://your-app.vercel.app/auth/callback`
   
2. **GitHub OAuth App**: Create separate production app or update existing:
   - Homepage URL: `https://your-app.vercel.app`
   - Callback URL: `https://your-app.vercel.app/auth/github/callback`

3. **Environment Variables**: Use  production-specific secrets on Render/Vercel

## FAQ

**Q: Why is Google asking for SHA-1?**
A: SHA1 is for Android apps only. Ensure you selected "Web application" as the application type.

**Q: Do I need GitHub OAuth?**
A: No, it's optional. Google OAuth is sufficient for most use cases.

**Q: Are OAuth secrets secure?**
A: Client secrets are stored in backend `.env` (gitignored) and never exposed to the frontend.

**Q: Can I test OAuth with a different Google account?**
A: Yes, if Consent Screen is set to "External", any Google account can sign in.
