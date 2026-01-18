---
description: Initialize INITIUM development environment
---

# INITIUM Initialization Workflow

This workflow sets up the complete INITIUM development environment, including backend (FastAPI + MongoDB) and frontend (React + Tailwind).

## Prerequisites Check

1. Verify Node.js 18+ is installed: `node --version`
2. Verify Python 3.10+ is installed: `python --version`
3. Verify MongoDB is installed and running: `mongod --version`
4. Verify Yarn is installed: `yarn --version`

## Backend Setup

// turbo
5. Navigate to backend and install Python dependencies:
```bash
cd app/backend
pip install -r requirements.txt
```

6. Check if `.env` file exists and contains required MongoDB configuration:
   - `MONGODB_URL` - MongoDB connection string
   - `SECRET_KEY` - JWT secret key
   - `GOOGLE_CLIENT_ID` - OAuth client ID (optional)
   - `GOOGLE_CLIENT_SECRET` - OAuth client secret (optional)

7. If `.env` is missing or incomplete, create/update it with necessary values

## Frontend Setup

// turbo
8. Navigate to frontend and install dependencies:
```bash
cd app/frontend
yarn install
```

9. Check if frontend `.env` file exists with:
   - `REACT_APP_API_URL` - Backend API URL (default: http://localhost:8001)

10. If missing, create frontend `.env` with default values

## Database Setup

11. Ensure MongoDB is running on default port (27017) or configured port

// turbo
12. Start MongoDB if not running:
```bash
mongod
```

## Start Development Servers

// turbo
13. Start the backend server (in new terminal):
```bash
cd app/backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

// turbo
14. Start the frontend development server (in new terminal):
```bash
cd app/frontend
yarn start
```

## Verification

15. Open browser to `http://localhost:3000` and verify the app loads
16. Check backend API is accessible at `http://localhost:8001/docs` (FastAPI Swagger UI)
17. Verify no console errors in browser developer tools
18. Test basic functionality:
    - Create a test user account
    - Create a test quest or habit
    - Verify data persistence

## Troubleshooting

If you encounter issues:

- **Port conflicts**: Check if ports 3000 (frontend) or 8001 (backend) are already in use
- **MongoDB connection**: Verify MongoDB is running and connection string is correct
- **Dependencies**: Try clearing node_modules and reinstalling: `rm -rf node_modules && yarn install`
- **Python packages**: Try reinstalling in a virtual environment
- **CORS errors**: Check backend CORS configuration in `server.py`

## Success Criteria

✅ Backend server running on port 8001
✅ Frontend server running on port 3000
✅ MongoDB connected and accessible
✅ Application loads without errors
✅ Can create and persist data
