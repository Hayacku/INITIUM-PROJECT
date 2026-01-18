# INITIUM Documentation

Welcome to INITIUM's technical documentation. This guide helps you set up, develop, and deploy the application.

## 📚 Quick Links

### Getting Started
- **[Quick Start Guide](./setup/QUICKSTART.md)** - Set up INITIUM in minutes
- **[Development Setup](./development/SETUP.md)** - Detailed development environment configuration

### Deployment
- **[Production Deployment](./deployment/PRODUCTION.md)** - Deploy to production (Render + Vercel + MongoDB Atlas)
- **[Environment Variables](./deployment/ENVIRONMENT.md)** - Configuration reference

### Authentication
- **[OAuth Setup](./auth/OAUTH_SETUP.md)** - Configure Google OAuth authentication
- **[Firebase Integration](./auth/FIREBASE.md)** - Firebase setup for analytics

### Development
- **[Architecture Overview](./development/ARCHITECTURE.md)** - Application structure and design decisions
- **[API Reference](./development/API.md)** - Backend API documentation
- **[MongoDB Setup](./development/MONGODB.md)** - Database configuration

## 🏗️ Project Structure

```
INITIUM/
├── app/
│   ├── backend/          # FastAPI backend
│   ├── frontend/         # React frontend
│   └── tests/            # Test suites
├── docs/                 # Documentation (you are here)
└── .agent/               # Development workflows
```

## 🆘 Troubleshooting

If you encounter issues, check the [archived guides](./archive/) for historical debugging information.

## 📝 Contributing

This is a personal project, but contributions and suggestions are welcome. Please ensure all changes maintain production quality standards.
