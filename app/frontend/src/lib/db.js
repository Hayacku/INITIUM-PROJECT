import Dexie from 'dexie';

export const db = new Dexie('InitiumNextDB');

db.version(4).stores({
  users: 'id, email, username, createdAt',
  quests: 'id, title, category, status, priority, dueDate, projectId, linkedHabitIds, xp, parentId, createdAt',
  habits: 'id, title, category, frequency, streak, lastCompleted, questId, projectId, createdAt',
  projects: 'id, title, status, priority, progress, createdAt',
  tasks: 'id, projectId, questId, title, status, order, createdAt',
  notes: 'id, title, content, tags, linkedTo, createdAt, updatedAt',
  training: 'id, type, intensity, duration, xp, date, scheduleDate, isRecurring, recurringDays, questId, linkedHabitId, createdAt, exercises',
  events: 'id, title, type, startDate, endDate, questId, trainingId, projectId, createdAt',
  analytics: 'id, date, xpEarned, habitsCompleted, questsCompleted',
  settings: 'id, key, value',
  badges: 'id, userId, type, name, earnedAt',
  backlinks: 'id, sourceId, targetId, sourceType, targetType',
  notifications: '++id, title, message, type, read, createdAt',
  feedback: 'id, type, subject, status, createdAt' // Nouvelle table
});

export async function initializeData() {
  const userCount = await db.users.count();

  if (userCount === 0) {
    const userId = 'user-1';
    const now = new Date();

    // User
    await db.users.add({
      id: userId,
      username: 'Explorateur',
      email: 'user@initium.com',
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
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
        streak: 12,
        bestStreak: 18,
        lastCompleted: new Date(Date.now() - 24 * 60 * 60 * 1000),
        xpPerCompletion: 30,
        completedDates: [],
        createdAt: now
      },
      {
        id: 'habit-2',
        title: 'Lire 30 minutes',
        category: 'Apprentissage',
        frequency: 'daily',
        targetPerWeek: 7,
        streak: 8,
        bestStreak: 15,
        lastCompleted: new Date(Date.now() - 24 * 60 * 60 * 1000),
        xpPerCompletion: 25,
        completedDates: [],
        createdAt: now
      },
      {
        id: 'habit-3',
        title: 'Journal personnel',
        category: 'Vie sociale',
        frequency: 'daily',
        targetPerWeek: 5,
        streak: 3,
        bestStreak: 10,
        xpPerCompletion: 20,
        completedDates: [],
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
  }
}
