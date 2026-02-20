import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/db';
import { useHistory } from '../contexts/HistoryContext';
import { useApp } from '../contexts/AppContext';
import XPPopup from '../components/gamification/XPPopup';
import { AnimatePresence } from 'framer-motion';
import {
    Activity,
    Flame,
    Trophy,
    Plus,
    Trash2,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    MoreVertical,
    FolderKanban,
    PlusCircle,
    Calendar,
    BarChart3
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import { useTour } from '../contexts/TourContext';
import HabitsSkeleton from '../components/skeletons/HabitsSkeleton';
import { format } from 'date-fns';
import HabitHeatmap from '../components/habits/HabitHeatmap';
import HabitConsistency from '../components/habits/HabitConsistency';
import StreakCalendar from '../components/habits/StreakCalendar';

const Habits = () => {
    const [habits, setHabits] = useState([]);
    const [habitLogs, setHabitLogs] = useState({}); // Map habitId -> logs[]
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editHabit, setEditHabit] = useState(null);
    const [projects, setProjects] = useState([]);
    const [expandedHabitId, setExpandedHabitId] = useState(null);
    const [newStepTitle, setNewStepTitle] = useState('');
    const [showXPPopup, setShowXPPopup] = useState(null); // amount
    const { addXP } = useApp();
    const { startTour } = useTour();

    const [formData, setFormData] = useState({
        title: '',
        category: 'health',
        frequency: 'daily',
        dailyGoal: 1,
        projectId: null
    });

    const { executeDelete, history } = useHistory();

    useEffect(() => {
        loadHabits();
        loadProjects();
    }, [history]);

    const loadProjects = async () => {
        const data = await db.projects.toArray();
        setProjects(data);
    };

    const loadHabits = async () => {
        setIsLoading(true);
        const data = await db.habits.toArray();
        setHabits(data);

        // Load logs for all habits
        const logs = {};
        for (const habit of data) {
            const habitEntries = await db.habit_logs.where('habitId').equals(habit.id).toArray();
            logs[habit.id] = habitEntries.map(e => e.date); // Just dates for visualization
        }
        setHabitLogs(logs);

        setIsLoading(false);
    };

    const handleCreate = async () => {
        if (!formData.title.trim()) {
            toast.error('Le titre est requis');
            return;
        }

        try {
            if (editHabit) {
                await db.habits.update(editHabit.id, {
                    ...formData,
                    updatedAt: new Date()
                });
                toast.success('Habitude mise à jour !');
            } else {
                await db.habits.add({
                    id: `habit-${Date.now()}`,
                    ...formData,
                    streak: 0,
                    bestStreak: 0,
                    completionsToday: 0,
                    createdAt: new Date(),
                    completionDate: null
                });
                toast.success('Habitude créée !');
            }
            setIsCreateOpen(false);
            setEditHabit(null);
            setFormData({
                title: '',
                category: 'health',
                frequency: 'daily',
                dailyGoal: 1,
                projectId: null
            });
            loadHabits();
        } catch (error) {
            toast.error(editHabit ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création');
            console.error(error);
        }
    };

    const handleEdit = (habit) => {
        setEditHabit(habit);
        setFormData({
            title: habit.title,
            category: habit.category || 'health',
            frequency: habit.frequency || 'daily',
            dailyGoal: habit.dailyGoal || 1,
            projectId: habit.projectId || null
        });
        setIsCreateOpen(true);
    };

    const handleDelete = async (habit) => {
        await executeDelete('habits', habit.id, habit);
    };

    const handleComplete = async (habit) => {
        const today = new Date().toDateString();
        const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted).toDateString() : null;

        // Reset if new day
        let completionsToday = habit.completionsToday || 0;
        if (lastCompleted !== today) {
            completionsToday = 0;
        }

        if (completionsToday >= habit.dailyGoal) {
            toast.info('Objectif journalier déjà atteint !');
            return;
        }

        const newCompletionsToday = completionsToday + 1;
        const isGoalReached = newCompletionsToday >= habit.dailyGoal;

        // Update streak only when daily goal is reached
        const newStreak = isGoalReached ? (habit.streak || 0) + 1 : (habit.streak || 0);
        const newBestStreak = Math.max(newStreak, habit.bestStreak || 0);

        await db.habits.update(habit.id, {
            completionsToday: newCompletionsToday,
            streak: newStreak,
            bestStreak: newBestStreak,
            lastCompleted: new Date(),
            completionDate: new Date() // Keep for compatibility
        });

        // Log to habit_logs
        await db.habit_logs.add({
            habitId: habit.id,
            date: format(new Date(), 'yyyy-MM-dd'),
            count: 1
        });

        // Update XP via centralized context
        const xpGain = 10;
        addXP(xpGain, 'habit_completion');
        setShowXPPopup(xpGain);

        toast.success(`Bien joué ! ${isGoalReached ? 'Objectif atteint 🔥' : 'Continuez comme ça !'}`);
        loadHabits();
    };

    const toggleExpand = (id) => {
        setExpandedHabitId(expandedHabitId === id ? null : id);
    };

    return (
        <div className="space-y-6 pb-20" data-testid="habits-page">
            <AnimatePresence>
                {showXPPopup && (
                    <XPPopup
                        amount={showXPPopup}
                        onComplete={() => setShowXPPopup(null)}
                    />
                )}
            </AnimatePresence>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3" id="habits-title">
                        <Activity className="w-8 h-8 text-primary" />
                        Habitudes
                    </h1>
                    <p className="text-muted-foreground">Construisez votre discipline</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={(open) => {
                    setIsCreateOpen(open);
                    if (!open) setEditHabit(null);
                }}>
                    <DialogTrigger asChild>
                        <Button size="lg" className="gap-2" id="create-habit-btn">
                            <Plus className="w-5 h-5" /> Nouvelle Habitude
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editHabit ? `Modifier: ${editHabit.title}` : 'Nouvelle Habitude'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Titre</label>
                                <Input
                                    placeholder="Ex: Méditation, Lecture..."
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Catégorie</label>
                                <Select
                                    value={formData.category}
                                    onValueChange={v => setFormData({ ...formData, category: v })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="health">Santé</SelectItem>
                                        <SelectItem value="learning">Apprentissage</SelectItem>
                                        <SelectItem value="work">Travail</SelectItem>
                                        <SelectItem value="mindfulness">Mindfulness</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Lier à un Projet (Optionnel)</label>
                                <Select
                                    value={formData.projectId || "none"}
                                    onValueChange={v => setFormData({ ...formData, projectId: v === "none" ? null : v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Aucun projet" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Aucun projet</SelectItem>
                                        {projects.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Fréquence</label>
                                    <Select
                                        value={formData.frequency}
                                        onValueChange={v => setFormData({ ...formData, frequency: v })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Quotidien</SelectItem>
                                            <SelectItem value="weekly">Hebdomadaire</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Objectif / jour</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={formData.dailyGoal}
                                        onChange={e => setFormData({ ...formData, dailyGoal: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <Button onClick={handleCreate} className="w-full">
                                {editHabit ? 'Sauvegarder les modifications' : "Créer l'habitude"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 gap-4" data-testid="habits-list">
                {isLoading ? (
                    <HabitsSkeleton />
                ) : habits.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                        <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium">Aucune habitude</h3>
                        <p className="text-muted-foreground">Commencez petit, rêvez grand.</p>
                    </div>
                ) : habits.map(habit => {
                    const today = new Date().toDateString();
                    const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted).toDateString() : null;
                    const completionsToday = lastCompleted === today ? (habit.completionsToday || 0) : 0;
                    const progress = Math.min((completionsToday / habit.dailyGoal) * 100, 100);
                    const isExpanded = expandedHabitId === habit.id;
                    const logs = habitLogs[habit.id] || [];

                    return (
                        <div key={habit.id} className="bg-card border border-border rounded-xl transition-all hover:border-primary/50 overflow-hidden">
                            <div className="p-4 flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg">{habit.title}</h3>
                                        <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full capitalize">
                                            {habit.category}
                                        </span>
                                        {habit.projectId && (
                                            <Badge variant="secondary" className="text-[10px] h-5 bg-primary/10 text-primary border-primary/20">
                                                <FolderKanban className="w-3 h-3 mr-1" />
                                                {projects.find(p => p.id === habit.projectId)?.title || 'Projet...'}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Flame className={`w-4 h-4 ${habit.streak > 0 ? 'text-orange-500 fill-orange-500' : ''}`} />
                                            {habit.streak || 0} jours
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Trophy className="w-4 h-4 text-yellow-500" />
                                            Record: {habit.bestStreak || 0}
                                        </span>
                                    </div>

                                    <div className="mt-3 flex items-center gap-3">
                                        <Progress value={progress} className="h-2 w-32" />
                                        <span className="text-xs text-muted-foreground">
                                            {completionsToday} / {habit.dailyGoal}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 items-end">
                                    <Button
                                        size="icon"
                                        className={`rounded-full shadow-lg transition-transform active:scale-95 ${progress >= 100
                                            ? 'bg-green-500 hover:bg-green-600 text-white'
                                            : 'bg-primary hover:bg-primary/90'
                                            }`}
                                        onClick={() => handleComplete(habit)}
                                        disabled={progress >= 100 && false} // Allow over-achievement?
                                    >
                                        <CheckCircle2 className="w-6 h-6" />
                                    </Button>
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                                            onClick={() => handleEdit(habit)}
                                        >
                                            <PlusCircle className="w-4 h-4 rotate-45" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                            onClick={() => toggleExpand(habit.id)}
                                        >
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDelete(habit)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Visualization Section */}
                            {isExpanded && (
                                <div className="p-4 bg-muted/20 border-t border-border/50 space-y-6 animate-in slide-in-from-top-2">
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" /> Historique (Heatmap)
                                        </h4>
                                        <HabitHeatmap completions={logs} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                                <BarChart3 className="w-4 h-4" /> Consistance
                                            </h4>
                                            <HabitConsistency completions={logs} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                                <Flame className="w-4 h-4" /> Séries
                                            </h4>
                                            <StreakCalendar completions={logs} streak={habit.streak} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Habits;
