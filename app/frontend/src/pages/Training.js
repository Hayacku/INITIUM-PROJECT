import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { db } from '../lib/db';
import {
  Dumbbell, Plus, Calendar as CalendarIcon, History, Zap,
  TrendingUp, Timer, ChevronRight, LayoutList, Trash2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { format, isFuture, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

// Components
import ProgramCard from '../components/training/ProgramCard';
import ProgramEditor from '../components/training/ProgramEditor';
import SessionScheduler from '../components/training/SessionScheduler';

const Training = () => {
  const { addXP } = useApp();

  // State
  const [activeTab, setActiveTab] = useState('programs'); // DEFAULT: PROGRAMS
  const [sessions, setSessions] = useState([]); // History & Upcoming
  const [templates, setTemplates] = useState([]); // Programs

  // Modals Flow
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null); // For ProgramEditor

  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [schedulingProgram, setSchedulingProgram] = useState(null); // For SessionScheduler

  // Stats
  const [stats, setStats] = useState({ totalSessions: 0, totalMinutes: 0, totalXP: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load Sessions
      const allSessions = await db.training.toArray();
      setSessions(allSessions.sort((a, b) => new Date(b.date || b.scheduleDate) - new Date(a.date || a.scheduleDate)));

      // Load Templates
      const allTemplates = await db.training_templates.toArray();
      setTemplates(allTemplates);

      // Calc Stats
      const completed = allSessions.filter(s => s.status === 'completed');
      const totalMinutes = completed.reduce((sum, s) => sum + (s.duration || 0), 0);
      const totalXP = completed.reduce((sum, s) => sum + (s.xp || 0), 0);
      setStats({ totalSessions: completed.length, totalMinutes, totalXP });

    } catch (e) {
      console.error("Error loading training data", e);
      toast.error("Erreur de chargement");
    }
  };

  // --- ACTIONS PROGRAMMES ---

  const handleSaveProgram = async (formData) => {
    try {
      if (editingProgram) { // Update
        await db.training_templates.update(editingProgram.id, formData);
        toast.success("Programme mis à jour");
      } else { // Create
        await db.training_templates.add({
          ...formData,
          createdAt: new Date()
        });
        toast.success("Programme créé !");
      }
      setIsEditorOpen(false);
      setEditingProgram(null);
      loadData();
    } catch (e) {
      toast.error("Erreur sauvegarde");
    }
  };

  const handleDeleteProgram = async (id) => {
    if (window.confirm("Supprimer ce programme ?")) {
      await db.training_templates.delete(id);
      toast.success("Programme supprimé");
      loadData();
    }
  };

  // --- ACTIONS SESSIONS ---

  const handleScheduleProgram = async (program, dateStr, recurrence = 'none') => {
    try {
      const baseDate = new Date(dateStr);
      let sessionsToCreate = 1;

      if (recurrence === '4weeks') sessionsToCreate = 4;
      if (recurrence === '8weeks') sessionsToCreate = 8;
      if (recurrence === '12weeks') sessionsToCreate = 12;

      for (let i = 0; i < sessionsToCreate; i++) {
        // Calculate date for this instance
        const sessionDate = new Date(baseDate);
        sessionDate.setDate(baseDate.getDate() + (i * 7));

        const sessionData = {
          id: `session-${Date.now()}-${i}`,
          title: program.title,
          type: program.type,
          duration: program.defaultDuration,
          intensity: program.intensity,
          exercises: program.exercises,
          notes: program.notes,
          questId: program.questId,
          linkedHabitId: program.linkedHabitId,
          scheduleDate: sessionDate.toISOString(),
          status: 'scheduled',
          xp: Math.round(program.defaultDuration * 1.5),
          createdAt: new Date(),
          recurrenceGroup: i > 0 ? `group-${baseDate.getTime()}` : null
        };
        await db.training.add(sessionData);
      }

      toast.success(sessionsToCreate > 1
        ? `${sessionsToCreate} séances planifiées (Hebdo)`
        : `Séance planifiée pour le ${format(baseDate, 'dd/MM HH:mm')}`
      );

      setIsSchedulerOpen(false);
      setSchedulingProgram(null);
      setActiveTab('planning');
      loadData();
    } catch (e) {
      console.error(e);
      toast.error("Erreur planification");
    }
  };

  const handleStartNow = async (program) => {
    // Create COMPLETED session immediately
    try {
      await db.training.add({
        id: `session-now-${Date.now()}`,
        title: program.title,
        type: program.type,
        duration: program.defaultDuration,
        intensity: program.intensity,
        exercises: program.exercises,
        notes: program.notes,
        date: new Date(),
        status: 'completed',
        xp: Math.round(program.defaultDuration * 1.5),
        createdAt: new Date()
      });
      await addXP(Math.round(program.defaultDuration * 1.5), 'training');
      toast.success("Séance lancée et terminée !"); // Emulation
      loadData();
    } catch (e) { toast.error("Erreur démarrage"); }
  };

  const handleCompleteScheduled = async (session) => {
    await db.training.update(session.id, {
      status: 'completed',
      date: new Date(),
      scheduleDate: null
    });
    await addXP(session.xp || 50, 'training');
    toast.success("Séance terminée !");
    loadData();
  };

  const handleDeleteSession = async (id) => {
    if (window.confirm("Supprimer cette séance ?")) {
      await db.training.delete(id);
      loadData();
    }
  };

  // Derived State
  const upcoming = sessions.filter(s => s.status === 'scheduled' && s.scheduleDate && isFuture(new Date(s.scheduleDate))).sort((a, b) => new Date(a.scheduleDate) - new Date(b.scheduleDate));
  const history = sessions.filter(s => s.status === 'completed').sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-6 pb-24 animate-in fade-in" data-testid="training-page">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-primary" /> Entraînement
          </h1>
          <p className="text-muted-foreground">Vos programmes, votre discipline.</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => { setEditingProgram(null); setIsEditorOpen(true); }} className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Nouveau Programme
          </Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-3 gap-3 md:gap-6">
        <div className="bg-card/50 border border-border/50 p-4 rounded-xl flex flex-col items-center">
          <span className="text-xs uppercase text-muted-foreground font-bold">Sessions</span>
          <span className="text-2xl font-bold">{stats.totalSessions}</span>
        </div>
        <div className="bg-card/50 border border-border/50 p-4 rounded-xl flex flex-col items-center">
          <span className="text-xs uppercase text-muted-foreground font-bold">Minutes</span>
          <span className="text-2xl font-bold text-blue-500">{stats.totalMinutes}</span>
        </div>
        <div className="bg-card/50 border border-border/50 p-4 rounded-xl flex flex-col items-center">
          <span className="text-xs uppercase text-muted-foreground font-bold">XP Total</span>
          <span className="text-2xl font-bold text-yellow-500">{stats.totalXP}</span>
        </div>
      </div>

      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="programs" className="gap-2"><LayoutList className="w-4 h-4" /> Programmes</TabsTrigger>
          <TabsTrigger value="planning" className="gap-2"><CalendarIcon className="w-4 h-4" /> Planning</TabsTrigger>
          <TabsTrigger value="history" className="gap-2"><History className="w-4 h-4" /> Historique</TabsTrigger>
        </TabsList>

        {/* 1. PROGRAMS (Default) */}
        <TabsContent value="programs">
          {templates.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-border/50 rounded-xl bg-card/20">
              <Dumbbell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Aucun Programme</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">Créez votre premier programme d'entraînement (ex: "Séance A", "Jogging") pour commencer à planifier.</p>
              <Button onClick={() => setIsEditorOpen(true)} size="lg" className="gap-2">
                <Plus className="w-5 h-5" /> Créer mon premier Programme
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(tpl => (
                <ProgramCard
                  key={tpl.id}
                  template={tpl}
                  onPlan={(t) => { setSchedulingProgram(t); setIsSchedulerOpen(true); }}
                  onEdit={(t) => { setEditingProgram(t); setIsEditorOpen(true); }}
                  onDelete={handleDeleteProgram}
                  onStartNow={handleStartNow}
                />
              ))}
              <button
                onClick={() => { setEditingProgram(null); setIsEditorOpen(true); }}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/50 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group min-h-[200px]"
              >
                <div className="w-12 h-12 rounded-full bg-secondary group-hover:bg-primary/20 flex items-center justify-center mb-3 transition-colors">
                  <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                </div>
                <span className="font-medium">Créer un autre</span>
              </button>
            </div>
          )}
        </TabsContent>

        {/* 2. PLANNING */}
        <TabsContent value="planning" className="space-y-4">
          {upcoming.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-xl">
              <CalendarIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-lg font-medium">Rien de prévu</h3>
              <p className="text-sm text-muted-foreground mb-4">Allez dans l'onglet "Programmes" pour planifier une séance.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map(session => {
                const date = new Date(session.scheduleDate);
                const isTodaySession = isToday(date);
                return (
                  <div key={session.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isTodaySession ? 'bg-primary/5 border-primary/30' : 'bg-card border-border/50'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg ${isTodaySession ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>
                        <span className="text-xs font-bold uppercase">{format(date, 'MMM', { locale: fr })}</span>
                        <span className="text-lg font-bold">{format(date, 'dd')}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{session.title || session.type}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5" /> {format(date, 'HH:mm')} • {session.duration} min</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-secondary`}>{session.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleCompleteScheduled(session)} className={isTodaySession ? '' : 'opacity-80'}>
                        Valider
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteSession(session.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* 3. HISTORY */}
        <TabsContent value="history" className="space-y-4">
          {history.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucun historique.</p>
          ) : (
            <div className="space-y-2">
              {history.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-card/50 border border-border/40 rounded-lg hover:border-border transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary rounded-full">
                      <History className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium">{s.title || s.type}</h4>
                      <p className="text-xs text-muted-foreground">{format(new Date(s.date), 'dd MMMM yyyy HH:mm', { locale: fr })} • {s.duration} min</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-yellow-500">+{s.xp} XP</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

      </Tabs>

      {/* MODALS */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <ProgramEditor
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveProgram}
          initialData={editingProgram}
        />
      </Dialog>

      {schedulingProgram && (
        <Dialog open={isSchedulerOpen} onOpenChange={setIsSchedulerOpen}>
          <SessionScheduler
            program={schedulingProgram}
            onClose={() => setIsSchedulerOpen(false)}
            onSchedule={handleScheduleProgram}
          />
        </Dialog>
      )}

    </div>
  );
};

export default Training;

