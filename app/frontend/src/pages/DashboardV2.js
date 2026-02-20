import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/db';
// import { useTour } from '../contexts/TourContext';
import { Link } from 'react-router-dom';
import {
    Trophy, Flame, Target, Calendar, Quote,
    Zap, TrendingUp, CheckCircle2, LayoutDashboard, Settings2,
    Dumbbell, StickyNote, Sword, Medal, Maximize2, Minimize2,
    Lock
} from 'lucide-react';
import { Button } from '../components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent
} from '../components/ui/dropdown-menu';
import StatCard from '../components/dashboard/StatCard';
import ProjectCard from '../components/dashboard/ProjectCard';
import TimelineEvent from '../components/dashboard/TimelineEvent';
import AxiomDecisionCard from '../components/AxiomDecisionCard';
import FocusMode from '../components/FocusMode';
import { format } from 'date-fns';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const DashboardV2 = () => {
    const { user, addXP, activeTitle } = useApp();

    // Widget size presets (grid units: cols = 12)
    const WIDGET_SIZES = {
        small: { w: 4, h: 3 },
        medium: { w: 6, h: 4 },
        large: { w: 12, h: 5 }
    };

    // Default layout configuration
    const getDefaultLayout = () => [
        { i: 'stats', x: 0, y: 0, w: 12, h: 2, minW: 4, minH: 2 },
        { i: 'habits', x: 0, y: 2, w: 8, h: 4, minW: 4, minH: 3 },
        { i: 'quests', x: 0, y: 6, w: 8, h: 5, minW: 4, minH: 4 },
        { i: 'projects', x: 0, y: 11, w: 8, h: 5, minW: 4, minH: 4 },
        { i: 'today', x: 8, y: 2, w: 4, h: 6, minW: 3, minH: 5 },
        { i: 'training', x: 8, y: 8, w: 4, h: 4, minW: 3, minH: 3 },
        { i: 'notes', x: 8, y: 12, w: 4, h: 4, minW: 3, minH: 3 },
        { i: 'axiom', x: 0, y: 16, w: 8, h: 5, minW: 4, minH: 4 },
        { i: 'quote', x: 8, y: 16, w: 4, h: 2, minW: 3, minH: 2 }
    ];

    // Customization State - Persisted
    const [widgetConfig, setWidgetConfig] = useState(() => {
        const saved = localStorage.getItem('dashboard_widgets_config_v3');
        try {
            return saved ? JSON.parse(saved) : {
                stats: { visible: true, size: 'large' },
                habits: { visible: true, size: 'large' },
                quests: { visible: true, size: 'large' },
                projects: { visible: true, size: 'large' },
                training: { visible: true, size: 'medium' },
                notes: { visible: true, size: 'medium' },
                axiom: { visible: true, size: 'large' },
                today: { visible: true, size: 'medium' },
                quote: { visible: true, size: 'small' }
            };
        } catch (e) {
            return {
                stats: { visible: true, size: 'large' },
                habits: { visible: true, size: 'large' },
                quests: { visible: true, size: 'large' },
                projects: { visible: true, size: 'large' },
                training: { visible: true, size: 'medium' },
                notes: { visible: true, size: 'medium' },
                axiom: { visible: true, size: 'large' },
                today: { visible: true, size: 'medium' },
                quote: { visible: true, size: 'small' }
            };
        }
    });

    const [layout, setLayout] = useState(() => {
        const savedLayout = localStorage.getItem('dashboard_layout_v3');
        return savedLayout ? JSON.parse(savedLayout) : getDefaultLayout();
    });

    const toggleWidget = (key) => {
        const newConfig = {
            ...widgetConfig,
            [key]: { ...widgetConfig[key], visible: !widgetConfig[key].visible }
        };
        setWidgetConfig(newConfig);
        localStorage.setItem('dashboard_widgets_config_v3', JSON.stringify(newConfig));
    };

    const changeWidgetSize = (key, size) => {
        const newConfig = {
            ...widgetConfig,
            [key]: { ...widgetConfig[key], size }
        };
        setWidgetConfig(newConfig);
        localStorage.setItem('dashboard_widgets_config_v3', JSON.stringify(newConfig));

        // Update layout with new size
        const sizeConfig = WIDGET_SIZES[size];
        const newLayout = layout.map(item =>
            item.i === key
                ? { ...item, w: sizeConfig.w, h: sizeConfig.h }
                : item
        );
        setLayout(newLayout);
        localStorage.setItem('dashboard_layout_v3', JSON.stringify(newLayout));
    };

    const onLayoutChange = (newLayout) => {
        setLayout(newLayout);
        localStorage.setItem('dashboard_layout_v3', JSON.stringify(newLayout));
    };

    const [data, setData] = useState({
        stats: { activeQuests: 0, completedHabits: 0, todayXP: 0, streak: 0, totalXP: 0 },
        activeProjects: [],
        todayEvents: [],
        habits: [],
        quests: [],
        notes: [],
        training: null,
        nextBadge: null
    });
    const [isFocusOpen, setIsFocusOpen] = useState(false);
    const [quote] = useState({
        text: "Every choice you make is a vote for the person you wish to become.",
        author: "James Clear"
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const today = new Date().toDateString();

            // 1. Habits
            const habits = await db.habits.toArray();
            const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);

            // 2. Quests
            const activeQuests = await db.quests.where('status').equals('in_progress').limit(5).toArray();

            // 3. Analytics & XP
            const allAnalytics = await db.analytics.toArray();
            const todayAnalytics = allAnalytics.find(a => new Date(a.date).toDateString() === today);
            const totalXP = allAnalytics.reduce((acc, curr) => acc + (curr.xpEarned || curr.xpGained || 0), 0);

            // 4. Projects
            const projects = await db.projects.toArray();
            const projectsWithProgress = await Promise.all(projects.slice(0, 3).map(async p => {
                const pQuests = await db.quests.where('projectId').equals(p.id).toArray();
                const completed = pQuests.filter(q => q.status === 'completed').length;
                const total = pQuests.length;
                const progress = total > 0 ? (completed / total) * 100 : 0;
                return { ...p, progress };
            }));

            // 5. Events / Deadlines
            const events = await db.events.filter(e => {
                const d = new Date(e.startDate);
                return d.toDateString() === today;
            }).toArray();
            const questDeadlines = await db.quests.filter(q => {
                if (!q.dueDate) return false;
                return new Date(q.dueDate).toDateString() === today;
            }).toArray();
            const combinedEvents = [
                ...events.map(e => ({ ...e, type: 'event' })),
                ...questDeadlines.map(q => ({ ...q, type: 'deadline', startDate: q.dueDate }))
            ].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

            // 6. Notes (Recent 3)
            const recentNotes = await db.notes.orderBy('updatedAt').reverse().limit(3).toArray();

            // 7. Training (Mock for now, or fetch from db if exists)
            // Assuming we might have a 'workouts' table later
            const trainingSession = { label: "Séance Haut du Corps", time: "18:00" }; // Placeholder

            // 8. Gamification
            const unlockables = await db.unlockables.toArray();
            // Fallback seed calculation for next badge
            let nextBadge = null;
            if (unlockables.length > 0) {
                const lockedBadges = unlockables
                    .filter(u => u.category === 'badge' && !u.isUnlocked)
                    .sort((a, b) => a.xpCost - b.xpCost);
                nextBadge = lockedBadges.length > 0 ? lockedBadges[0] : null;
            }

            setData({
                stats: {
                    activeQuests: activeQuests.length,
                    completedHabits: habits.filter(h => h.lastCompleted && new Date(h.lastCompleted).toDateString() === today).length,
                    todayXP: todayAnalytics ? (todayAnalytics.xpEarned || todayAnalytics.xpGained || 0) : 0,
                    streak: maxStreak,
                    totalXP: user?.xp || 0
                },
                habits: habits.slice(0, 6), // Show top 6
                quests: activeQuests,
                activeProjects: projectsWithProgress,
                todayEvents: combinedEvents,
                notes: recentNotes,
                training: trainingSession,
                nextBadge
            });

        } catch (error) {
            console.error("Dashboard Load Error", error);
        }
    };

    const getTimeOfDay = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Bonjour";
        if (hour < 18) return "Bon après-midi";
        return "Bonsoir";
    };

    const calculatedLevel = user?.level || 1;
    const currentXP = user?.xp || 0;
    const xpToNextLevel = user?.xpToNextLevel || 100;

    return (
        <div className="space-y-6 pb-24 lg:pb-8 max-w-7xl mx-auto" data-testid="dashboard-v2">
            <FocusMode isOpen={isFocusOpen} onClose={() => setIsFocusOpen(false)} />

            {/* HEADER - Clean & Welcoming */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
                <div className="max-w-full overflow-hidden">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground truncate sm:whitespace-normal">
                            {getTimeOfDay()}, <span className="text-primary">{user?.username || 'Initié'}</span>
                        </h1>
                        {activeTitle && (
                            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 uppercase text-[10px] font-black italic tracking-widest px-3 py-1 shrink-0">
                                {activeTitle}
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Aujourd'hui est une nouvelle opportunité.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setIsFocusOpen(true)}
                        variant="ghost"
                        className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                        <Zap className="w-4 h-4" /> Focus
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                                <Settings2 className="w-5 h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                            <DropdownMenuLabel>Personnaliser l'accueil</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {Object.keys(widgetConfig).map(key => {
                                const labels = {
                                    stats: 'Statistiques',
                                    habits: 'Habitudes',
                                    quests: 'Quêtes',
                                    projects: 'Projets',
                                    training: 'Entraînement',
                                    notes: 'Notes',
                                    axiom: 'Axiom Engine',
                                    today: 'Agenda',
                                    quote: 'Citation'
                                };
                                return (
                                    <div key={key} className="flex items-center justify-between py-1 px-2">
                                        <DropdownMenuCheckboxItem
                                            checked={widgetConfig[key].visible}
                                            onCheckedChange={() => toggleWidget(key)}
                                            className="flex-1"
                                        >
                                            {labels[key] || key}
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger className="h-6 px-2">
                                                {widgetConfig[key].size === 'small' && <Minimize2 className="w-3 h-3" />}
                                                {widgetConfig[key].size === 'medium' && <span className="text-xs">M</span>}
                                                {widgetConfig[key].size === 'large' && <Maximize2 className="w-3 h-3" />}
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuCheckboxItem
                                                    checked={widgetConfig[key].size === 'small'}
                                                    onCheckedChange={() => changeWidgetSize(key, 'small')}
                                                >
                                                    Petit
                                                </DropdownMenuCheckboxItem>
                                                <DropdownMenuCheckboxItem
                                                    checked={widgetConfig[key].size === 'medium'}
                                                    onCheckedChange={() => changeWidgetSize(key, 'medium')}
                                                >
                                                    Moyen
                                                </DropdownMenuCheckboxItem>
                                                <DropdownMenuCheckboxItem
                                                    checked={widgetConfig[key].size === 'large'}
                                                    onCheckedChange={() => changeWidgetSize(key, 'large')}
                                                >
                                                    Grand
                                                </DropdownMenuCheckboxItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                    </div>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">

                {/* PRIMARY COLUMN */}
                <div className="lg:col-span-8 space-y-6">

                    {/* STATS - Minimalist */}
                    {widgetConfig.stats.visible && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 overflow-hidden">
                            <div className="bg-card border border-border/50 rounded-xl p-3 sm:p-4 flex flex-col justify-between hover:bg-accent/50 transition-colors min-w-0 overflow-hidden relative">
                                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 mb-2 shrink-0" />
                                <div className="min-w-0">
                                    <div className="text-xl sm:text-2xl font-bold truncate">Niveau {calculatedLevel}</div>
                                    <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                        Initié • x{(1 + Math.floor(calculatedLevel / 5) * 0.02).toFixed(2)} XP
                                    </div>
                                </div>
                            </div>
                            <div className="bg-card border border-border/50 rounded-xl p-3 sm:p-4 flex flex-col justify-between hover:bg-accent/50 transition-colors min-w-0 overflow-hidden">
                                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mb-2 shrink-0" />
                                <div className="min-w-0">
                                    <div className="text-xl sm:text-2xl font-bold truncate">{currentXP}</div>
                                    <div className="text-[10px] sm:text-xs text-muted-foreground truncate">XP Actuel</div>
                                </div>
                            </div>

                            {/* Next Badge Progress */}
                            <div className="bg-card border border-border/50 rounded-xl p-3 sm:p-4 flex flex-col justify-between hover:bg-accent/50 transition-colors col-span-2 sm:col-span-2 min-w-0 overflow-hidden">
                                <div className="flex justify-between items-start mb-2 gap-1">
                                    <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 shrink-0" />
                                    <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{xpToNextLevel - currentXP} XP restants</span>
                                </div>
                                <div className="min-w-0">
                                    <div className="flex justify-between text-[10px] sm:text-xs font-medium mb-1 gap-2">
                                        <span className="truncate">Vers Niveau {calculatedLevel + 1}</span>
                                        <span className="shrink-0">{Math.floor((currentXP / xpToNextLevel) * 100)}%</span>
                                    </div>
                                    <Progress value={(currentXP / xpToNextLevel) * 100} className="h-1.5 sm:h-2" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* HABITS - Soft Bubbles */}
                    {widgetConfig.habits.visible && (
                        <div className="glass-card p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground/80">
                                    <CheckCircle2 className="w-4 h-4" /> Habitudes
                                </h2>
                                <Link to="/habits" className="text-xs text-muted-foreground hover:text-primary transition-colors">Tout voir</Link>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                                {data.habits.length > 0 ? data.habits.map(h => {
                                    const isDone = h.lastCompleted && new Date(h.lastCompleted).toDateString() === new Date().toDateString();
                                    return (
                                        <div
                                            key={h.id}
                                            onClick={async () => {
                                                if (isDone) return;
                                                const newStreak = (h.streak || 0) + 1;
                                                const updatedHabit = { ...h, streak: newStreak, lastCompleted: new Date() };
                                                setData(prev => ({
                                                    ...prev,
                                                    habits: prev.habits.map(hab => hab.id === h.id ? updatedHabit : hab),
                                                    stats: {
                                                        ...prev.stats,
                                                        completedHabits: prev.stats.completedHabits + 1,
                                                        streak: Math.max(prev.stats.streak, newStreak)
                                                    }
                                                }));
                                                await db.habits.update(h.id, {
                                                    streak: newStreak,
                                                    bestStreak: Math.max(newStreak, h.bestStreak || 0),
                                                    lastCompleted: new Date()
                                                });

                                                // Add XP
                                                const todayStr = new Date().toDateString();
                                                const existingAnalytics = await db.analytics.where('date').equals(new Date(todayStr)).first();
                                                if (existingAnalytics) {
                                                    await db.analytics.update(existingAnalytics.id, {
                                                        habitsCompleted: (existingAnalytics.habitsCompleted || 0) + 1,
                                                        xpEarned: (existingAnalytics.xpEarned || 0) + 10
                                                    });
                                                } else {
                                                    await db.analytics.add({
                                                        id: `analytics-${todayStr}`,
                                                        date: new Date(todayStr),
                                                        habitsCompleted: 1,
                                                        xpEarned: 10,
                                                        questsCompleted: 0
                                                    });
                                                }
                                                toast.success("+10 XP !");
                                                loadDashboardData(); // Reload for XP update
                                            }}
                                            className={`
                                            flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center 
                                            transition-all cursor-pointer select-none
                                            ${isDone
                                                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                    : 'bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground'
                                                }
                                        `}>
                                            {isDone ? <CheckCircle2 className="w-6 h-6" /> : <span className="text-xl font-medium">{h.title.charAt(0)}</span>}
                                        </div>
                                    )
                                }) : <p className="text-sm text-muted-foreground">Aucune habitude définie.</p>}
                            </div>
                        </div>
                    )}

                    {/* ACTIVE QUESTS - Clean List */}
                    {widgetConfig.quests.visible && (
                        <div className="glass-card p-5 overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold flex items-center gap-2 text-foreground/80 truncate">
                                    <Sword className="w-4 h-4 shrink-0" /> Quêtes en cours
                                </h2>
                                <Link to="/quests" className="text-xs text-muted-foreground hover:text-primary transition-colors shrink-0">Tout voir</Link>
                            </div>
                            <div className="space-y-2">
                                {data.quests.length > 0 ? data.quests.map(q => (
                                    <div key={q.id} className="group flex items-center justify-between p-3 rounded-xl bg-background border border-border/40 hover:border-border transition-colors min-w-0 overflow-hidden gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-2 h-2 rounded-full shrink-0 ${q.priority === 'high' ? 'bg-red-400' : 'bg-blue-400'}`} />
                                            <span className="text-sm font-medium text-foreground/90 truncate">{q.title}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground font-mono shrink-0">+{q.xpReward} XP</span>
                                    </div>
                                )) : (
                                    <div className="text-center py-6 text-sm text-muted-foreground">Aucune quête active.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* PROJECTS */}
                    {widgetConfig.projects.visible && (
                        <div>
                            <div className="flex items-center justify-between mb-4 px-1">
                                <h2 className="text-sm font-bold flex items-center gap-2 text-foreground/80">
                                    <LayoutDashboard className="w-4 h-4" /> Projets
                                </h2>
                                <Link to="/projects" className="text-xs text-muted-foreground hover:text-primary transition-colors">Tout voir</Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.activeProjects.map(p => <ProjectCard key={p.id} project={p} compact />)}
                            </div>
                        </div>
                    )}

                    {/* AXIOM */}
                    {widgetConfig.axiom.visible && (
                        <div className="mt-6">
                            <AxiomDecisionCard />
                        </div>
                    )}
                </div>

                {/* SIDEBAR COLUMN */}
                <div className="lg:col-span-4 space-y-6">

                    {/* AGENDA */}
                    {widgetConfig.today.visible && (
                        <div className="glass-card p-5 min-h-[300px]">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold flex items-center gap-2 text-foreground/80">
                                    <Calendar className="w-4 h-4" /> Aujourd'hui
                                </h2>
                                <span className="text-xs text-muted-foreground capitalize">
                                    {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' })}
                                </span>
                            </div>
                            <div className="space-y-4">
                                {data.todayEvents.length > 0 ? data.todayEvents.map((e, i) => (
                                    <TimelineEvent key={i} event={e} />
                                )) : <p className="text-sm text-muted-foreground text-center py-8">Rien de prévu.</p>}
                            </div>
                        </div>
                    )}

                    {/* TRAINING WIDGET */}
                    {widgetConfig.training.visible && (
                        <div className="glass-card p-5">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-sm font-bold flex items-center gap-2 text-foreground/80">
                                    <Dumbbell className="w-4 h-4" /> Entraînement
                                </h2>
                            </div>
                            <div className="flex items-center justify-between bg-background rounded-xl p-3 border border-border/40">
                                <div>
                                    <div className="text-sm font-medium">{data.training?.label || "Repos"}</div>
                                    <div className="text-xs text-muted-foreground capitalize">{data.training?.time || "Aucune séance prévue"}</div>
                                </div>
                                <Link to="/training">
                                    <Button size="sm" variant="secondary" className="h-8 text-xs">
                                        {data.training ? 'Voir' : 'Planifier'}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* NOTES WIDGET - Simple */}
                    {widgetConfig.notes.visible && (
                        <div className="glass-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-bold flex items-center gap-2 text-foreground/80">
                                    <StickyNote className="w-4 h-4" /> Notes récentes
                                </h2>
                                <Link to="/notes" className="text-xs text-muted-foreground hover:text-primary">+</Link>
                            </div>
                            <div className="space-y-2">
                                {data.notes.length > 0 ? data.notes.map(n => (
                                    <div key={n.id} className="text-sm p-3 bg-background border border-border/40 rounded-xl hover:border-border transition-colors cursor-pointer truncate text-muted-foreground hover:text-foreground">
                                        {n.title || "Note sans titre"}
                                    </div>
                                )) : <p className="text-xs text-muted-foreground text-center py-2">Aucune note.</p>}
                            </div>
                        </div>
                    )}

                    {/* QUOTE - Minimal */}
                    {widgetConfig.quote.visible && (
                        <div className="p-4 border-l-2 border-primary/20 pl-4 italic text-muted-foreground text-sm">
                            "{quote.text}"
                            <div className="mt-1 text-xs font-bold not-italic text-foreground/60">— {quote.author}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardV2;
