# INITIUM

**Modern productivity application with gamification**, combining quests, habits, projects, and notes into a cohesive "second brain" system.

## 🚀 Quick Start

```powershell
# 1. Configuration
cp app/backend/.env.template app/backend/.env
cp app/frontend/.env.template app/frontend/.env
# Edit .env files with your MongoDB and Firebase credentials

# 2. Install Dependencies
cd app/backend && pip install -r requirements.txt
cd ../frontend && yarn install

# 3. Start Application
# Terminal 1:
cd app/backend && uvicorn server:app --reload --port 8000

# Terminal 2:
cd app/frontend && yarn start
```

Visit http://localhost:3000 and click "Continuer en mode invité" to start!

## 📚 Documentation

Complete guides available in [docs/](./docs/):

- **[Quick Start](./docs/setup/QUICKSTART.md)** - Full setup instructions
- **[Deployment](./docs/deployment/PRODUCTION.md)** - Deploy to production (free tier)
- **[OAuth Setup](./docs/auth/OAUTH_SETUP.md)** - Configure Google/GitHub authentication
- **[MongoDB](./docs/development/MONGODB.md)** - Database configuration

## ✨ Features

- **Quests**: Task management with XP rewards  
- **Habits**: Daily tracking with streaks
- **Projects**: Organize work with Kanban boards
- **Notes**: Rich text editor with  backlinks
- **Analytics**: Visualize your productivity
- **Gamification**: Levels, badges, achievements
- **PWA**: Install as desktop/mobile app
- **Cloud Sync**: Access your data anywhere (when authenticated)

## 🏗️ Tech Stack

**Frontend**: React, Tailwind CSS, IndexedDB (Dexie), shadcn/ui  
**Backend**: FastAPI Python, JWT Auth, MongoDB  
**Deployment**: Vercel (frontend), Render (backend), MongoDB Atlas

## 🧑‍💻 Development

### Project Structure

```
INITIUM/
├── app/
│   ├── backend/          # FastAPI server
│   ├── frontend/         # React application
│   └── tests/            # Test suites  
├── docs/                 # Documentation
└── .agent/               # Development workflows
```

### Development Workflow

See [.agent/workflows/init.md](./.agent/workflows/init.md) for automated setup.

## 📝 License

Personal project - not currently open source.

## 🤝 Contributing

This is a personal productivity application. Suggestions and feedback are welcome!
