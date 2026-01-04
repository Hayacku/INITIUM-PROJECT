import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { db } from '../lib/db';
import {
  TrendingUp,
  Plus,
  Flame,
  CheckCircle2,
  Trash2,
  Trophy,
  Calendar as CalendarIcon,
  MoreVertical,
  Pencil,
  Link as LinkIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../components/ui/dropdown-menu';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';

const Habits = () => {
  const { addXP } = useApp();
  const [habits, setHabits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [quests, setQuests] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Catégories harmonisées
  const CATEGORIES = [
    { id: 'Apprentissage', label: 'Apprentissage', color: 'bg-purple-500/10 text-purple-500' },
    { id: 'Santé', label: 'Santé', color: 'bg-green-500/10 text-green-500' },
    { id: 'Travail', label: 'Travail', color: 'bg-blue-500/10 text-blue-500' },
    { id: 'Créativité', label: 'Créativité', color: 'bg-pink-500/10 text-pink-500' },
    { id: 'Vie sociale', label: 'Vie sociale', color: 'bg-yellow-500/10 text-yellow-500' },
    { id: 'Finance', label: 'Finance', color: 'bg-orange-500/10 text-orange-500' },
    { id: 'Personnel', label: 'Personnel', color: 'bg-gray-500/10 text-gray-500' }
  ];

  const [formData, setFormData] = useState({
    title: '',
    category: 'Santé',
    frequency: 'daily',
    targetPerWeek: 7,
    xpPerCompletion: 25,
    projectId: 'none',
    questId: 'none'
  });

  useEffect(() => {
    loadHabits();
    loadLinkData();
  }, []);

  const loadLinkData = async () => {
    const p = await db.projects.toArray();
    const q = await db.quests.where('status').notEqual('completed').toArray();
    setProjects(p);
    setQuests(q);
  };

  const loadHabits = async () => {
    try {
      const data = await db.habits.toArray();
      setHabits(data);
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    try {
      await db.habits.add({
        id: `habit-${Date.now()}`,
        ...formData,
        projectId: formData.projectId === 'none' ? null : formData.projectId,
        questId: formData.questId === 'none' ? null : formData.questId,
        streak: 0,
        bestStreak: 0,
        completedDates: [],
        createdAt: new Date()
      });

      toast.success('Habitude créée!');
      setIsOpen(false);
      setFormData({
        title: '',
        category: 'Santé',
        frequency: 'daily',
        targetPerWeek: 7,
        xpPerCompletion: 25,
        projectId: 'none',
        questId: 'none'
      });
      loadHabits();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const handleComplete = async (habit) => {
    try {
      const today = new Date().toDateString();
      const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted) : null;

      let newStreak = habit.streak || 0;
      if (lastCompleted) {
        const daysDiff = differenceInDays(new Date(today), lastCompleted);
        if (daysDiff === 1) {
          newStreak += 1;
        } else if (daysDiff > 1) {
          newStreak = 1;
        } else {
          toast.info('Déjà complété aujourd\'hui');
          return;
        }
      } else {
        newStreak = 1;
      }

      const bestStreak = Math.max(newStreak, habit.bestStreak || 0);

      await db.habits.update(habit.id, {
        streak: newStreak,
        bestStreak,
        lastCompleted: new Date()
      });

      await addXP(habit.xpPerCompletion, 'habit');

      // Analytics
      const analytics = await db.analytics.where('date').equals(new Date(today)).first();
      if (analytics) {
        await db.analytics.update(analytics.id, {
          habitsCompleted: (analytics.habitsCompleted || 0) + 1
        });
      }

      toast.success(`+${habit.xpPerCompletion} XP! 🔥 Série: ${newStreak}`);
      loadHabits();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await db.habits.delete(id);
      toast.success('Habitude supprimée');
      loadHabits();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const currentCategoryLabel = (catId) => CATEGORIES.find(c => c.id === catId)?.label || catId;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="habits-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 flex items-center gap-3" data-testid="habits-title">
            <TrendingUp className="w-10 h-10 text-primary" />
            Habitudes
          </h1>
          <p className="text-foreground/60 text-lg">Construisez vos routines quotidiennes</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="create-habit-button">
              <Plus className="w-5 h-5" />
              Nouvelle habitude
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="create-habit-dialog">
            <DialogHeader>
              <DialogTitle>Créer une habitude</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Titre *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Faire du sport"
                  data-testid="habit-title-input"
                />
              </div>

              {/* Liaisons */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Lier au Projet</label>
                  <Select value={formData.projectId} onValueChange={(v) => setFormData({ ...formData, projectId: v })}>
                    <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun</SelectItem>
                      {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Lier à la Quête</label>
                  <Select value={formData.questId} onValueChange={(v) => setFormData({ ...formData, questId: v })}>
                    <SelectTrigger><SelectValue placeholder="Aucune" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      {quests.map(q => <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Catégorie</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger data-testid="habit-category-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Fréquence</label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger data-testid="habit-frequency-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Quotidien</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Objectif/semaine</label>
                  <Input
                    type="number"
                    value={formData.targetPerWeek}
                    onChange={(e) => setFormData({ ...formData, targetPerWeek: parseInt(e.target.value) })}
                    min={1}
                    max={7}
                    data-testid="habit-target-input"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">XP par complétion</label>
                  <Input
                    type="number"
                    value={formData.xpPerCompletion}
                    onChange={(e) => setFormData({ ...formData, xpPerCompletion: parseInt(e.target.value) })}
                    data-testid="habit-xp-input"
                  />
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full" data-testid="submit-habit-button">
                Créer l'habitude
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog édition habitude */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent data-testid="edit-habit-dialog">
            <DialogHeader>
              <DialogTitle>Modifier l'habitude</DialogTitle>
            </DialogHeader>
            {editData && (
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Titre *</label>
                  <Input
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    placeholder="Ex: Faire du sport"
                  />
                </div>
                {/* Mode édition simplifié pour l'instant - on garde les liaisons existantes sans les éditer ici pour aller vite, ou on les ajoute si besoin */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Catégorie</label>
                    <Select
                      value={editData.category}
                      onValueChange={(value) => setEditData({ ...editData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Fréquence</label>
                    <Select
                      value={editData.frequency}
                      onValueChange={(value) => setEditData({ ...editData, frequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Quotidien</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={async () => {
                    await db.habits.update(editData.id, {
                      title: editData.title,
                      category: editData.category,
                      frequency: editData.frequency,
                      // targetPerWeek et xpPerCompletion ont été retirés de l'édition simple pour garder le code compact, mais présents dans create
                    });
                    toast.success('Habitude modifiée');
                    setEditOpen(false);
                    setEditData(null);
                    loadHabits();
                  }}
                  className="w-full mt-2"
                >Enregistrer</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="habits-grid">
        {habits.map((habit) => {
          const isCompletedToday = habit.lastCompleted &&
            new Date(habit.lastCompleted).toDateString() === new Date().toDateString();

          const cat = CATEGORIES.find(c => c.id === habit.category);

          return (
            <div
              key={habit.id}
              className={`card-modern border-l-4 ${isCompletedToday ? 'border-green-500 bg-green-500/5' : 'border-transparent'}`}
              style={{ borderLeftColor: isCompletedToday ? undefined : cat?.color?.split(' ')[1]?.replace('text-', '') }}
              data-testid={`habit-card-${habit.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${cat?.color || 'bg-gray-500/10'}`}>
                      {cat?.label || habit.category}
                    </span>
                    {habit.projectId && <LinkIcon className="w-3 h-3 text-primary" title="Lié à un projet" />}
                  </div>
                  <h3 className="text-xl font-bold">{habit.title}</h3>
                </div>
                <div className="flex gap-2">
                  {isCompletedToday ? (
                    <CheckCircle2 className="w-8 h-8 text-green-500 animate-bounce-short" />
                  ) : (
                    <button
                      onClick={() => handleComplete(habit)}
                      className="p-2 hover:bg-green-500/20 rounded-full transition-colors group"
                      data-testid={`complete-habit-${habit.id}`}
                    >
                      <CheckCircle2 className="w-8 h-8 text-foreground/30 group-hover:text-green-500 transition-colors" />
                    </button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setEditData(habit);
                        setEditOpen(true);
                      }}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(habit.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="space-y-3">
                {/* Streak */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl relative overflow-hidden">
                  <div className="flex items-center gap-2 relative z-10">
                    <Flame className={`w-6 h-6 ${habit.streak > 0 ? 'text-orange-500 animate-pulse' : 'text-foreground/20'}`} />
                    <div>
                      <p className="text-sm text-foreground/60">Série</p>
                      <p className="text-2xl font-bold">{habit.streak || 0}</p>
                    </div>
                  </div>
                  {habit.streak > 0 && <div className="absolute right-0 bottom-0 opacity-10"><Flame className="w-16 h-16" /></div>}
                  <div className="text-right relative z-10">
                    <p className="text-sm text-foreground/60">Record</p>
                    <div className="flex items-center gap-1 justify-end">
                      <Trophy className="w-3 h-3 text-yellow-500" />
                      <p className="font-bold">{habit.bestStreak || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 gap-2 text-xs text-foreground/60">
                  <div className="flex justify-between bg-white/5 p-2 rounded">
                    <span>XP</span>
                    <span className="font-bold text-primary">+{habit.xpPerCompletion}</span>
                  </div>
                  <div className="flex justify-between bg-white/5 p-2 rounded">
                    <span>But</span>
                    <span className="font-bold">{habit.targetPerWeek}/sem</span>
                  </div>
                </div>

                {habit.lastCompleted && (
                  <div className="flex items-center gap-2 text-xs text-foreground/40 pt-1 justify-center">
                    <CalendarIcon className="w-3 h-3" />
                    <span>{format(new Date(habit.lastCompleted), 'dd/MM')}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {habits.length === 0 && (
        <div className="text-center py-20" data-testid="no-habits-message">
          <TrendingUp className="w-20 h-20 mx-auto text-foreground/20 mb-4" />
          <p className="text-xl text-foreground/40">Aucune habitude trouvée</p>
          <p className="text-foreground/30 mt-2">Créez votre première habitude pour commencer!</p>
        </div>
      )}
    </div>
  );
};

export default Habits;
