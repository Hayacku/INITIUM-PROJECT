import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/db';
import { useTour } from '../contexts/TourContext';
import {
    Trophy,
    Flame,
    Target,
    Calendar,
    Clock,
    ArrowRight,
    Quote,
    LayoutDashboard,
    Brain,
    Activity,
    CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Dashboard = () => {
    const { user } = useApp();
    const { user: authUser } = useAuth();
    const { startTour } = useTour();

    const [stats, setStats] = useState({
        activeQuests: 0,
        completedHabits: 0,
        todayXP: 0,
        streak: 0
    });

    const [activeProjects, setActiveProjects] = useState([]);
    const [todayEvents, setTodayEvents] = useState([]);
    const [quote, setQuote] = useState({ text: "Le commencement est la moitié de tout.", author: "Platon" });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // 1. Stats
            const quests = await db.quests.where('status').equals('in_progress').toArray();
            const habits = await db.habits.toArray();
            const today = new Date().toDateString();

            // Calculate habit streak (simplified max of all habits)
            const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);

            // Get today's analytics for XP
            const todayAnalytics = await db.analytics.where('date').equals(new Date(today)).first();

            setStats({
                activeQuests: quests.length,
                completedHabits: habits.filter(h => h.lastCompleted && new Date(h.lastCompleted).toDateString() === today).length,
                todayXP: todayAnalytics ? todayAnalytics.xpGained : 0,
                streak: maxStreak
            });

            // 2. Active Projects (limit 3)
            const projects = await db.projects.toArray();
            // Simple progress calc (mockup logic as project progress is complex)
            const projectsWithProgress = await Promise.all(projects.slice(0, 3).map(async p => {
                const pQuests = await db.quests.where('projectId').equals(p.id).toArray();
                const completed = pQuests.filter(q => q.status === 'completed').length;
                const total = pQuests.length;
                const progress = total > 0 ? (completed / total) * 100 : 0;
                return { ...p, progress };
            }));
            setActiveProjects(projectsWithProgress);

            // 3. Today Events
            const events = await db.events.filter(e => {
                const d = new Date(e.startDate);
                return d.toDateString() === new Date().toDateString();
            }).toArray();

            // Add Quest deadlines for today
            const questDeadlines = await db.quests.filter(q => {
                if (!q.dueDate) return false;
                return new Date(q.dueDate).toDateString() === new Date().toDateString();
            }).toArray();

            setTodayEvents([
                ...events.map(e => ({ ...e, type: 'event' })),
                ...questDeadlines.map(q => ({ ...q, type: 'deadline', startDate: q.dueDate }))
            ].sort((a, b) => new Date(a.startDate) - new Date(b.startDate)));

        } catch (error) {
            console.error("Dashboard Load Error", error);
        }
    };

    const getTimeOfDay = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Bonjour";
        if (hour < 18) return "Bonne après-midi";
        return "Bonsoir";
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12" data-testid="dashboard-page">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-accent bg-clip-text text-transparent flex items-center gap-3 mb-2" data-testid="dashboard-title">
                        {getTimeOfDay()}, {user?.username || 'Voyageur'}
                    </h1>
                    <p className="text-muted-foreground text-lg">Prêt à conquérir cette journée ?</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 glass hover:bg-white/10" onClick={startTour}>
                        <Brain className="w-4 h-4" /> Tutoriel
                    </Button>
                    <Link to="/agenda">
                        <Button className="gap-2 shadow-lg shadow-primary/20">
                            <Calendar className="w-4 h-4" /> Agenda
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="stats-grid">
                <Card className="glass-card border-l-4 border-l-primary/50">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium mb-1">Niveau {user?.level || 1}</p>
                            <h3 className="text-3xl font-bold">{user?.currentXP || 0} XP</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-l-4 border-l-orange-500/50">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium mb-1">Série Max</p>
                            <h3 className="text-3xl font-bold">{stats.streak} Jours</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <Flame className="w-6 h-6 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-l-4 border-l-blue-500/50">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium mb-1">Quêtes Actives</p>
                            <h3 className="text-3xl font-bold">{stats.activeQuests}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Target className="w-6 h-6 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-l-4 border-l-green-500/50">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium mb-1">XP Aujourd'hui</p>
                            <h3 className="text-3xl font-bold">+{stats.todayXP}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Active Projects */}
                    <div className="glass-card p-6" data-testid="active-projects-widget">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <LayoutDashboard className="w-5 h-5 text-primary" /> Projets en cours
                            </h3>
                            <Link to="/projects" className="text-xs text-primary hover:underline">Voir tout</Link>
                        </div>
                        <div className="space-y-6">
                            {activeProjects.length > 0 ? activeProjects.map(p => (
                                <div key={p.id} className="group">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-medium group-hover:text-primary transition-colors">{p.title}</span>
                                        <span className="text-xs text-muted-foreground">{Math.round(p.progress)}%</span>
                                    </div>
                                    <Progress value={p.progress} className="h-2" />
                                </div>
                            )) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>Aucun projet actif. L'aventure commence par un premier pas.</p>
                                    <Link to="/projects"><Button variant="link" className="text-primary">Créer un projet</Button></Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quote of the Day */}
                    <div className="card-modern p-8 bg-gradient-to-br from-primary/5 to-transparent border-primary/10 relative overflow-hidden">
                        <Quote className="absolute top-4 left-4 w-12 h-12 text-primary/10 rotate-180" />
                        <div className="relative z-10 text-center">
                            <p className="text-xl md:text-2xl font-serif italic mb-4 text-glow">"{quote.text}"</p>
                            <p className="text-sm text-primary font-bold tracking-widest uppercase">- {quote.author}</p>
                        </div>
                    </div>

                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Agenda Widget */}
                    <div className="glass-card p-6 h-full flex flex-col">
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                            <Clock className="w-5 h-5 text-secondary" /> Aujourd'hui
                        </h3>
                        <div className="space-y-4 flex-1">
                            {todayEvents.length > 0 ? todayEvents.map((e, idx) => (
                                <div key={idx} className="flex gap-3 items-start p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className={`w-1 h-full min-h-[40px] rounded-full ${e.type === 'deadline' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                    <div>
                                        <p className="font-semibold text-sm">{e.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {e.startTime || format(new Date(e.startDate), 'HH:mm')}
                                            {e.type === 'deadline' && ' (Deadline)'}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-center">
                                    <CheckCircle2 className="w-8 h-8 mb-2 opacity-50" />
                                    <p className="text-sm">Rien de prévu.<br />Profitez-en pour avancer vos quêtes !</p>
                                </div>
                            )}
                        </div>
                        <Link to="/agenda" className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-sm text-muted-foreground hover:text-white group">
                            <span>Ouvrir l'agenda</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
