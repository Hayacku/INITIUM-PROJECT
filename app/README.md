# INITIUM NEXT - Second Cerveau Numérique 🧠✨

> Votre écosystème de productivité unifié qui transforme la gestion de vos objectifs, habitudes et projets en une expérience gamifiée immersive.

## 🌟 Vue d'ensemble

INITIUM NEXT est une Progressive Web App (PWA) complète qui combine les meilleurs aspects de Notion, Habitica et Trello dans une interface moderne et personnalisable. C'est votre second cerveau numérique pour maximiser productivité et croissance personnelle.

## ✨ Fonctionnalités principales

### 📊 Dashboard évolutif
- **Widgets interconnectés** affichant statistiques, XP, streaks et progression
- **Timeline quotidienne** fusionnant agenda, tâches et entraînements
- **Vue contexte** adaptée selon l'heure et les priorités
- **Mini-analytics** avec XP du jour et cohérence sur 7 jours

### 🎯 Quêtes & Objectifs
- Système de **hiérarchie** (quêtes principales, secondaires, sous-objectifs)
- **Progression multi-facteur** combinant sous-tâches, durée et régularité
- **XP équilibré** basé sur effort, complexité et régularité
- Catégorisation (Apprentissage, Santé, Créativité, Travail, Vie sociale)
- Filtres par statut (actives, en cours, terminées)

### 🔄 Habitudes & Routines
- **Suivi des streaks** avec séries actuelles et records personnels
- **Objectifs hebdomadaires** configurables (ex: 5x/semaine)
- **Catégorisation** par domaine de vie
- **XP par complétion** personnalisable
- **Visualisation** de cohérence avec graphiques

### 📆 Agenda intelligent
- **Calendrier mensuel** interactif avec navigation fluide
- **Événements** avec types (réunion, deadline, rappel)
- **Synchronisation** automatique avec quêtes à deadline
- **Vue quotidienne** des événements à venir

### 🧩 Projets & Gestion
- **Vue Kanban** avec colonnes (À faire, En cours, Terminé)
- **Système de tâches** lié aux quêtes
- **Suivi de progression** automatique par projet
- **Priorités** et dates cibles

### 📝 Notes & Knowledge Hub
- **Éditeur Markdown** enrichi avec syntaxe complète
- **Système de tags** pour organisation
- **Recherche rapide** dans titres et contenu
- **Édition temps réel** avec prévisualisation

### 🏋️ Training & Suivi
- **Sessions personnalisées** (type, intensité, durée)
- **Calcul XP dynamique** selon intensité et durée
- **Statistiques** : sessions totales, temps cumulé, XP gagné
- **Historique** des entraînements

### 📈 Analytics avancés
- **Graphiques XP** : évolution sur 7/14/30 jours
- **Heatmaps d'activité** quotidienne
- **Répartition par catégorie** (pie chart)
- **Insights automatiques** sur performance et constance
- **Taux de complétion** global

### ⚙️ Personnalisation totale
- **7 thèmes** disponibles (Violet, Bleu, Noir, Blanc, Vert, Rouge, Jaune)
- **Animations** activables/désactivables
- **Export/Import** de données (JSON)
- **Gestion complète** des données

## 🎮 Système de gamification

### XP & Niveaux
- **XP équilibré** calculé selon effort réel, régularité et complexité
- **Système de niveaux** avec paliers progressifs
- **XP par domaine** (étude, santé, créativité, etc.)

### Badges & Récompenses
- Badges de **streaks** (7, 30, 100 jours)
- Badges de **milestones XP** (100, 500, 1000, 5000)
- Récompenses **cosmétiques** (thèmes, effets)

## 🚀 Technologies utilisées

### Frontend
- **React 19** avec Hooks
- **React Router** pour navigation
- **Dexie.js** (IndexedDB) pour stockage local
- **Tailwind CSS** pour styling
- **Shadcn/UI** composants modernes
- **Recharts** pour visualisations
- **Lucide React** pour icônes
- **date-fns** pour gestion dates
- **react-markdown** pour notes

### Backend
- **FastAPI** (Python)
- **MongoDB** avec Motor (async)
- **Pydantic** pour validation

### DevOps
- **PWA** avec Service Worker
- **Offline-first** architecture
- Déploiement sur **Emergent.sh**

## 📦 Installation & Démarrage

### Prérequis
- Node.js 18+
- Python 3.10+
- MongoDB
- Yarn

### Installation

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
yarn install
```

### Démarrage

```bash
# Backend (port 8001)
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Frontend (port 3000)
cd frontend
yarn start
```

L'application sera accessible sur `http://localhost:3000`

## 🗄️ Base de données

### Collections IndexedDB (Local)
- `users` - Profils utilisateurs
- `quests` - Quêtes et objectifs
- `habits` - Habitudes et routines
- `projects` - Projets et tâches
- `tasks` - Tâches individuelles
- `notes` - Base de connaissances
- `training` - Sessions d'entraînement
- `events` - Événements calendrier
- `analytics` - Données historiques
- `settings` - Préférences utilisateur
- `badges` - Achievements

## 🎨 Design System

### Couleurs
- **Primary** : Variable selon thème sélectionné
- **Secondary** : Nuance complémentaire
- **Accent** : Mise en avant
- **Background** : Fond principal
- **Foreground** : Texte principal

### Typographie
- **Titres** : Space Grotesk (600)
- **Corps** : Inter (400-500)
- **Hiérarchie** :
  - H1: text-4xl sm:text-5xl lg:text-6xl
  - H2: text-base md:text-lg
  - Body: text-base (mobile: text-sm)

### Animations
- **fadeIn** : 300ms ease-out
- **slideIn** : 400ms ease-out
- **pulse** : 2s infinite
- **glow** : 2s ease-in-out infinite

## 📱 PWA - Progressive Web App

### Fonctionnalités
- ✅ **Installable** sur mobile et desktop
- ✅ **Offline complet** avec Dexie
- ✅ **Service Worker** pour cache
- ✅ **Manifest** avec icônes et shortcuts
- ✅ **Notifications** locales (à venir)

### Installation PWA
1. Ouvrir l'app dans le navigateur
2. Cliquer sur "Installer" ou menu navigateur
3. L'app s'ajoute à l'écran d'accueil
4. Fonctionne 100% hors ligne

## 🔐 Sécurité & Confidentialité

- **Données 100% locales** (IndexedDB)
- **Aucun tracking** ou analytics tiers
- **Export/Import chiffré** disponible
- **GDPR compliant**

## 🚧 Roadmap

### V1.1 (À venir)
- [ ] Synchronisation cloud optionnelle
- [ ] Collaboration multi-utilisateurs
- [ ] Templates de quêtes avancés
- [ ] Mindmap interactive
- [ ] Journal intelligent
- [ ] Vision Board

### V1.2
- [ ] Intégrations externes (Google Cal, Notion)
- [ ] Mode Pomodoro intégré
- [ ] Assistant IA contextuel
- [ ] Notifications push intelligentes

## 📄 Licence

MIT License - Libre d'utilisation

## 🤝 Contribution

Les contributions sont bienvenues ! N'hésitez pas à ouvrir des issues ou pull requests.


---

**INITIUM NEXT** - Transformez vos ambitions en réalité 🌟
