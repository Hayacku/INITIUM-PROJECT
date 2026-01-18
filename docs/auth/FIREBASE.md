# Firebase Integration

Configure Firebase for Google OAuth authentication and analytics in INITIUM.

## Overview

Firebase provides:
- **Authentication**: Google Sign-In via Firebase Auth
- **Analytics**: User behavior tracking (optional)

## Setup

### Step 1: Enable Google Sign-In in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (e.g., `initium-c6948`)
3. Navigate to **Authentication** → **Sign-in method** tab
4. Find **Google** in the providers list
5. Click to enable
6. Toggle **Enable**
7. Fill required fields:
   - **Project support email**: Your email
   - **Project public-facing name**: INITIUM
8. Click **Save**

✅ Firebase automatically creates OAuth credentials!

### Step 2: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. If no web app exists, click **Add app** → Web (</>) icon
4. Register app with nickname `INITIUM Web`
5. Copy the `firebaseConfig` object

Example:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAbc...",
  authDomain: "initium-c6948.firebaseapp.com",
  projectId: "initium-c6948",
  storageBucket: "initium-c6948.firebasestorage.app",
  messagingSenderId: "867635326049",
  appId: "1:867635326049:web:..."
};
```

### Step 3: Configure Frontend Environment

Add to `app/frontend/.env`:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyAbc...
REACT_APP_FIREBASE_AUTH_DOMAIN=initium-c6948.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=initium-c6948
REACT_APP_FIREBASE_STORAGE_BUCKET=initium-c6948.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=867635326049
REACT_APP_FIREBASE_APP_ID=1:867635326049:web:...
```

### Step 4: Get OAuth Credentials for Backend

Firebase creates OAuth credentials automatically, but backend needs them separately:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project (`initium-c6948`)
3. Navigate to **APIs & Services** → **Credentials**
4. Look for "Web client (auto created by Google Service)"
   - This is the OAuth client Firebase created
   - You can use this OR create a new one
5. For INITIUM, create new one: **+ CREATE CREDENTIALS** → **OAuth client ID**
   - See [OAuth Setup Guide](./OAUTH_SETUP.md) for detailed steps

## Verification

### Test Firebase Connection

1. Start backend and frontend
2. Open browser console (F12)
3. Go to http://localhost:3000
4. Check console for Firebase initialization
5. Should see no Firebase-related errors

### Test Google Sign-In

1. Click **Sign in with Google** on auth page
2. Select Google account
3. Should successfully authenticate and redirect to dashboard

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"

**Cause**: Missing or incorrect Firebase config in `.env`

**Fix**: Verify all `REACT_APP_FIREBASE_*` variables are set correctly

### "Firebase: API key not valid"

**Cause**: Incorrect `REACT_APP_FIREBASE_API_KEY`

**Fix**: Copy exact API key from Firebase Console → Project Settings

### "This domain is not authorized"

**Cause**: Domain not whitelisted in Firebase

**Fix**:
1. Firebase Console → **Authentication** → **Settings** tab
2. **Authorized domains**: Add `localhost` (should be there by default)

### Google Sign-In Popup Closes Immediately

**Cause**: Redirect URIs not configured in Google Cloud Console

**Fix**: See [OAuth Setup Guide](./OAUTH_SETUP.md) - ensure all redirect URIs are added

## Optional: Firebase Analytics

Firebase Analytics is auto-initialized if configured. To disable:

Comment out analytics in `app/frontend/src/firebase.js`:

```javascript
// const analytics = getAnalytics(app);
// export { analytics };
```

Or leave `.env` Firebase variables empty - app will work in guest mode without Firebase.

## Production Configuration

When deploying:

1. **Firebase Console** → **Authentication** → **Settings** → **Authorized domains**
   - Add your  Vercel domain: `your-app.vercel.app`

2. **Google Cloud Console** → Update OAuth client redirect URIs:
   - Add: `https://your-app.vercel.app/auth/callback`

## Security Notes

- Firebase API key is public and safe to expose in frontend
- OAuth Client Secret (backend) must remain private
- Never commit `.env` files to Git
