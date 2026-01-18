import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { db } from '../lib/db';
import {
  TrendingUp, Plus, Flame, CheckCircle2, Trash2, Trophy,
  Calendar as CalendarIcon, MoreVertical, Pencil, Link as LinkIcon,
  Settings2, X
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '../components/ui/dropdown-menu';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const Habits = () => {
  const { addXP } = useApp();
  const [habits, setHabits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [quests, setQuests] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Catégories harmonisées avec Icones
  const CATEGORIES = [
    { id: 'Apprentissage', label: 'Apprentissage', color: 'bg-purple-500 text-purple-100', icon: '🧠', borderColor: 'border-purple-500' },
    { id: 'Santé', label: 'Santé', color: 'bg-green-500 text-green-100', icon: '🌿', borderColor: 'border-green-500' },
    { id: 'Travail', label: 'Travail', color: 'bg-blue-500 text-blue-100', icon: '💼', borderColor: 'border-blue-500' },
    { id: 'Créativité', label: 'Créativité', color: 'bg-pink-500 text-pink-100', icon: '🎨', borderColor: 'border-pink-500' },
    { id: 'Vie sociale', label: 'Vie sociale', color: 'bg-yellow-500 text-yellow-100', icon: '🤝', borderColor: 'border-yellow-500' },
    { id: 'Finance', label: 'Finance', color: 'bg-orange-500 text-orange-100', icon: '💰', borderColor: 'border-orange-500' },
    { id: 'Personnel', label: 'Personnel', color: 'bg-slate-500 text-slate-100', icon: '👤', borderColor: 'border-slate-500' }
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
      resetForm();
      loadHabits();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'Santé',
      frequency: 'daily',
      targetPerWeek: 7,
      xpPerCompletion: 25,
      projectId: 'none',
      questId: 'none'
    });
  };

  const handleComplete = async (habit) => {
    try {
      const today = new Date().toDateString();
      const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted) : null;

      if (lastCompleted && lastCompleted.toDateString() === today) {
        toast.info('Déjà complété aujourd\'hui');
        return;
      }

      let newStreak = habit.streak || 0;
      if (lastCompleted) {
        const daysDiff = differenceInDays(new Date(today), lastCompleted);
        if (daysDiff === 1) newStreak += 1;
        else if (daysDiff > 1) newStreak = 1;
        else newStreak = 1;
      } else {
        newStreak = 1;
      }

      const bestStreak = Math.max(newStreak, habit.bestStreak || 0);

      // OPTIMISTIC UPDATE
      const previousHabits = [...habits];
      setHabits(prev => prev.map(h => h.id === habit.id ? {
        ...h,
        streak: newStreak,
        bestStreak,
        lastCompleted: new Date()
      } : h));

      await db.habits.update(habit.id, {
        streak: newStreak,
        bestStreak,
        lastCompleted: new Date()
      });

      await addXP(habit.xpPerCompletion, 'habit');
      toast.success(`+${habit.xpPerCompletion} XP! 🔥`);

    } catch (err) {
      console.error("Critical error in handleComplete", err);
      toast.error("Erreur...");
      loadHabits(); // Reload to fix sync
    }
  };

  const handleDelete = async (id) => {
    try {
      await db.habits.delete(id);
      toast.success('Habitude supprimée');
      loadHabits();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in mb-24 lg:mb-0" data-testid="habits-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black mb-2 flex items-center justify-center sm:justify-start gap-3 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-500">
              Mes Bulles
            </span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium">Éclatez vos objectifs quotidiens.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 transition-all hover:scale-105">
              <Plus className="w-5 h-5 mr-2" />
              Nouveau
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle Bulle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Titre (ex: Boire de l'eau)" />
              <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.label}</SelectItem>)}</SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Objectif/sem</label>
                  <Input type="number" min="1" max="7" value={formData.targetPerWeek} onChange={e => setFormData({ ...formData, targetPerWeek: parseInt(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">XP</label>
                  <Input type="number" value={formData.xpPerCompletion} onChange={e => setFormData({ ...formData, xpPerCompletion: parseInt(e.target.value) })} />
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full">Créer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* BUBBLE GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 pb-20">
        <AnimatePresence>
          {habits.map((habit) => {
            const isCompletedToday = habit.lastCompleted && new Date(habit.lastCompleted).toDateString() === new Date().toDateString();
            const cat = CATEGORIES.find(c => c.id === habit.category) || CATEGORIES[1];

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={habit.id}
                onClick={() => !isCompletedToday && handleComplete(habit)}
                className={`
                        relative aspect-square rounded-[2.5rem] p-4 flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all
                        ${isCompletedToday
                    ? 'bg-white/5 border-2 border-dashed border-white/10 opacity-40 grayscale'
                    : `${cat.color.split(' ')[0]} shadow-lg shadow-black/10 border-4 border-transparent hover:border-white/20`
                  }
                    `}
              >
                {/* Status Icon */}
                <div className={`
                        absolute top-4 right-4 p-1.5 rounded-full backdrop-blur-md transition-all
                        ${isCompletedToday ? 'bg-green-500 text-white' : 'bg-black/10 text-white/50'}
                     `}>
                  {isCompletedToday
                    ? <CheckCircle2 className="w-4 h-4" />
                    : <div className="w-4 h-4 rounded-full border-2 border-current" />
                  }
                </div>

                {/* Main Icon/Content */}
                <span className="text-5xl mb-4 filter drop-shadow-sm select-none transform transition-transform group-hover:scale-110">{cat.icon}</span>

                <h3 className={`font-bold text-sm leading-tight break-words max-w-full px-1 ${isCompletedToday ? 'text-muted-foreground line-through' : 'text-white'}`}>
                  {habit.title}
                </h3>

                {/* Streak Badge */}
                {habit.streak > 0 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white/90 shadow-sm border border-white/10">
                    <Flame className="w-3 h-3 fill-orange-400 text-orange-400" />
                    {habit.streak}
                  </div>
                )}

                {/* Settings Button (visible on hover only) */}
                <div className="absolute top-4 left-4 z-20" onClick={e => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="w-8 h-8 rounded-full hover:bg-black/20 text-white/30 hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleDelete(habit.id)} className="text-red-500 focus:text-red-500">
                        <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Add Button as a Bubble */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="aspect-square rounded-[2.5rem] border-4 border-dashed border-white/10 flex flex-col items-center justify-center text-muted-foreground hover:bg-white/5 hover:border-white/20 hover:text-primary cursor-pointer transition-all"
        >
          <Plus className="w-12 h-12 mb-2 opacity-30" />
          <span className="font-medium text-sm opacity-50">Ajouter</span>
        </motion.div>
      </div>
    </div>
  );
};

export default Habits;
