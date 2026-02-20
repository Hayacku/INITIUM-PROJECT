
import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { useHistory } from '../contexts/HistoryContext';
import { useApp } from '../contexts/AppContext';
import XPPopup from '../components/gamification/XPPopup';
import { AnimatePresence } from 'framer-motion';
import {
    Sword,
    Plus,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Circle,
    TrendingUp,
    Zap,
    MoreVertical,
    Trash2,
    Filter,
    ListTodo,
    ChevronDown,
    ChevronUp,
    Ban,
    PlusCircle,
    X,
    Repeat,
    Copy,
    Library,
    LayoutGrid,
    List
} from 'lucide-react';
import { Button } from '../components/ui/button';
import QuestKanban from '../components/quests/QuestKanban';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../components/ui/tooltip";
import { toast } from 'sonner';
import { useTour } from '../contexts/TourContext';
import QuestsSkeleton from '../components/skeletons/QuestsSkeleton';
import { calculateXP } from '../utils/xpCalculator';

const Quests = () => {
    const [quests, setQuests] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isTemplateOpen, setIsTemplateOpen] = useState(false);
    const [editQuest, setEditQuest] = useState(null);
    const [viewMode, setViewMode] = useState(() => localStorage.getItem('quests_view_mode') || 'list');
    const { startTour } = useTour();

    // Form State
    const [step, setStep] = useState(1);
    const [newStepTitle, setNewStepTitle] = useState('');
    const [expandedQuests, setExpandedQuests] = useState(new Set());
    const [showXPPopup, setShowXPPopup] = useState(null); // amount
    const { addXP } = useApp();
    const { executeDelete, history } = useHistory();
    const [formData, setFormData] = useState({
        title: '',
        category: 'personal',
        description: '',
        priority: 'medium',
        dueDate: '',
        xp: 50,
        effort: 'medium',
        estimatedDuration: 30, // Default 30 mins
        recurrence: 'none', // none, daily, weekly, monthly
        steps: [] // { id, title, status: 'pending' | 'completed' | 'obsolete' }
    });

    useEffect(() => {
        loadQuests();
        loadTemplates();
        loadProjects();
    }, [history]);

    const loadQuests = async () => {
        setIsLoading(true);
        const data = await db.quests.reverse().toArray();
        setQuests(data);
        setIsLoading(false);
    };

    const loadTemplates = async () => {
        const data = await db.quest_templates.toArray();
        setTemplates(data);
    };

    const loadProjects = async () => {
        const data = await db.projects.toArray();
        setProjects(data);
    };

    // Smart Defaults Logic
    useEffect(() => {
        const calculated = calculateXP(formData.category, formData.effort, formData.estimatedDuration);
        setFormData(prev => ({ ...prev, xp: calculated }));
    }, [formData.category, formData.effort, formData.estimatedDuration]);

    const handleCreate = async () => {
        if (!formData.title.trim()) {
            toast.error('Le titre est requis');
            return;
        }

        try {
            if (editQuest) {
                await db.quests.update(editQuest.id, {
                    ...formData,
                    updatedAt: new Date()
                });
                toast.success('Quête mise à jour !');
            } else {
                await db.quests.add({
                    id: `quest-${Date.now()}`,
                    ...formData,
                    status: 'in_progress',
                    progress: 0,
                    createdAt: new Date(),
                    isExample: false
                });
                toast.success('Quête créée avec succès !');
            }
            setIsCreateOpen(false);
            setEditQuest(null);
            setStep(1);
            resetForm();
            loadQuests();
        } catch (error) {
            toast.error(editQuest ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création');
            console.error(error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            category: 'personal',
            description: '',
            priority: 'medium',
            dueDate: '',
            xp: 50,
            effort: 'medium',
            estimatedDuration: 30,
            recurrence: 'none',
            projectId: null,
            steps: []
        });
    };

    const handleSaveAsTemplate = async () => {
        if (!formData.title.trim()) {
            toast.error('Le titre est requis pour le modèle');
            return;
        }
        try {
            await db.quest_templates.add({
                title: formData.title,
                category: formData.category,
                xp: formData.xp,
                effort: formData.effort,
                steps: formData.steps.map(s => ({ title: s.title, status: 'pending' })), // Reset status
                description: formData.description,
                isCustom: true
            });
            toast.success('Modèle sauvegardé !');
            loadTemplates();
        } catch (error) {
            toast.error('Erreur sauvegarde modèle');
        }
    };

    const handleUseTemplate = (template) => {
        setFormData({
            ...formData,
            title: template.title,
            category: template.category || 'personal',
            xp: template.xp || 50,
            effort: template.effort || 'medium',
            description: template.description || '',
            steps: (template.steps || []).map(s => ({
                id: `step-${Date.now()}-${Math.random()}`,
                title: s.title,
                status: 'pending'
            }))
        });
        setIsTemplateOpen(false);
        setStep(1); // Start at step 1 to review
        // toast.success('Modèle chargé !');
    };

    const handleDelete = async (quest) => {
        await executeDelete('quests', quest.id, quest);
    };

    const handleStatusChange = async (quest, newStatus) => {
        const activeSteps = (quest.steps || []).filter(s => s.status !== 'obsolete');
        if (newStatus === 'completed' && activeSteps.length > 0 && activeSteps.some(s => s.status !== 'completed')) {
            if (!window.confirm('Certaines étapes ne sont pas cochées. Terminer quand même ?')) {
                return;
            }
        }

        const updates = { status: newStatus };
        if (newStatus === 'completed') {
            updates.completedAt = new Date();

            // Handle Recurrence
            if (quest.recurrence && quest.recurrence !== 'none') {
                const nextDate = new Date();
                if (quest.recurrence === 'daily') nextDate.setDate(nextDate.getDate() + 1);
                if (quest.recurrence === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
                if (quest.recurrence === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);

                // Create next instance
                const newQuest = {
                    ...quest,
                    id: `quest-${Date.now()}`,
                    status: 'in_progress',
                    progress: 0,
                    createdAt: new Date(),
                    dueDate: nextDate,
                    completedAt: null,
                    steps: (quest.steps || []).map(s => ({ ...s, status: 'pending' })) // Reset steps
                };

                await db.quests.add(newQuest);
                toast.success(`Quête terminée ! Prochaine occurrence: ${nextDate.toLocaleDateString()}`);
            } else {
                toast.success(`Quête terminée ! +${quest.xp} XP`);
            }

            // Centralized XP Gain
            const xpGain = quest.xp || 50;
            addXP(xpGain, 'quest_completion');
            setShowXPPopup(xpGain);
        }

        await db.quests.update(quest.id, updates);
        loadQuests();
    };

    const handleEdit = (quest) => {
        setEditQuest(quest);
        setFormData({
            title: quest.title,
            category: quest.category || 'personal',
            description: quest.description || '',
            priority: quest.priority || 'medium',
            dueDate: quest.dueDate ? (quest.dueDate instanceof Date ? quest.dueDate.toISOString().split('T')[0] : quest.dueDate) : '',
            xp: quest.xp || 50,
            effort: quest.effort || 'medium',
            estimatedDuration: quest.estimatedDuration || 30,
            recurrence: quest.recurrence || 'none',
            projectId: quest.projectId || null,
            steps: quest.steps || []
        });
        setStep(1);
        setIsCreateOpen(true);
    };

    const addStepToQuest = async (questId, steps) => {
        if (!newStepTitle.trim()) return;
        const newStep = {
            id: `step-${Date.now()}`,
            title: newStepTitle,
            status: 'pending'
        };
        const updatedSteps = [...(steps || []), newStep];

        // Calculate new progress
        const activeSteps = updatedSteps.filter(s => s.status !== 'obsolete');
        const completedStepsCount = activeSteps.filter(s => s.status === 'completed').length;
        const progress = activeSteps.length > 0 ? (completedStepsCount / activeSteps.length) * 100 : 0;

        await db.quests.update(questId, {
            steps: updatedSteps,
            progress: Math.round(progress)
        });
        setNewStepTitle('');
        loadQuests();
    };

    const addStepToForm = () => {
        if (!newStepTitle.trim()) return;
        setFormData(prev => ({
            ...prev,
            steps: [...prev.steps, {
                id: `step-${Date.now()}`,
                title: newStepTitle,
                status: 'pending'
            }]
        }));
        setNewStepTitle('');
    };

    const removeStepFromForm = (id) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.filter(s => s.id !== id)
        }));
    };

    const toggleQuestExpansion = (id) => {
        const newExpanded = new Set(expandedQuests);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        setExpandedQuests(newExpanded);
    };

    const updateStepStatus = async (quest, stepId, newStatus) => {
        const newSteps = quest.steps.map(s =>
            s.id === stepId ? { ...s, status: newStatus } : s
        );

        const activeSteps = newSteps.filter(s => s.status !== 'obsolete');
        const completedStepsCount = activeSteps.filter(s => s.status === 'completed').length;
        const progress = activeSteps.length > 0 ? (completedStepsCount / activeSteps.length) * 100 : 0;

        await db.quests.update(quest.id, {
            steps: newSteps,
            progress: Math.round(progress)
        });
        loadQuests();
    };

    return (
        <div className="space-y-6 pb-20" data-testid="quests-page">
            <AnimatePresence>
                {showXPPopup && (
                    <XPPopup
                        amount={showXPPopup}
                        onComplete={() => setShowXPPopup(null)}
                    />
                )}
            </AnimatePresence>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3" id="quests-title">
                        <Sword className="w-8 h-8 text-primary" />
                        Quêtes
                    </h1>
                    <p className="text-muted-foreground">Vos missions épiques au quotidien</p>
                </div>

                <div className="flex gap-2">
                    <Dialog open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Library className="w-4 h-4" /> Modèles
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Bibliothèque de Quêtes</DialogTitle>
                                <DialogDescription>Choisissez un modèle pour commencer rapidement.</DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto">
                                {templates.map(template => (
                                    <div key={template.id} className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => {
                                        handleUseTemplate(template);
                                        setIsCreateOpen(true);
                                    }}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold">{template.title}</h3>
                                            <Badge variant="secondary" className="text-[10px]">{template.category}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{template.description || 'Pas de description'}</p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500" /> {template.xp} XP</span>
                                            {template.steps && <span className="flex items-center gap-1"><ListTodo className="w-3 h-3" /> {template.steps.length} étapes</span>}
                                        </div>
                                        {template.isCustom && <Badge variant="outline" className="mt-2 text-[10px]">Custom</Badge>}
                                    </div>
                                ))}
                                {templates.length === 0 && <p className="text-center col-span-2 text-muted-foreground">Aucun modèle disponible.</p>}
                            </div>
                        </DialogContent>
                    </Dialog>

                    <div className="flex bg-muted/30 p-1 rounded-lg border border-border/50">
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 px-2 gap-2"
                            onClick={() => { setViewMode('list'); localStorage.setItem('quests_view_mode', 'list'); }}
                        >
                            <List className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 px-2 gap-2"
                            onClick={() => { setViewMode('kanban'); localStorage.setItem('quests_view_mode', 'kanban'); }}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                    </div>

                    <Dialog open={isCreateOpen} onOpenChange={(open) => {
                        setIsCreateOpen(open);
                        if (!open) setEditQuest(null);
                    }}>
                        <DialogTrigger asChild>
                            <Button size="lg" className="gap-2" id="create-quest-btn" onClick={() => resetForm()}>
                                <Plus className="w-5 h-5" /> Nouvelle Quête
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>{editQuest ? `Modifier: ${editQuest.title}` : 'Nouvelle Quête'} {step === 2 && '(Détails)'}</DialogTitle>
                                <DialogDescription>
                                    {step === 1 ? "Définissons l'objectif principal." : "Affinons les récompenses et contraintes."}
                                </DialogDescription>
                            </DialogHeader>

                            {step === 1 ? (
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Titre de la quête</label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Ex: Apprendre les bases de Python"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Catégorie</label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={v => setFormData({ ...formData, category: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choisir..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="personal">Personnel</SelectItem>
                                                <SelectItem value="work">Travail</SelectItem>
                                                <SelectItem value="learning">Apprentissage</SelectItem>
                                                <SelectItem value="health">Santé</SelectItem>
                                                <SelectItem value="creative">Créatif</SelectItem>
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
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Récurrence</label>
                                        <Select
                                            value={formData.recurrence}
                                            onValueChange={v => setFormData({ ...formData, recurrence: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pas de récurrence" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Pas de récurrence</SelectItem>
                                                <SelectItem value="daily">Quotidien</SelectItem>
                                                <SelectItem value="weekly">Hebdomadaire</SelectItem>
                                                <SelectItem value="monthly">Mensuel</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm font-medium">Effort</label>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <AlertCircle className="w-3 h-3 text-muted-foreground" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>L'effort détermine l'XP de base.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                            <Select
                                                value={formData.effort}
                                                onValueChange={v => setFormData({ ...formData, effort: v })}
                                            >
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Faible (30XP)</SelectItem>
                                                    <SelectItem value="medium">Moyen (50XP)</SelectItem>
                                                    <SelectItem value="high">Élevé (100XP)</SelectItem>
                                                    <SelectItem value="epic">Épique (500XP)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm font-medium">XP Récompense</label>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Zap className="w-3 h-3 text-yellow-500" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Calculé automatiquement selon l'effort et la catégorie.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                            <Input
                                                type="number"
                                                value={formData.xp}
                                                onChange={e => setFormData({ ...formData, xp: parseInt(e.target.value) })}
                                                className="bg-accent/20"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Date limite</label>
                                            <Input
                                                type="date"
                                                value={formData.dueDate}
                                                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Durée (min)</label>
                                            <Input
                                                type="number"
                                                min="5"
                                                step="5"
                                                value={formData.estimatedDuration}
                                                onChange={e => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Étapes (Sub-quests)</label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Ajouter une étape..."
                                                value={newStepTitle}
                                                onChange={e => setNewStepTitle(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addStepToForm())}
                                            />
                                            <Button type="button" variant="outline" size="icon" onClick={addStepToForm}>
                                                <PlusCircle className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="space-y-2 max-h-[150px] overflow-y-auto mt-2">
                                            {formData.steps.map(s => (
                                                <div key={s.id} className="flex items-center justify-between p-2 bg-accent/20 rounded-lg text-sm">
                                                    <span>{s.title}</span>
                                                    <button onClick={() => removeStepFromForm(s.id)} className="text-muted-foreground hover:text-destructive">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Description</label>
                                        <Textarea
                                            placeholder="Détails de la mission..."
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <DialogFooter className="flex justify-between sm:justify-between w-full flex-col sm:flex-row gap-2">
                                {step === 2 ? (
                                    <Button variant="outline" onClick={() => setStep(1)}>Retour</Button>
                                ) : <div className="hidden sm:block"></div>}

                                <div className="flex gap-2 w-full sm:w-auto">
                                    {step === 2 && (
                                        <Button variant="secondary" onClick={handleSaveAsTemplate} className="flex-1 sm:flex-none">
                                            <Copy className="w-4 h-4 mr-2" />
                                            Sauver Modèle
                                        </Button>
                                    )}
                                    {step === 1 ? (
                                        <Button onClick={() => setStep(2)} className="w-full sm:w-auto">Suivant</Button>
                                    ) : (
                                        <Button onClick={handleCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 sm:flex-none">
                                            {editQuest ? 'Sauvegarder les modifications' : 'Créer la Quête'}
                                        </Button>
                                    )}
                                </div>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filters / Search could go here */}

            {viewMode === 'list' ? (
                <div className="grid grid-cols-1 gap-4" data-testid="quests-list">
                    {isLoading ? (
                        <QuestsSkeleton />
                    ) : quests.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                            <Sword className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium">Aucune quête active</h3>
                            <p className="text-muted-foreground">L'aventure n'attend que vous.</p>
                        </div>
                    ) : quests.map(quest => (
                        <div
                            key={quest.id}
                            className="group relative bg-card border border-border hover:border-primary/50 transition-all rounded-xl p-4 flex flex-col sm:flex-row gap-4 sm:items-center"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    {quest.isExample && (
                                        <Badge variant="secondary" className="text-[10px] h-5">Exemple</Badge>
                                    )}
                                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                                        {quest.category}
                                    </Badge>
                                    {quest.projectId && (
                                        <Badge variant="secondary" className="text-[10px] h-5 bg-primary/10 text-primary border-primary/20">
                                            {projects.find(p => p.id === quest.projectId)?.title || 'Projet...'}
                                        </Badge>
                                    )}
                                    {quest.priority === 'high' && <span className="flex w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Priorité Haute" />}
                                    {quest.recurrence && quest.recurrence !== 'none' && (
                                        <Badge variant="secondary" className="text-[10px] gap-1">
                                            <Repeat className="w-3 h-3" />
                                            {quest.recurrence === 'daily' ? 'Chaque jour' : quest.recurrence === 'weekly' ? 'Hebdo' : 'Mensuel'}
                                        </Badge>
                                    )}
                                </div>
                                <h3 className={`text-lg font-bold ${quest.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                    {quest.title}
                                </h3>
                                {quest.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-1">{quest.description}</p>
                                )}

                                {/* Progress Bar (if steps exist) */}
                                {quest.steps && quest.steps.length > 0 && (
                                    <div className="mt-3 space-y-1">
                                        <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                            <span>Progression</span>
                                            <span>{quest.progress || 0}%</span>
                                        </div>
                                        <Progress value={quest.progress || 0} className="h-1.5" />
                                    </div>
                                )}

                                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500" /> {quest.xp} XP</span>
                                    {quest.dueDate && (
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(quest.dueDate).toLocaleDateString()}</span>
                                    )}
                                    {quest.steps && quest.steps.length > 0 && (
                                        <button
                                            onClick={() => toggleQuestExpansion(quest.id)}
                                            className="flex items-center gap-1 hover:text-primary transition-colors ml-auto"
                                        >
                                            <ListTodo className="w-3 h-3" />
                                            {quest.steps.length} étapes
                                            {expandedQuests.has(quest.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                        </button>
                                    )}
                                </div>

                                {/* Expandable Steps Section */}
                                {expandedQuests.has(quest.id) && quest.steps && (
                                    <div className="mt-4 space-y-2 pt-4 border-t border-border/40 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {quest.steps.map(s => (
                                            <div
                                                key={s.id}
                                                className={`flex items-center justify-between p-2 rounded-lg transition-colors ${s.status === 'obsolete' ? 'bg-muted/30 opacity-60' : 'bg-accent/10'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        disabled={s.status === 'obsolete'}
                                                        onClick={() => updateStepStatus(quest, s.id, s.status === 'completed' ? 'pending' : 'completed')}
                                                        className={`transition-colors ${s.status === 'obsolete' ? 'cursor-not-allowed' : 'hover:text-primary'}`}
                                                    >
                                                        {s.status === 'completed' ? (
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                        ) : s.status === 'obsolete' ? (
                                                            <Ban className="w-4 h-4 text-muted-foreground" />
                                                        ) : (
                                                            <Circle className="w-4 h-4 text-muted-foreground" />
                                                        )}
                                                    </button>
                                                    <span className={`text-sm ${s.status === 'completed' ? 'line-through text-muted-foreground' :
                                                        s.status === 'obsolete' ? 'line-through text-muted-foreground italic' : ''
                                                        }`}>
                                                        {s.title}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {s.status !== 'obsolete' && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-7 w-7 text-muted-foreground hover:text-orange-500"
                                                                        onClick={() => updateStepStatus(quest, s.id, 'obsolete')}
                                                                    >
                                                                        <Ban className="w-3.5 h-3.5" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent><p>Marquer comme obsolète</p></TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                    {s.status === 'obsolete' && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 px-2 text-[10px] text-muted-foreground hover:text-primary"
                                                            onClick={() => updateStepStatus(quest, s.id, 'pending')}
                                                        >
                                                            Réactiver
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {/* Inline Add Step */}
                                        <div className="flex gap-2 mt-2 pt-2 border-t border-border/20">
                                            <Input
                                                placeholder="Ajouter une étape rapide..."
                                                value={newStepTitle}
                                                onChange={e => setNewStepTitle(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && addStepToQuest(quest.id, quest.steps)}
                                                className="h-8 text-xs bg-accent/20"
                                            />
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => addStepToQuest(quest.id, quest.steps)}>
                                                <PlusCircle className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center border-t sm:border-t-0 pt-4 sm:pt-0">
                                {quest.status !== 'completed' && (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleEdit(quest)}
                                    >
                                        <PlusCircle className="w-4 h-4 rotate-45" />
                                    </Button>
                                )}
                                {quest.status !== 'completed' ? (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-2 hover:bg-green-500/10 hover:text-green-500 border-green-500/20"
                                        onClick={() => handleStatusChange(quest, 'completed')}
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Terminer
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-green-500"
                                        disabled
                                    >
                                        Complété
                                    </Button>
                                )}

                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDelete(quest)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {isLoading ? (
                        <QuestsSkeleton />
                    ) : (
                        <QuestKanban
                            quests={quests}
                            onStatusChange={handleStatusChange}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}
                </div>
            )}
        </div >
    );
};

export default Quests;
