import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { db } from '../lib/db';
import { Link } from 'react-router-dom';
import {
  Target,
  Plus,
  Zap,
  Calendar,
  Flag,
  Trash2,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Play,
  FileText,
  Dumbbell,
  Clock,
  Link as LinkIcon,
  Lock
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { format } from 'date-fns';

const Quests = () => {
  const { addXP } = useApp();
  const [quests, setQuests] = useState([]);

  // Data for Linking
  const [projects, setProjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [events, setEvents] = useState([]);

  const [filter, setFilter] = useState('all');
  const [isOpen, setIsOpen] = useState(false);

  // Step Management
  const [isStepOpen, setIsStepOpen] = useState(false);
  const [selectedQuestForStep, setSelectedQuestForStep] = useState(null);
  const [expandedQuests, setExpandedQuests] = useState({});

  const CATEGORIES = [
    { id: 'Apprentissage', label: 'Apprentissage' },
    { id: 'Travail', label: 'Travail' },
    { id: 'Santé', label: 'Santé' },
    { id: 'Créativité', label: 'Créativité' },
    { id: 'Vie sociale', label: 'Vie sociale' },
    { id: 'Personnel', label: 'Personnel' },
    { id: 'Finance', label: 'Finance' }
  ];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Apprentissage',
    priority: 'medium',
    dueDate: '',
    xp: 50,
    projectId: 'none',
    effort: 'medium'
  });

  const [stepFormData, setStepFormData] = useState({
    title: '',
    description: '',
    linkedNoteId: 'none',
    linkedTrainingId: 'none',
    linkedEventId: 'none'
  });

  useEffect(() => {
    loadQuests();
    loadLinkableData();
  }, [filter]);

  const loadLinkableData = async () => {
    try {
      setProjects(await db.projects.toArray());
      setNotes(await db.notes.toArray());
      setTrainings(await db.training.toArray());
      setEvents(await db.events.toArray());
    } catch (e) { console.error(e); }
  };

  const loadQuests = async () => {
    try {
      let query = db.quests.toCollection();
      if (filter !== 'all') {
        query = db.quests.where('status').equals(filter);
      }
      const data = await query.reverse().toArray();
      setQuests(data);
    } catch (error) {
      console.error('Error loading quests:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    try {
      await db.quests.add({
        id: `quest-${Date.now()}`,
        ...formData,
        projectId: formData.projectId === 'none' ? null : formData.projectId,
        status: 'active',
        progress: 0,
        steps: [],
        createdAt: new Date()
      });

      toast.success('Quête créée!');
      setIsOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'Apprentissage',
        priority: 'medium',
        dueDate: '',
        xp: 50,
        projectId: 'none',
        effort: 'medium'
      });
      loadQuests();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleStart = async (quest) => {
    try {
      await db.quests.update(quest.id, { status: 'in_progress' });
      toast.success('Quête démarrée ! Bon courage ! 🚀');
      loadQuests();
    } catch (e) { console.error(e); }
  };

  const handleAddStep = async () => {
    if (!stepFormData.title.trim() || !selectedQuestForStep) {
      toast.error('Titre requis');
      return;
    }

    try {
      const quest = quests.find(q => q.id === selectedQuestForStep);
      const steps = quest.steps || [];

      steps.push({
        id: `step-${Date.now()}`,
        title: stepFormData.title,
        description: stepFormData.description,
        completed: false,
        createdAt: new Date(),
        // Links
        linkedNoteId: stepFormData.linkedNoteId === 'none' ? null : stepFormData.linkedNoteId,
        linkedTrainingId: stepFormData.linkedTrainingId === 'none' ? null : stepFormData.linkedTrainingId,
        linkedEventId: stepFormData.linkedEventId === 'none' ? null : stepFormData.linkedEventId
      });

      await db.quests.update(selectedQuestForStep, { steps });
      toast.success('Étape ajoutée');
      setIsStepOpen(false);
      setStepFormData({ title: '', description: '', linkedNoteId: 'none', linkedTrainingId: 'none', linkedEventId: 'none' });
      loadQuests();
    } catch (e) {
      toast.error('Erreur');
    }
  };

  const handleToggleStep = async (questId, stepId) => {
    try {
      const quest = quests.find(q => q.id === questId);
      const steps = quest.steps.map(step =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      );

      const completedSteps = steps.filter(s => s.completed).length;
      const progress = Math.round((completedSteps / steps.length) * 100);

      await db.quests.update(questId, { steps, progress });
      if (completedSteps === steps.length && quest.status !== 'completed') {
        toast.info('Toutes les étapes sont finies !');
      }
      loadQuests();
    } catch (error) { console.error(error); }
  };

  const handleComplete = async (quest) => {
    // Validation: Toutes les étapes doivent être terminées
    const steps = quest.steps || [];
    const incompleteSteps = steps.filter(s => !s.completed);

    if (steps.length > 0 && incompleteSteps.length > 0) {
      toast.error(`Impossible de terminer : il reste ${incompleteSteps.length} étape(s) !`);
      return;
    }

    try {
      await db.quests.update(quest.id, {
        status: 'completed',
        progress: 100,
        completedAt: new Date()
      });
      await addXP(quest.xp, 'quest');
      const today = new Date().toDateString();
      const analytics = await db.analytics.where('date').equals(new Date(today)).first();
      if (analytics) {
        await db.analytics.update(analytics.id, {
          questsCompleted: (analytics.questsCompleted || 0) + 1
        });
      }
      toast.success(`+${quest.xp} XP! Quête complétée!`);
      loadQuests();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette quête ?')) return;
    try {
      await db.quests.delete(id);
      toast.success('Quête supprimée');
      loadQuests();
    } catch (error) { toast.error('Erreur'); }
  };

  const toggleQuestExpansion = (questId) => {
    setExpandedQuests(prev => ({
      ...prev,
      [questId]: !prev[questId]
    }));
  };

  // Helper to show links in steps
  const renderStepLinks = (step) => {
    const links = [];
    if (step.linkedNoteId) {
      const note = notes.find(n => n.id === step.linkedNoteId);
      if (note) links.push({ type: 'note', icon: FileText, label: note.title, to: '/notes' }); // Could be generic query param link later
    }
    if (step.linkedTrainingId) {
      const training = trainings.find(t => t.id === step.linkedTrainingId);
      if (training) links.push({ type: 'training', icon: Dumbbell, label: training.type, to: '/training' });
    }
    if (step.linkedEventId) {
      const evt = events.find(e => e.id === step.linkedEventId);
      if (evt) links.push({ type: 'event', icon: Calendar, label: evt.title, to: '/agenda' });
    }

    if (links.length === 0) return null;

    return (
      <div className="flex gap-2 mt-1 flex-wrap">
        {links.map((link, idx) => {
          const Icon = link.icon;
          return (
            <Link key={idx} to={link.to} className="text-[10px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
              <Icon className="w-3 h-3" /> {link.label}
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24" data-testid="quests-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 flex items-center gap-3" data-testid="quests-title">
            <Target className="w-10 h-10 text-primary" />
            Quêtes
          </h1>
          <p className="text-foreground/60 text-lg">Gérez vos objectifs et missions</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="create-quest-btn">
              <Plus className="w-5 h-5" /> Nouvelle quête
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Créer une quête</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              {/* Form Fields (simplified view for brevity, assuming standard inputs like before) */}
              <div><label className="text-sm font-medium mb-1 block">Titre</label><Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1 block">Projet (Opt.)</label>
                <Select value={formData.projectId} onValueChange={v => setFormData({ ...formData, projectId: v })}>
                  <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><label className="text-sm font-medium mb-1 block">Description</label><Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Catégorie</label>
                  <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Priorité</label>
                  <Select value={formData.priority} onValueChange={v => setFormData({ ...formData, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="low">Basse</SelectItem><SelectItem value="medium">Moyenne</SelectItem><SelectItem value="high">Haute</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium mb-1 block">Date</label><Input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} /></div>
                <div><label className="text-sm font-medium mb-1 block">XP</label><Input type="number" value={formData.xp} onChange={e => setFormData({ ...formData, xp: parseInt(e.target.value) })} /></div>
              </div>
              <Button onClick={handleCreate} className="w-full">Créer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'active', 'in_progress', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === status ? 'bg-primary text-white' : 'bg-foreground/5 hover:bg-foreground/10'}`}
          >
            {status === 'all' ? 'Toutes' : status === 'active' ? 'Actives' : status === 'in_progress' ? 'En cours' : 'Terminées'}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quests.map((quest) => {
          const steps = quest.steps || [];
          const isExpanded = expandedQuests[quest.id];
          return (
            <div key={quest.id} className="glass-card p-6 rounded-xl group flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1 truncate mr-2">{quest.title}</h3>
                  {quest.status === 'active' && <span className="text-[10px] uppercase font-bold bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded">À commencer</span>}
                  {quest.status === 'in_progress' && <span className="text-[10px] uppercase font-bold bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded">En cours</span>}
                </div>
                {quest.status === 'completed' ? <CheckCircle2 className="text-green-500 w-6 h-6" /> : <Circle className="text-muted-foreground w-6 h-6" />}
              </div>

              <div className="flex-1 space-y-3">
                {quest.description && <p className="text-sm text-muted-foreground line-clamp-2">{quest.description}</p>}
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">{quest.category}</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary">{quest.xp} XP</span>
                  {quest.dueDate && <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(quest.dueDate), 'dd/MM')}</span>}
                </div>

                {/* Actions d'état */}
                {quest.status === 'active' && (
                  <Button onClick={() => handleStart(quest)} size="sm" className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                    <Play className="w-4 h-4" /> Commencer
                  </Button>
                )}
                {quest.status !== 'completed' && quest.status !== 'active' && (
                  <Button
                    onClick={() => handleComplete(quest)}
                    size="sm"
                    className={`w-full gap-2 ${steps.some(s => !s.completed) ? 'bg-secondary text-muted-foreground' : 'bg-green-600 hover:bg-green-700'}`}
                    title={steps.some(s => !s.completed) ? "Terminez toutes les étapes d'abord" : ""}
                  >
                    {steps.some(s => !s.completed) ? <Lock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    Terminer
                  </Button>
                )}

                {/* Steps */}
                {steps.length > 0 && (
                  <div className="border-t border-white/10 pt-3">
                    <button onClick={() => toggleQuestExpansion(quest.id)} className="flex items-center gap-2 text-sm font-medium w-full hover:text-primary transition-colors">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      Étapes ({steps.filter(s => s.completed).length}/{steps.length})
                    </button>
                    {isExpanded && (
                      <div className="space-y-2 mt-3 animate-in slide-in-from-top-2">
                        {steps.map(step => (
                          <div key={step.id} className="p-2 bg-white/5 rounded-lg">
                            <div className="flex items-start gap-2">
                              <Checkbox checked={step.completed} onCheckedChange={() => handleToggleStep(quest.id, step.id)} className="mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${step.completed ? 'line-through text-muted-foreground' : ''}`}>{step.title}</p>
                                {step.description && <p className="text-xs text-muted-foreground">{step.description}</p>}
                                {renderStepLinks(step)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Progress Line */}
                {quest.status !== 'completed' && (
                  <div className="h-1.5 w-full bg-secondary/10 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${quest.progress}%` }} />
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex gap-2 pt-4 mt-2 border-t border-white/10">
                {quest.status !== 'completed' && (
                  <button onClick={() => { setSelectedQuestForStep(quest.id); setIsStepOpen(true); }} className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-primary hover:bg-primary/10 py-2 rounded transition-colors">
                    <Plus className="w-3 h-3" /> Ajouter étape
                  </button>
                )}
                <button onClick={() => handleDelete(quest.id)} className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-destructive hover:bg-destructive/10 py-2 rounded transition-colors">
                  <Trash2 className="w-3 h-3" /> Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {quests.length === 0 && <div className="text-center py-12 text-muted-foreground"><Target className="w-16 h-16 mx-auto opacity-20 mb-4" /><p>Aucune quête</p></div>}

      {/* ADD STEP DIALOG */}
      <Dialog open={isStepOpen} onOpenChange={setIsStepOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvelle étape</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium">Titre</label>
              <Input value={stepFormData.title} onChange={e => setStepFormData({ ...stepFormData, title: e.target.value })} placeholder="Action précise..." />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea value={stepFormData.description} onChange={e => setStepFormData({ ...stepFormData, description: e.target.value })} placeholder="Détails..." rows={2} />
            </div>

            {/* LINKS */}
            <div className="p-3 bg-secondary/10 rounded-lg space-y-3">
              <p className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1"><LinkIcon className="w-3 h-3" /> Lier des ressources</p>
              <div className="grid grid-cols-1 gap-2">
                <Select value={stepFormData.linkedNoteId} onValueChange={v => setStepFormData({ ...stepFormData, linkedNoteId: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Lier une Note" /></SelectTrigger>
                  <SelectContent><SelectItem value="none">Aucune Note</SelectItem>{notes.map(n => <SelectItem key={n.id} value={n.id}>{n.title}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={stepFormData.linkedTrainingId} onValueChange={v => setStepFormData({ ...stepFormData, linkedTrainingId: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Lier un Training" /></SelectTrigger>
                  <SelectContent><SelectItem value="none">Aucun Training</SelectItem>{trainings.map(t => <SelectItem key={t.id} value={t.id}>{t.type} ({t.duration} min)</SelectItem>)}</SelectContent>
                </Select>
                <Select value={stepFormData.linkedEventId} onValueChange={v => setStepFormData({ ...stepFormData, linkedEventId: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Lier un Événement Agenda" /></SelectTrigger>
                  <SelectContent><SelectItem value="none">Aucun Événement</SelectItem>{events.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleAddStep} className="w-full">Ajouter</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Quests;
