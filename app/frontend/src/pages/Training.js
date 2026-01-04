import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { db } from '../lib/db';
import {
  Dumbbell,
  Plus,
  Trash2,
  Timer,
  Zap,
  TrendingUp,
  Calendar as CalendarIcon,
  Repeat,
  Link as LinkIcon,
  FileText
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';
import { format, isFuture } from 'date-fns';
import { fr } from 'date-fns/locale';

const Training = () => {
  const { addXP } = useApp();
  const [sessions, setSessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]); // Sessions futures
  const [quests, setQuests] = useState([]); // Pour liaison
  const [habits, setHabits] = useState([]); // Pour liaison
  const [notes, setNotes] = useState([]); // Pour liaison notes

  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    totalXP: 0,
    thisWeek: 0
  });

  const [formData, setFormData] = useState({
    type: 'Cardio',
    intensity: 'medium',
    duration: 30,
    notes: '',
    exercises: [],
    // New fields
    scheduleDate: '', // Format ISO
    isRecurring: false,
    recurringDays: [], // [0..6]
    questId: '',
    linkedHabitId: ''
  });

  const emptyExercise = { name: '', type: '', duration: '', reps: '', sets: '', details: '' };

  useEffect(() => {
    loadSessions();
    loadLinkableData();
  }, []);

  const loadLinkableData = async () => {
    const q = await db.quests.where('status').notEqual('completed').toArray();
    const h = await db.habits.toArray();
    const n = await db.notes.toArray();
    setQuests(q);
    setHabits(h);
    setNotes(n);
  };

  const loadSessions = async () => {
    try {
      const allData = await db.training.reverse().toArray();

      const past = allData.filter(s => !s.scheduleDate || !isFuture(new Date(s.scheduleDate)));
      const future = allData.filter(s => s.scheduleDate && isFuture(new Date(s.scheduleDate)));

      setSessions(past);
      setUpcomingSessions(future);

      // Calculate stats based on COMPLETED (past) sessions
      const totalMinutes = past.reduce((sum, s) => sum + (s.duration || 0), 0);
      const totalXP = past.reduce((sum, s) => sum + (s.xp || 0), 0);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const thisWeek = past.filter(s => new Date(s.date) >= weekAgo).length;

      setStats({
        totalSessions: past.length,
        totalMinutes,
        totalXP,
        thisWeek
      });
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.duration || formData.duration <= 0) {
      toast.error('Durée invalide');
      return;
    }
    if (formData.exercises.length === 0) {
      toast.error('Ajoutez au moins un exercice');
      return;
    }

    try {
      const intensityMultiplier = { low: 0.8, medium: 1, high: 1.3 };
      const xp = Math.round(formData.duration * intensityMultiplier[formData.intensity]);

      const isScheduled = formData.scheduleDate && isFuture(new Date(formData.scheduleDate));

      await db.training.add({
        id: `training-${Date.now()}`,
        ...formData,
        xp, // XP précalculé mais donné uniquement à la complétion si programmé
        date: isScheduled ? null : new Date(), // Date de complétion réelle
        createdAt: new Date(),
        status: isScheduled ? 'scheduled' : 'completed'
      });

      if (!isScheduled) {
        await addXP(xp, 'training');
        toast.success(`+${xp} XP! Session enregistrée!`);
      } else {
        toast.success(`Session programmée pour le ${format(new Date(formData.scheduleDate), 'dd/MM HH:mm')}`);
      }

      setIsOpen(false);
      resetForm();
      loadSessions();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'Cardio',
      intensity: 'medium',
      duration: 30,
      notes: '',
      exercises: [],
      scheduleDate: '',
      isRecurring: false,
      recurringDays: [],
      questId: '',
      linkedHabitId: ''
    });
  };

  const handleExerciseChange = (idx, field, value) => {
    const updated = formData.exercises.map((ex, i) => i === idx ? { ...ex, [field]: value } : ex);
    setFormData({ ...formData, exercises: updated });
  };
  const handleAddExercise = () => {
    setFormData({ ...formData, exercises: [...formData.exercises, { ...emptyExercise }] });
  };
  const handleRemoveExercise = (idx) => {
    setFormData({ ...formData, exercises: formData.exercises.filter((_, i) => i !== idx) });
  };

  const handleDelete = async (id) => {
    try {
      await db.training.delete(id);
      toast.success('Session supprimée');
      loadSessions();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24" data-testid="training-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 flex items-center gap-3" data-testid="training-title">
            <Dumbbell className="w-10 h-10 text-primary" />
            Training 2.0
          </h1>
          <p className="text-foreground/60 text-lg">Suivez et planifiez vos entraînements</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" size="lg" data-testid="new-session-btn">
              <Plus className="w-5 h-5" />
              Nouvelle session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configurer une session</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">

              {/* Programmation & Liaisons */}
              <div className="p-4 bg-secondary/10 rounded-xl space-y-4 border border-secondary/20">
                <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" /> Planification & Liaisons
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Date prévue (Laisser vide si fait maintenant)</label>
                    <Input
                      type="datetime-local"
                      value={formData.scheduleDate}
                      onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="recurring"
                      checked={formData.isRecurring}
                      onCheckedChange={(c) => setFormData({ ...formData, isRecurring: c })}
                    />
                    <label htmlFor="recurring" className="text-sm font-medium">Récurrent (Hebdo)</label>
                  </div>

                  <div>
                    <label className="text-xs font-medium mb-1 block">Lier à une Quête</label>
                    <Select value={formData.questId} onValueChange={(v) => setFormData({ ...formData, questId: v })}>
                      <SelectTrigger><SelectValue placeholder="Aucune" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune</SelectItem>
                        {quests.map(q => <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Lier à une Habitude</label>
                    <Select value={formData.linkedHabitId} onValueChange={(v) => setFormData({ ...formData, linkedHabitId: v })}>
                      <SelectTrigger><SelectValue placeholder="Aucune" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune</SelectItem>
                        {habits.map(h => <SelectItem key={h.id} value={h.id}>{h.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cardio">Cardio</SelectItem>
                      <SelectItem value="Musculation">Musculation</SelectItem>
                      <SelectItem value="Yoga">Yoga</SelectItem>
                      <SelectItem value="Natation">Natation</SelectItem>
                      <SelectItem value="Course">Course</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Intensité</label>
                  <Select
                    value={formData.intensity}
                    onValueChange={(value) => setFormData({ ...formData, intensity: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Légère</SelectItem>
                      <SelectItem value="medium">Modérée</SelectItem>
                      <SelectItem value="high">Intense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Durée (minutes)</label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  min={1}
                />
              </div>

              {/* Exercices */}
              <div className="space-y-2">
                <label className="text-sm font-medium mb-2 block">Exercices</label>
                {formData.exercises.map((ex, idx) => (
                  <div key={idx} className="grid grid-cols-6 gap-2 items-center mb-2 animate-in slide-in-from-left-2">
                    <Input
                      placeholder="Nom"
                      value={ex.name}
                      onChange={e => handleExerciseChange(idx, 'name', e.target.value)}
                      className="col-span-2"
                    />
                    <Input
                      placeholder="Reps"
                      value={ex.reps}
                      onChange={e => handleExerciseChange(idx, 'reps', e.target.value)}
                    />
                    <Input
                      placeholder="Sets"
                      value={ex.sets}
                      onChange={e => handleExerciseChange(idx, 'sets', e.target.value)}
                    />
                    <Input
                      placeholder="Détails"
                      value={ex.details}
                      onChange={e => handleExerciseChange(idx, 'details', e.target.value)}
                      className="col-span-2"
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveExercise(idx)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddExercise} className="mt-2 w-full border-dashed">
                  <Plus className="w-4 h-4 mr-1" /> Ajouter un exercice
                </Button>
              </div>

              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes de session..."
                rows={2}
              />

              <Button onClick={handleCreate} className="w-full text-lg h-12">
                {formData.scheduleDate ? 'Programmer la session' : 'Enregistrer la session terminée'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* SESSIONS FUTURES */}
      {upcomingSessions.length > 0 && (
        <div className="animate-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
            <CalendarIcon className="w-5 h-5" /> Programmées
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingSessions.map(session => (
              <div key={session.id} className="glass-card p-4 border-l-4 border-blue-500 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{session.type}</h3>
                    <p className="text-sm text-blue-300">
                      {session.scheduleDate ? format(new Date(session.scheduleDate), 'EEEE d MMMM à HH:mm', { locale: fr }) : 'Date inconnue'}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">Prévu</span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm text-foreground/70">
                  <Timer className="w-4 h-4" /> {session.duration} min
                  {session.questId && <LinkIcon className="w-3 h-3 ml-2" />}
                </div>

                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700" size="sm" onClick={() => {
                  // Logique pour marquer complet (conversion Scheduled -> Completed)
                  // Simplifié ici : on supprime et recrée
                  db.training.delete(session.id);
                  db.training.add({
                    ...session,
                    id: `training-${Date.now()}`,
                    date: new Date(),
                    scheduleDate: null,
                    status: 'completed'
                  });
                  addXP(session.xp, 'training');
                  toast.success('Session complétée ! Bravo !');
                  loadSessions();
                }}>
                  Marquer comme fait
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard icon={Dumbbell} label="Total" value={stats.totalSessions} color="text-primary" bg="bg-primary/10" />
        <StatsCard icon={Timer} label="Minutes" value={stats.totalMinutes} color="text-blue-500" bg="bg-blue-500/10" />
        <StatsCard icon={Zap} label="XP Gagné" value={stats.totalXP} color="text-yellow-500" bg="bg-yellow-500/10" />
        <StatsCard icon={TrendingUp} label="Semaine" value={stats.thisWeek} color="text-green-500" bg="bg-green-500/10" />
      </div>

      {/* Sessions History */}
      <div className="rounded-xl border border-white/5 bg-black/20 p-6">
        <h2 className="text-2xl font-bold mb-6">Historique</h2>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="group p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-primary/20"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg">{session.type}</h3>
                    <Badge intensity={session.intensity} />
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                      +{session.xp} XP
                    </span>
                  </div>
                  <div className="text-sm text-foreground/50 flex items-center gap-3">
                    <span>{format(new Date(session.date), 'dd MMMM yyyy', { locale: fr })}</span>
                    <span>•</span>
                    <span>{session.duration} min</span>
                  </div>

                  {/* Linked Resources Display */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {session.questId && <div className="text-xs text-primary flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded"><LinkIcon className="w-3 h-3" /> Quête</div>}
                    {notes.filter(n => n.linkedTo && n.linkedTo.includes(session.id)).map(note => (
                      <div key={note.id} className="text-xs text-blue-400 flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        <FileText className="w-3 h-3" /> Note: {note.title}
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(session.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Aucune session terminée pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="glass-card p-4 flex flex-col items-center justify-center text-center">
    <div className={`p-2 rounded-full mb-2 ${bg} ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-xs text-muted-foreground uppercase">{label}</div>
  </div>
);

const Badge = ({ intensity }) => {
  const colors = {
    low: 'bg-green-500/20 text-green-400',
    medium: 'bg-blue-500/20 text-blue-400',
    high: 'bg-red-500/20 text-red-500'
  };
  const labels = { low: 'Léger', medium: 'Modéré', high: 'Intense' };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colors[intensity] || colors.medium}`}>
      {labels[intensity] || 'Modéré'}
    </span>
  );
};

export default Training;
