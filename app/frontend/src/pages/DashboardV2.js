import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/db';
// import { useTour } from '../contexts/TourContext';
import { Link } from 'react-router-dom';
import {
    Trophy, Flame, Target, Calendar, Quote,
    Zap, TrendingUp, CheckCircle2, LayoutDashboard, Settings2,
    Dumbbell, StickyNote, Sword, Medal
} from 'lucide-react';
import { Button } from '../components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from '../components/ui/dropdown-menu';
import StatCard from '../components/dashboard/StatCard';
import ProjectCard from '../components/dashboard/ProjectCard';
import TimelineEvent from '../components/dashboard/TimelineEvent';
import AxiomDecisionCard from '../components/AxiomDecisionCard';
import FocusMode from '../components/FocusMode';
import { format } from 'date-fns';

const DashboardV2 = () => {
    const { user } = useApp();

    // Customization State - Persisted
    const [visibleWidgets, setVisibleWidgets] = useState(() => {
        const saved = localStorage.getItem('dashboard_widgets_v2');
        try {
            return saved ? JSON.parse(saved) : {
                stats: true,
                habits: true,
                quests: true,
                projects: true,
                training: true,
                notes: true,
                axiom: true,
                today: true,
                quote: true
            };
        } catch (e) {
            return {
                stats: true, habits: true, quests: true, projects: true,
                training: true, notes: true, axiom: true, today: true, quote: true
            };
        }
    });

    const toggleWidget = (key) => {
        const newState = { ...visibleWidgets, [key]: !visibleWidgets[key] };
        setVisibleWidgets(newState);
        localStorage.setItem('dashboard_widgets_v2', JSON.stringify(newState));
    };

    const [data, setData] = useState({
        stats: { activeQuests: 0, completedHabits: 0, todayXP: 0, streak: 0 },
        activeProjects: [],
        todayEvents: [],
        habits: [],
        quests: [],
        notes: [],
        training: null
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

            // 3. Analytics
            const todayAnalytics = await db.analytics.where('date').equals(new Date(today)).first();

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

            setData({
                stats: {
                    activeQuests: activeQuests.length,
                    completedHabits: habits.filter(h => h.lastCompleted && new Date(h.lastCompleted).toDateString() === today).length,
                    todayXP: todayAnalytics ? todayAnalytics.xpGained : 0,
                    streak: maxStreak
                },
                habits: habits.slice(0, 6), // Show top 6
                quests: activeQuests,
                activeProjects: projectsWithProgress,
                todayEvents: combinedEvents,
                notes: recentNotes,
                training: trainingSession
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

    const xpProgress = user?.xpToNextLevel > 0
        ? (user?.currentXP / user?.xpToNextLevel) * 100
        : 0;

    return (
        <div className="space-y-6 pb-24 lg:pb-8 max-w-7xl mx-auto" data-testid="dashboard-v2">
            <FocusMode isOpen={isFocusOpen} onClose={() => setIsFocusOpen(false)} />

            {/* HEADER - Clean & Welcoming */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {getTimeOfDay()}, <span className="text-primary">{user?.username || 'Voyageur'}</span>
                    </h1>
                    <p className="text-muted-foreground mt-1">
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
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Personnaliser l'accueil</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {Object.keys(visibleWidgets).map(key => {
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
                                    <DropdownMenuCheckboxItem
                                        key={key}
                                        checked={visibleWidgets[key]}
                                        onCheckedChange={() => toggleWidget(key)}
                                    >
                                        {labels[key] || key}
                                    </DropdownMenuCheckboxItem>
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
                    {visibleWidgets.stats && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-card border border-border/50 rounded-xl p-4 flex flex-col justify-between hover:bg-accent/50 transition-colors">
                                <Trophy className="w-5 h-5 text-yellow-500 mb-2" />
                                <div>
                                    <div className="text-2xl font-bold">{user?.level || 1}</div>
                                    <div className="text-xs text-muted-foreground">Niveau</div>
                                </div>
                            </div>
                            <div className="bg-card border border-border/50 rounded-xl p-4 flex flex-col justify-between hover:bg-accent/50 transition-colors">
                                <Flame className="w-5 h-5 text-orange-500 mb-2" />
                                <div>
                                    <div className="text-2xl font-bold">{data.stats.streak}</div>
                                    <div className="text-xs text-muted-foreground">Jours de suite</div>
                                </div>
                            </div>
                            <div className="bg-card border border-border/50 rounded-xl p-4 flex flex-col justify-between hover:bg-accent/50 transition-colors">
                                <Target className="w-5 h-5 text-blue-500 mb-2" />
                                <div>
                                    <div className="text-2xl font-bold">{data.stats.activeQuests}</div>
                                    <div className="text-xs text-muted-foreground">Quêtes actives</div>
                                </div>
                            </div>
                            <div className="bg-card border border-border/50 rounded-xl p-4 flex flex-col justify-between hover:bg-accent/50 transition-colors">
                                <TrendingUp className="w-5 h-5 text-emerald-500 mb-2" />
                                <div>
                                    <div className="text-2xl font-bold">+{data.stats.todayXP}</div>
                                    <div className="text-xs text-muted-foreground">XP du jour</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* HABITS - Soft Bubbles */}
                    {visibleWidgets.habits && (
                        <div className="bg-card/50 rounded-2xl p-5 border border-border/50">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
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
                                            }}
                                            className={`
                                            flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center 
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
                    {visibleWidgets.quests && (
                        <div className="bg-card/50 rounded-2xl p-5 border border-border/50">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                                    <Sword className="w-4 h-4" /> Quêtes en cours
                                </h2>
                                <Link to="/quests" className="text-xs text-muted-foreground hover:text-primary transition-colors">Tout voir</Link>
                            </div>
                            <div className="space-y-2">
                                {data.quests.length > 0 ? data.quests.map(q => (
                                    <div key={q.id} className="group flex items-center justify-between p-3 rounded-xl bg-background border border-border/40 hover:border-border transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${q.priority === 'high' ? 'bg-red-400' : 'bg-blue-400'}`} />
                                            <span className="text-sm font-medium text-foreground/90">{q.title}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground font-mono">+{q.xpReward} XP</span>
                                    </div>
                                )) : (
                                    <div className="text-center py-6 text-sm text-muted-foreground">Aucune quête active.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* PROJECTS */}
                    {visibleWidgets.projects && (
                        <div>
                            <div className="flex items-center justify-between mb-4 px-1">
                                <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
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
                    {visibleWidgets.axiom && (
                        <div className="mt-6">
                            <AxiomDecisionCard />
                        </div>
                    )}
                </div>

                {/* SIDEBAR COLUMN */}
                <div className="lg:col-span-4 space-y-6">

                    {/* AGENDA */}
                    {visibleWidgets.today && (
                        <div className="bg-card/50 rounded-2xl p-5 border border-border/50 min-h-[300px]">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
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
                    {visibleWidgets.training && (
                        <div className="bg-card/50 rounded-2xl p-5 border border-border/50">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
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
                    {visibleWidgets.notes && (
                        <div className="bg-card/50 rounded-2xl p-5 border border-border/50">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
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
                    {visibleWidgets.quote && (
                        <div className="p-4 border-l-2 border-primary/20 pl-4 italic text-muted-foreground text-sm">
                            "{quote.text}"
                            <div className="mt-1 text-xs font-semibold not-italic text-foreground/60">— {quote.author}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardV2;
