# MongoDB Setup

Configure MongoDB for INITIUM database (local or cloud).

## Overview

INITIUM uses MongoDB to store:
- User accounts and authentication tokens
- Quests, habits, projects, notes
- Analytics and progress data

> Note: In development, users can also use IndexedDB (browser-based) via Guest Mode.

## Option 1: MongoDB Atlas (Cloud - Recommended)

**Advantages**:
- No local installation
- Accessible from anywhere
- Free tier: 512MB storage
- Production-ready
- Automatic backups

### Setup Steps

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for free account

2. **Create Cluster**
   - Click **Build a Database**
   - Select **M0 Free** tier
   - Choose **Region**: Europe (Paris/Frankfurt for best latency)
   - Cluster name: `initium-cluster`
   - Click **Create**

3. **Configure Security**
   - **Database Access**: Create user
     - Username: `initium_admin`
     - Password: (choose strong password)
     - Role: **Atlas admin**
   - **Network Access**: Whitelist IP
     - Click **Add IP Address**
     - Choose **Allow Access from Anywhere**: `0.0.0.0/0`
     - (For production, restrict to specific IPs)

4. **Get Connection String**
   - Click **Connect** on your cluster
   - Choose **Connect your application**
   - Driver: **Python** 3.11+
   - Copy connection string:
     ```
     mongodb+srv://initium_admin:<password>@cluster0.xxxxx.mongodb.net/
     ```
   - Replace `<password>` with your actual password (no `<>`)

5. **Configure Backend**
   - Edit `app/backend/.env`:
     ```env
     MONGO_URL=mongodb+srv://initium_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/
     DB_NAME=initium_db
     ```

## Option 2: MongoDB Local (Development)

**Advantages**:
- Works offline
- Full control
- No data leaves your machine

**Disadvantages**:
- Requires installation
- Manual management

### Installation (Windows)

1. **Download**
   - Go to https://www.mongodb.com/try/download/community
   - Version: 8.0 (latest)
   - Platform: Windows x64
   - Package: MSI

2. **Install**
   - Run downloaded `.msi` file
   - Choose **Complete** installation
   - ✅ Check **Install MongoDB as a Service**
   - ✅ Check **Install MongoDB Compass** (GUI - optional but helpful)
   - Click **Install**

3. **Verify Installation**
   ```powershell
   mongod --version
   # Should show: db version v8.0.x
   ```

4. **Create Data Directory**
   ```powershell
   mkdir C:\data\db
   ```

5. **Start MongoDB**
   - **If installed as service**: MongoDB starts automatically
   - **If manual**: Open terminal and run:
     ```powershell
     mongod --dbpath C:\data\db
     ```
     Keep this terminal open while developing

6. **Configure Backend**
   - Edit `app/backend/.env`:
     ```env
     MONGO_URL=mongodb://localhost:27017
     DB_NAME=initium_db
     ```

## Verification

### Check MongoDB is Running

**Atlas**: Go to Atlas dashboard → Cluster shows "Active"

**Local**: Run in terminal:
```powershell
netstat -an | findstr 27017
```
Should show:
```
TCP    0.0.0.0:27017    0.0.0.0:0    LISTENING
```

###  Test Backend Connection

1. Ensure MongoDB is running
2. Start backend:
   ```powershell
   cd c:\INITIUM\app\backend
   uvicorn server:app --reload --port 8000
   ```
3. Backend should start without "Failed to connect" errors
4. Visit http://localhost:8000/api - should show API info

## Troubleshooting

### "Failed to connect to MongoDB"

**Atlas**:
- Check connection string is correct (no extra spaces)
- Password doesn't have `<>` brackets
- Network Access allows `0.0.0.0/0`
- Cluster is active (not paused)

**Local**:
- Check MongoDB is running: `netstat -an | findstr 27017`
- Start MongoDB service or run `mongod` manually
- Verify `.env` has `MONGO_URL=mongodb://localhost:27017`

### "Authentication failed"

**Cause**: Wrong username/password in connection string

**Fix**: Verify credentials in Atlas → Database Access

### Backend slow to start

**Atlas**: Normal - initial connection can take 2-3 seconds

**Local**: Should be instant - if slow, check disk space

## MongoDB Compass (GUI)

If you installed Compass:

1. Open **MongoDB Compass**
2. Connection string:
   - **Atlas**: Paste your `mongodb+srv://...` string
   - **Local**: `mongodb://localhost:27017`
3. Click **Connect**
4. Browse your `initium_db` database
5. View collections: `users`, `quests`, `habits`, etc.

Useful for:
- Viewing data
- Manual edits
- Debugging
- Creating database backups

## Production Considerations

### Data Backup

**Atlas**:
- Free tier: No automatic backups
- Upgrade to M2+ for automated backups
- Manual backup: Use `mongodump`

**Local**:
```powershell
mongodump --db initium_db --out C:\backups\mongodb
```

### Security

**Atlas Production Setup**:
- Use strong passwords (32+ characters)
- Restrict Network Access to specific IPs (not `0.0.0.0/0`)
- Enable database audit logs

**Local Production Setup**:
- Enable authentication:
  ```powershell
  mongod --auth --dbpath C:\data\db
  ```
- Create admin user
- Use replica sets for redundancy

## Migration: Local → Atlas

To move from local to cloud:

1. Export local data:
   ```powershell
   mongod ump --db initium_db --out C:\backup
   ```

2. Update `.env` with Atlas connection string

3. Import to Atlas:
   ```powershell
   mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/" C:\backup\initium_db
   ```

4. Restart backend - should connect to Atlas automatically
