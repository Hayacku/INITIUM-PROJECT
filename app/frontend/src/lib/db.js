import Dexie from 'dexie';

export const db = new Dexie('InitiumNextDB');

// Version 5: Added feedback table
db.version(5).stores({
  users: 'id, email, username, createdAt',
  quests: 'id, title, category, status, priority, dueDate, projectId, linkedHabitIds, xp, parentId, isExample, createdAt',
  habits: 'id, title, category, frequency, streak, lastCompleted, questId, projectId, createdAt',
  projects: 'id, title, status, priority, progress, createdAt',
  tasks: 'id, projectId, questId, title, status, order, createdAt',
  notes: 'id, title, content, tags, linkedTo, createdAt, updatedAt',
  training: 'id, type, intensity, duration, xp, date, scheduleDate, isRecurring, recurringDays, questId, linkedHabitId, createdAt, exercises',
  training_templates: '++id, title, type, questId, linkedHabitId',
  events: 'id, title, type, startDate, endDate, questId, trainingId, projectId, createdAt',
  analytics: 'id, date, xpEarned, habitsCompleted, questsCompleted',
  settings: 'id, key, value',
  badges: 'id, userId, type, name, earnedAt',
  backlinks: 'id, sourceId, targetId, sourceType, targetType',
  notifications: '++id, title, message, type, read, createdAt',
  feedback: 'id, type, subject, status, createdAt'
});

// Version 6: Axiom of Choice Tables
db.version(6).stores({
  objectives: 'id, name, type, horizon, importance, userId, isActive, createdAt',
  decisions: 'id, context, winningAction, userId, createdAt'
});

// Version 7: Enhanced Habits for Multi-Completion
db.version(7).stores({
  habits: 'id, title, category, frequency, streak, lastCompleted, questId, projectId, dailyGoal, completionsToday, completionDate, createdAt'
}).upgrade(async tx => {
  // Migrate existing habits to include new fields
  await tx.table('habits').toCollection().modify(habit => {
    if (!habit.dailyGoal) habit.dailyGoal = 1;
    if (!habit.completionsToday) habit.completionsToday = 0;
    if (!habit.completionDate) habit.completionDate = null;
    if (!habit.weeklyCompletions) habit.weeklyCompletions = [];
  });
});

// Version 8: Features Update (XP Calc, Notifications, Analytics)
db.version(8).stores({
  quests: 'id, title, category, status, priority, dueDate, projectId, linkedHabitIds, xp, parentId, isExample, createdAt, completedAt, estimatedDuration',
  habits: 'id, title, category, frequency, streak, lastCompleted, questId, projectId, dailyGoal, completionsToday, completionDate, createdAt, reminderTime'
}).upgrade(async tx => {
  // Initialize new fields
  await tx.table('quests').toCollection().modify(quest => {
    if (!quest.estimatedDuration) quest.estimatedDuration = 0;
    if (quest.status === 'completed' && !quest.completedAt) {
      // Best guess for existing completed quests: set to updated date or created date
      quest.completedAt = quest.dueDate || quest.createdAt;
    }
  });
  await tx.table('habits').toCollection().modify(habit => {
    if (!habit.reminderTime) habit.reminderTime = null;
  });
});

// Version 9: Quest Templates, Recurrence & Unlockables
db.version(9).stores({
  quest_templates: '++id, title, category, xp, effort, steps, isCustom',
  unlockables: 'id, type, name, description, requirementType, requirementValue, isUnlocked, unlockedAt',
  quests: 'id, title, category, status, priority, dueDate, projectId, linkedHabitIds, xp, parentId, isExample, createdAt, completedAt, estimatedDuration, recurrence, recurrenceRule',
  events: 'id, title, type, startDate, endDate, questId, trainingId, projectId, createdAt, recurrenceRule, exceptionDates'
}).upgrade(async tx => {
  // Initialize new fields for existing records
  await tx.table('quests').toCollection().modify(quest => {
    if (!quest.recurrence) quest.recurrence = 'none'; // 'none', 'daily', 'weekly', 'monthly', 'custom'
    if (!quest.recurrenceRule) quest.recurrenceRule = null;
  });
  await tx.table('events').toCollection().modify(event => {
    if (!event.recurrenceRule) event.recurrenceRule = null;
    if (!event.exceptionDates) event.exceptionDates = [];
  });
});

// Version 10: Habit Logs for Heatmap
db.version(10).stores({
  habit_logs: '++id, habitId, date, count'
});

// Version 11: Task Hierarchy (Sub-tasks)
db.version(11).stores({
  tasks: 'id, projectId, questId, title, status, order, parentId, createdAt'
}).upgrade(async tx => {
  await tx.table('tasks').toCollection().modify(task => {
    if (!task.parentId) task.parentId = null;
  });
});

// Version 12: Task Dependencies
db.version(12).stores({
  tasks: 'id, projectId, questId, title, status, order, parentId, blockedBy, createdAt'
}).upgrade(async tx => {
  await tx.table('tasks').toCollection().modify(task => {
    if (!task.blockedBy) task.blockedBy = [];
  });
});

export async function initializeData() {
  try {
    const userCount = await db.users.count();

    if (userCount === 0) {
      await populateDefaults();
    }

    // Perform cleanup of old data
    await cleanupOldData();

  } catch (error) {
    if (error.name === 'DatabaseClosedError' || error.name === 'VersionError' || error.name === 'UpgradeError' || error.name === 'OpenFailedError') {
      console.warn('Database schema mismatch or corruption detected. Resetting database...');
      try {
        await db.delete();
        await db.open();
        await populateDefaults();
        console.log('Database successfully reset and repopulated.');
      } catch (retryError) {
        console.error('Failed to reset database:', retryError);
        throw retryError;
      }
    } else {
      console.error('Non-recoverable DB Error:', error);
      throw error;
    }
  }
}

async function cleanupOldData() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Delete old read notifications
    const oldNotifications = await db.notifications
      .where('createdAt')
      .below(thirtyDaysAgo)
      .and(n => n.read === true)
      .delete();

    if (oldNotifications > 0) {
      console.log(`Cleaned up ${oldNotifications} old notifications.`);
    }

    // Option: We could also cleanup very old analytics or system events here if needed
  } catch (error) {
    console.error("Error during data cleanup:", error);
  }
}

async function populateDefaults() {
  const now = new Date();
  const userId = 'user-1';

  // User
  await db.users.add({
    id: userId,
    username: 'Initié',
    email: 'user@initium.com',
    level: 1,
    xp: 0,
    totalXP: 0,
    xpToNextLevel: 100,
    activeTitle: 'Initié',
    activeEffect: 'none',
    createdAt: now
  });

  // Settings par défaut
  await db.settings.bulkAdd([
    { id: 'theme', key: 'theme', value: 'violet' },
    { id: 'animations', key: 'animations', value: 'true' },
    { id: 'haptics', key: 'haptics', value: 'true' }
  ]);

  // Quêtes d'exemple
  await db.quests.bulkAdd([
    {
      id: 'quest-1',
      title: 'Apprendre React avancé',
      description: 'Maîtriser hooks, context et patterns avancés',
      category: 'Apprentissage',
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      xp: 150,
      progress: 40,
      effort: 'high',
      isExample: true,
      createdAt: now
    },
    {
      id: 'quest-2',
      title: 'Finir le projet portfolio',
      description: 'Compléter toutes les sections et déployer',
      category: 'Créativité',
      status: 'in_progress',
      priority: 'medium',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      xp: 200,
      progress: 60,
      effort: 'medium',
      isExample: true,
      createdAt: now
    },
    {
      id: 'quest-3',
      title: 'Méditation quotidienne',
      description: '20 minutes de méditation chaque matin',
      category: 'Santé',
      status: 'active',
      priority: 'high',
      xp: 50,
      progress: 0,
      recurring: true,
      isExample: true,
      createdAt: now
    }
  ]);

  // Habitudes
  await db.habits.bulkAdd([
    {
      id: 'habit-1',
      title: 'Faire du sport',
      category: 'Santé',
      frequency: 'daily',
      targetPerWeek: 5,
      dailyGoal: 1,
      completionsToday: 0,
      completionDate: null,
      streak: 12,
      bestStreak: 18,
      lastCompleted: new Date(Date.now() - 24 * 60 * 60 * 1000),
      xpPerCompletion: 30,
      completedDates: [],
      weeklyCompletions: [],
      isExample: true,
      createdAt: now
    },
    {
      id: 'habit-2',
      title: 'Lire 30 minutes',
      category: 'Apprentissage',
      frequency: 'daily',
      targetPerWeek: 7,
      dailyGoal: 1,
      completionsToday: 0,
      completionDate: null,
      streak: 8,
      bestStreak: 15,
      lastCompleted: new Date(Date.now() - 24 * 60 * 60 * 1000),
      xpPerCompletion: 25,
      completedDates: [],
      weeklyCompletions: [],
      isExample: true,
      createdAt: now
    },
    {
      id: 'habit-3',
      title: 'Boire de l\'eau',
      category: 'Santé',
      frequency: 'daily',
      targetPerWeek: 7,
      dailyGoal: 8,
      completionsToday: 0,
      completionDate: null,
      streak: 3,
      bestStreak: 10,
      xpPerCompletion: 5,
      completedDates: [],
      weeklyCompletions: [],
      isExample: true,
      createdAt: now
    }
  ]);

  // Projets
  await db.projects.bulkAdd([
    {
      id: 'project-1',
      title: 'Application Mobile Fitness',
      description: 'Créer une app de suivi fitness complète',
      status: 'in_progress',
      priority: 'high',
      progress: 35,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      xpTotal: 500,
      isExample: true,
      createdAt: now
    },
    {
      id: 'project-2',
      title: 'Blog personnel',
      description: 'Lancer un blog tech avec contenu régulier',
      status: 'planning',
      priority: 'medium',
      progress: 10,
      startDate: now,
      xpTotal: 300,
      isExample: true,
      createdAt: now
    }
  ]);

  // Tâches
  await db.tasks.bulkAdd([
    { id: 'task-1', projectId: 'project-1', title: 'Design UI/UX', status: 'completed', order: 1, createdAt: now },
    { id: 'task-2', projectId: 'project-1', title: 'Développer backend API', status: 'in_progress', order: 2, createdAt: now },
    { id: 'task-3', projectId: 'project-1', title: 'Intégrer tracking GPS', status: 'todo', order: 3, createdAt: now },
    { id: 'task-4', projectId: 'project-2', title: 'Choisir plateforme', status: 'completed', order: 1, createdAt: now },
    { id: 'task-5', projectId: 'project-2', title: 'Écrire 5 articles', status: 'todo', order: 2, createdAt: now }
  ]);

  // Notes
  await db.notes.bulkAdd([
    {
      id: 'note-1',
      title: 'React Hooks Best Practices',
      content: '# React Hooks\n\n## useState\nUtiliser pour état local simple.\n\n## useEffect\nPour side effects et synchronisation.',
      tags: ['react', 'hooks', 'dev'],
      linkedTo: ['quest-1'],
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'note-2',
      title: 'Idées projet',
      content: '# Idées\n\n- App de productivité gamifiée ✅\n- Tracker de livres\n- Journal intelligent',
      tags: ['idées', 'projets'],
      linkedTo: [],
      createdAt: now,
      updatedAt: now
    }
  ]);

  // Training sessions
  await db.training.bulkAdd([
    {
      id: 'training-1',
      type: 'Cardio',
      intensity: 'high',
      duration: 45,
      xp: 50,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      notes: 'Excellente session de course',
      createdAt: now,
      exercises: [
        {
          name: 'Course à pied',
          type: 'Cardio',
          duration: 30,
          reps: null,
          sets: null,
          details: 'Extérieur, rythme élevé'
        },
        {
          name: 'Sprints',
          type: 'Cardio',
          duration: 15,
          reps: 10,
          sets: 1,
          details: 'Sprint 100m x10'
        }
      ]
    },
    {
      id: 'training-2',
      type: 'Musculation',
      intensity: 'medium',
      duration: 60,
      xp: 45,
      date: new Date(Date.now() - 48 * 60 * 60 * 1000),
      createdAt: now,
      exercises: [
        {
          name: 'Développé couché',
          type: 'Force',
          duration: null,
          reps: 10,
          sets: 4,
          details: '60kg, tempo 2-1-2'
        },
        {
          name: 'Tractions',
          type: 'Force',
          duration: null,
          reps: 8,
          sets: 3,
          details: 'Poids du corps'
        }
      ]
    }
  ]);

  // Events
  await db.events.bulkAdd([
    {
      id: 'event-1',
      title: 'Réunion équipe',
      type: 'meeting',
      startDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 3 * 60 * 60 * 1000),
      createdAt: now
    },
    {
      id: 'event-2',
      title: 'Deadline projet',
      type: 'deadline',
      questId: 'quest-2',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: now
    }
  ]);

  // Analytics historique
  const analyticsData = [];
  for (let i = 7; i >= 0; i--) {
    analyticsData.push({
      id: `analytics-${i}`,
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      xpEarned: Math.floor(Math.random() * 100) + 50,
      habitsCompleted: Math.floor(Math.random() * 3) + 1,
      questsCompleted: Math.floor(Math.random() * 2)
    });
  }
  await db.analytics.bulkAdd(analyticsData);

  // Badges
  await db.badges.bulkAdd([
    { id: 'badge-1', userId, type: 'streak', name: 'Première Série', description: '7 jours consécutifs', earnedAt: now },
    { id: 'badge-2', userId, type: 'xp', name: 'Débutant', description: '100 XP atteints', earnedAt: now }
  ]);

  // Quest Templates Defaults
  await db.quest_templates.bulkAdd([
    { title: 'Marathon Training', category: 'Santé', xp: 500, effort: 'high', steps: [{ title: 'Tests VMA', status: 'pending' }, { title: 'Achat équipements', status: 'pending' }, { title: 'Sortie longue 10km', status: 'pending' }], isCustom: false },
    { title: 'Yoga Daily Flow', category: 'Santé', xp: 50, effort: 'low', steps: [{ title: 'Choisir routine', status: 'pending' }, { title: 'Séance 20min', status: 'pending' }], isCustom: false },
    { title: 'Apprendre React Patterns', category: 'Apprentissage', xp: 200, effort: 'high', steps: [{ title: 'Hooks avancés', status: 'pending' }, { title: 'Higher Order Components', status: 'pending' }, { title: 'Render Props', status: 'pending' }], isCustom: false },
    { title: 'Setup Home Office', category: 'Productivité', xp: 100, effort: 'medium', steps: [{ title: 'Ergonomie chaise', status: 'pending' }, { title: 'Gestion câbles', status: 'pending' }, { title: 'Éclairage', status: 'pending' }], isCustom: false },
    { title: 'Budget Personnel', category: 'Finance', xp: 100, effort: 'medium', steps: [{ title: 'Lister revenus', status: 'pending' }, { title: 'Catégoriser dépenses', status: 'pending' }, { title: 'Épargne auto', status: 'pending' }], isCustom: false },
    { title: 'Écrire un Article Blog', category: 'Créativité', xp: 120, effort: 'medium', steps: [{ title: 'Recherche sujet', status: 'pending' }, { title: 'Premier jet', status: 'pending' }, { title: 'Correction & Publication', status: 'pending' }], isCustom: false },
    { title: 'Déclutter Digital', category: 'Productivité', xp: 80, effort: 'low', steps: [{ title: 'Nettoyage bureau PC', status: 'pending' }, { title: 'Trier emails', status: 'pending' }, { title: 'Supprimer apps inutiles', status: 'pending' }], isCustom: false },
    { title: 'Cuisine Méditerranéenne', category: 'Lifestyle', xp: 100, effort: 'medium', steps: [{ title: 'Faire les courses', status: 'pending' }, { title: 'Préparer 3 plats', status: 'pending' }], isCustom: false },
    { title: 'Construire son Portfolio', category: 'Créativité', xp: 300, effort: 'high', steps: [{ title: 'Choisir projets', status: 'pending' }, { title: 'Design Figma', status: 'pending' }, { title: 'Développement React', status: 'pending' }], isCustom: false },
    { title: 'Bases de la Guitare', category: 'Apprentissage', xp: 150, effort: 'medium', steps: [{ title: 'Accords ouverts', status: 'pending' }, { title: 'Rythmique 4/4', status: 'pending' }, { title: 'Jouer un morceau', status: 'pending' }], isCustom: false },
    { title: 'Fonds d\'Urgence', category: 'Finance', xp: 250, effort: 'high', steps: [{ title: 'Définir montant cible', status: 'pending' }, { title: 'Ouverture compte dédié', status: 'pending' }, { title: 'Premier virement', status: 'pending' }], isCustom: false },
    { title: 'Maîtriser SQL', category: 'Apprentissage', xp: 180, effort: 'high', steps: [{ title: 'SELECT & JOIN', status: 'pending' }, { title: 'GROUP BY & HAVING', status: 'pending' }, { title: 'Indexation bases', status: 'pending' }], isCustom: false },
    { title: 'Routine Matinale Calme', category: 'Lifestyle', xp: 50, effort: 'low', steps: [{ title: 'Pas d\'écran 30min', status: 'pending' }, { title: 'Lecture 15min', status: 'pending' }, { title: 'Méditation 5min', status: 'pending' }], isCustom: false },
    { title: 'Meal Prep Hebdo', category: 'Santé', xp: 100, effort: 'medium', steps: [{ title: 'Menu de la semaine', status: 'pending' }, { title: 'Courses groupées', status: 'pending' }, { title: 'Cuisine (2h)', status: 'pending' }], isCustom: false },
    { title: 'Automatisation Tâches', category: 'Productivité', xp: 150, effort: 'medium', steps: [{ title: 'Identifier répétition', status: 'pending' }, { title: 'Setup Zapier/Scripts', status: 'pending' }, { title: 'Test & Validation', status: 'pending' }], isCustom: false },
    { title: 'Investissement Bourse', category: 'Finance', xp: 200, effort: 'medium', steps: [{ title: 'Lire bases ETF', status: 'pending' }, { title: 'Ouverture PEA/CTO', status: 'pending' }, { title: 'Premier ordre', status: 'pending' }], isCustom: false },
    { title: 'Lire 12 Livres / An', category: 'Apprentissage', xp: 400, effort: 'high', steps: [{ title: 'Lister les 12 livres', status: 'pending' }, { title: 'Lire 20 pages/jour', status: 'pending' }], isCustom: false },
    { title: 'Planifier Voyage', category: 'Lifestyle', xp: 100, effort: 'medium', steps: [{ title: 'Choisir destination', status: 'pending' }, { title: 'Budget prévisionnel', status: 'pending' }, { title: 'Reserver vols/hotels', status: 'pending' }], isCustom: false },
    { title: 'Apprendre Figma', category: 'Créativité', xp: 100, effort: 'medium', steps: [{ title: 'Auto-layout', status: 'pending' }, { title: 'Components & Variants', status: 'pending' }, { title: 'Prototypage', status: 'pending' }], isCustom: false },
    { title: 'Méditation Zen', category: 'Mindfulness', xp: 80, effort: 'low', steps: [{ title: 'Setup espace calme', status: 'pending' }, { title: 'Session 10min guidée', status: 'pending' }], isCustom: false }
  ]);

  // Unlockables Defaults (expanded pool for v3)
  await db.unlockables.bulkAdd([
    // Themes
    { id: 'theme-dark', type: 'theme', name: 'Mode Sombre', description: 'Le classique.', rarity: 'common', requirementType: 'level', requirementValue: 1, isUnlocked: true, unlockedAt: now },
    { id: 'theme-nebula', type: 'theme', name: 'Nébuleuse', description: 'Violets profonds et poussière d\'étoiles.', rarity: 'rare', requirementType: 'level', requirementValue: 8, isUnlocked: false, xpCost: 500 },
    { id: 'theme-cyberpunk', type: 'theme', name: 'Neon City', description: 'Contrastes forts et lumières fluos.', rarity: 'epic', requirementType: 'level', requirementValue: 15, isUnlocked: false, xpCost: 1200 },
    { id: 'theme-gold', type: 'theme', name: 'Lingot d\'Or', description: 'Luxe absolu et reflets dorés.', rarity: 'legendary', requirementType: 'level', requirementValue: 30, isUnlocked: false, xpCost: 5000 },

    // Titles
    { id: 'title-initiate', type: 'title', name: 'Initié', description: 'Le début du voyage.', rarity: 'common', requirementType: 'level', requirementValue: 2, isUnlocked: false, xpCost: 100 },
    { id: 'title-architect', type: 'title', name: 'Architecte du Temps', description: 'Maître de son plein potentiel.', rarity: 'rare', requirementType: 'level', requirementValue: 10, isUnlocked: false, xpCost: 800 },
    { id: 'title-titan', type: 'title', name: 'Titan d\'Acier', description: 'Une volonté inébranlable.', rarity: 'epic', requirementType: 'level', requirementValue: 20, isUnlocked: false, xpCost: 2000 },
    { id: 'title-ascendant', type: 'title', name: 'Ascendant Divin', description: 'Au-delà des limites humaines.', rarity: 'legendary', requirementType: 'level', requirementValue: 50, isUnlocked: false, xpCost: 10000 },

    // Effects
    { id: 'fx-glow', type: 'effect', name: 'Aura Bleue', description: 'Un léger halo mystique.', rarity: 'rare', requirementType: 'xp', requirementValue: 1500, isUnlocked: false, xpCost: 1000 },
    { id: 'fx-sparkles', type: 'effect', name: 'Étincelles', description: 'Des particules d\'énergie pure.', rarity: 'epic', requirementType: 'xp', requirementValue: 4000, isUnlocked: false, xpCost: 2500 }
  ]);
}
