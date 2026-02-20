import { db } from '../lib/db';
import { addDays, subDays, format } from 'date-fns';

const uuidv4 = () => crypto.randomUUID();

const PROJECT_TEMPLATES = [
    { title: 'Application Mobile Fitness', category: 'Créativité', weeks: 12, tasks: 15 },
    { title: 'Apprendre le Piano', category: 'Apprentissage', weeks: 24, tasks: 40 },
    { title: 'Rénovation Salon', category: 'Vie sociale', weeks: 4, tasks: 10 },
    { title: 'Portfolio Pro', category: 'Travail', weeks: 6, tasks: 12 },
    { title: 'Marathon de Paris', category: 'Santé', weeks: 16, tasks: 30 },
    { title: 'Gestion Budget', category: 'Finance', weeks: 52, tasks: 20 },
    { title: 'Ecriture Roman', category: 'Créativité', weeks: 30, tasks: 50 },
    { title: 'Setup Home Office', category: 'Productivité', weeks: 2, tasks: 8 }
];

const HABIT_TEMPLATES = [
    { title: 'Méditation', category: 'Mindfulness', frequency: 'daily', xp: 20, chance: 0.8 },
    { title: 'Sport', category: 'Santé', frequency: 'daily', xp: 50, chance: 0.6 },
    { title: 'Lecture', category: 'Apprentissage', frequency: 'daily', xp: 25, chance: 0.7 },
    { title: 'Cuisine équilibrée', category: 'Santé', frequency: 'daily', xp: 30, chance: 0.9 },
    { title: 'Veille Tech', category: 'Travail', frequency: 'daily', xp: 20, chance: 0.5 }
];

const NOTE_SNIPPETS = [
    "Réflexion sur l'architecture du projet. Utilisation de Dexie pour l'offline-first.",
    "Liste de courses pour la semaine : Avocats, Poulet, Quinoa, Myrtilles.",
    "Routine matinale idéale : 5 min étirements, 10 min méditation, lecture.",
    "Idées de fonctionnalités : Mode sombre automatique, export PDF des rapports.",
    "Résumé de lecture : L'atome des habitudes explique que 1% de progrès chaque jour mène à des résultats massifs.",
    "Notes de réunion : Prioriser la performance du dashboard et la fluidité des animations hexagonal."
];

export const DeveloperService = {
    async generateYearOfData(progressCallback = () => { }) {
        progressCallback(0, 'Initialisation du "Second Cerveau"...');

        // 1. Clear ALL functional tables
        const tablesToClear = ['quests', 'habits', 'projects', 'tasks', 'training', 'events', 'analytics', 'habit_logs', 'objectives', 'decisions', 'badges', 'notifications', 'notes', 'quest_templates', 'unlockables'];
        for (const table of tablesToClear) {
            await db[table].clear();
        }

        const now = new Date();
        const startPoint = subDays(now, 365);
        const userId = 'user-1';

        // 2. Repopulate Default Templates and Unlockables (to fix empty lists)
        await this.populateDefaultLibrary(now);

        // 3. Setup User Profile
        await db.users.update(userId, {
            level: 1, xp: 0, totalXP: 0, createdAt: startPoint
        });

        // 4. Generate Core Habits
        const habits = HABIT_TEMPLATES.map(h => ({
            id: uuidv4(), ...h, streak: 0, bestStreak: 0, lastCompleted: null,
            dailyGoal: 1, completionsToday: 0, completionDate: null, createdAt: startPoint
        }));
        await db.habits.bulkAdd(habits);

        // 5. Historical Data Accumulators
        const projects = [];
        const tasks = [];
        const quests = [];
        const events = [];
        const analytics = [];
        const habitLogs = [];
        const trainingSessions = [];
        const notes = [];

        let currentXP = 0;
        const activeProjectTitles = new Set();

        progressCallback(10, 'Simulation du voyage temporel (1 an)...');

        for (let i = 0; i <= 365; i++) {
            const currentDate = addDays(startPoint, i);
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            let dailyXP = 0;
            let dailyHabitsCount = 0;
            let dailyQuestsCount = 0;

            // --- PROJECTS Logic ---
            const activeProjectsCount = projects.filter(p => p.status === 'in_progress').length;
            if (activeProjectsCount < 4 && Math.random() > 0.96) {
                // Find a template not currently active to avoid duplicates
                const availableTemplates = PROJECT_TEMPLATES.filter(t => !activeProjectTitles.has(t.title));
                if (availableTemplates.length > 0) {
                    const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
                    activeProjectTitles.add(template.title);

                    const projectId = uuidv4();
                    projects.push({
                        id: projectId,
                        title: template.title,
                        category: template.category,
                        status: 'in_progress',
                        priority: Math.random() > 0.7 ? 'high' : 'medium',
                        progress: 0,
                        startDate: currentDate,
                        targetDate: addDays(currentDate, template.weeks * 7),
                        createdAt: currentDate
                    });

                    for (let t = 0; t < template.tasks; t++) {
                        tasks.push({
                            id: uuidv4(), projectId, title: `Phase ${t + 1} : ${template.title}`,
                            status: 'todo', order: t, createdAt: currentDate
                        });
                    }

                    // Create a Note when starting a project
                    notes.push({
                        id: uuidv4(),
                        title: `Planification : ${template.title}`,
                        content: `# ${template.title}\nObjectif : Finir en ${template.weeks} semaines.\n\n${NOTE_SNIPPETS[Math.floor(Math.random() * NOTE_SNIPPETS.length)]}`,
                        tags: [template.category.toLowerCase(), 'projet'],
                        linkedTo: [projectId],
                        createdAt: currentDate,
                        updatedAt: currentDate
                    });
                }
            }

            // --- PROGRESSION & ACTIONS Logic ---
            const currentActiveProjects = projects.filter(p => p.status === 'in_progress');
            currentActiveProjects.forEach(p => {
                // Task Completion
                const pTasks = tasks.filter(t => t.projectId === p.id && t.status === 'todo');
                if (pTasks.length > 0 && Math.random() > 0.6) {
                    const task = pTasks[0];
                    task.status = 'completed';
                    task.completedAt = currentDate;
                    dailyXP += 25;

                    // Milestone Quests
                    const doneCount = tasks.filter(t => t.projectId === p.id && t.status === 'completed').length;
                    const totalCount = tasks.filter(t => t.projectId === p.id).length;

                    if (doneCount % 4 === 0) {
                        const questId = uuidv4();
                        quests.push({
                            id: questId, title: `Jalon ${doneCount / 4} : ${p.title}`,
                            category: p.category, status: 'completed', xp: 120,
                            projectId: p.id, completedAt: currentDate, createdAt: currentDate
                        });
                        dailyXP += 120;
                        dailyQuestsCount++;
                    }

                    // Project Finish
                    if (doneCount === totalCount) {
                        p.status = 'completed';
                        p.progress = 100;
                        dailyXP += 400;
                        activeProjectTitles.delete(p.title);
                    } else {
                        p.progress = Math.round((doneCount / totalCount) * 100);
                    }
                }

                // Random Events
                if (Math.random() > 0.98) {
                    events.push({
                        id: uuidv4(), title: `Réunion : ${p.title}`, type: 'meeting',
                        projectId: p.id, startDate: currentDate, endDate: currentDate, createdAt: currentDate
                    });
                }
            });

            // --- HABITS Logic ---
            habits.forEach(h => {
                if (Math.random() < h.chance) {
                    habitLogs.push({ habitId: h.id, date: dateStr, count: 1 });
                    dailyXP += h.xp; dailyHabitsCount++;
                    h.streak++; if (h.streak > h.bestStreak) h.bestStreak = h.streak;
                    h.lastCompleted = currentDate;
                } else h.streak = 0;
            });

            // --- TRAINING Logic ---
            if (Math.random() > 0.92) {
                trainingSessions.push({
                    id: uuidv4(), type: Math.random() > 0.5 ? 'Fixe' : 'Libre',
                    intensity: 'medium', duration: 30 + Math.floor(Math.random() * 60),
                    xp: 60, date: currentDate, createdAt: currentDate,
                    exercises: [{ name: 'Session Historique', type: 'Dev', reps: 1, sets: 1 }]
                });
                dailyXP += 60;
            }

            // --- ANALYTICS ---
            analytics.push({
                id: `analytics-${dateStr}`, date: currentDate,
                xpEarned: dailyXP, habitsCompleted: dailyHabitsCount, questsCompleted: dailyQuestsCount
            });

            currentXP += dailyXP;

            if (i % 30 === 0) {
                progressCallback(10 + Math.floor((i / 365) * 80), `Génération... ${Math.floor(i / 30)} mois écoulés`);
            }
        }

        progressCallback(90, 'Stockage des mémoires...');

        // Final Bulk Adds
        await db.projects.bulkAdd(projects);
        await db.tasks.bulkAdd(tasks);
        await db.quests.bulkAdd(quests);
        await db.events.bulkAdd(events);
        await db.analytics.bulkAdd(analytics);
        await db.habit_logs.bulkAdd(habitLogs);
        await db.training.bulkAdd(trainingSessions);
        await db.notes.bulkAdd(notes);

        // Axiom Objectives
        await db.objectives.bulkAdd([
            { id: uuidv4(), name: 'Maîtriser le Code', type: 'learning', horizon: 'year', importance: 10, userId, isActive: 1, createdAt: startPoint },
            { id: uuidv4(), name: 'Mode de vie Sain', type: 'health', horizon: 'lifetime', importance: 8, userId, isActive: 1, createdAt: startPoint }
        ]);

        // Level Update
        const finalLevel = Math.floor(Math.sqrt(currentXP / 120)) + 1;
        await db.users.update(userId, {
            level: finalLevel, totalXP: currentXP,
            xp: currentXP % (finalLevel * 120), xpToNextLevel: (finalLevel + 1) * 120
        });

        // Current Active Items
        await this.generateActiveContent(now);

        progressCallback(100, 'Utilisateur imaginaire prêt !');
    },

    async populateDefaultLibrary(now) {
        // Quest Templates
        await db.quest_templates.bulkAdd([
            { title: 'Marathon Training', category: 'Santé', xp: 500, effort: 'high', steps: [{ title: 'Tests VMA', status: 'pending' }, { title: 'Sortie longue', status: 'pending' }], isCustom: false },
            { title: 'Apprendre React', category: 'Apprentissage', xp: 200, effort: 'medium', steps: [{ title: 'Hooks', status: 'pending' }, { title: 'Context', status: 'pending' }], isCustom: false },
            { title: 'Routine Matinale', category: 'Lifestyle', xp: 50, effort: 'low', steps: [{ title: 'Eau', status: 'pending' }, { title: 'Lecture', status: 'pending' }], isCustom: false }
        ]);

        // Unlockables
        await db.unlockables.bulkAdd([
            { id: 'theme-nebula', type: 'theme', name: 'Nébuleuse', description: 'Violets profonds.', rarity: 'rare', requirementType: 'level', requirementValue: 5, isUnlocked: false, xpCost: 500 },
            { id: 'title-architect', type: 'title', name: 'Architecte', description: 'Maître du temps.', rarity: 'rare', requirementType: 'level', requirementValue: 10, isUnlocked: false, xpCost: 800 }
        ]);
    },

    async generateActiveContent(now) {
        await db.quests.bulkAdd([
            { id: uuidv4(), title: 'Finaliser le Mode Dev', category: 'Travail', status: 'in_progress', priority: 'high', xp: 200, dueDate: addDays(now, 2), createdAt: now },
            { id: uuidv4(), title: 'Réviser les algorithmes', category: 'Apprentissage', status: 'active', priority: 'medium', xp: 150, createdAt: now }
        ]);
    }
};
