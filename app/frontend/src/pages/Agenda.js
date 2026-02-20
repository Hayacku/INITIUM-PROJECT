import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Target,
  Dumbbell,
  Repeat,
  MapPin,
  X,
  FolderKanban,
  Sword
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { RRule } from 'rrule';

const Agenda = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Data
  const [events, setEvents] = useState([]);
  const [quests, setQuests] = useState([]);
  const [fullQuests, setFullQuests] = useState([]);
  const [trainings, setTrainings] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'meeting',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '10:00',
    description: '',
    location: '',
    recurrence: 'none',
    projectId: null,
    questId: null
  });
  const [editEvent, setEditEvent] = useState(null);
  const [isInstanceEdit, setIsInstanceEdit] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    loadAllData();
  }, [currentDate]);

  const loadAllData = async () => {
    try {
      // Load all events to handle recurrence
      const eventsData = await db.events.toArray();
      setEvents(eventsData);

      // Load quests
      const questsData = await db.quests.filter(q => !!q.dueDate).toArray();
      setQuests(questsData);

      // Load trainings (if table exists or mock)
      // Assuming db.trainings exists or we mock it. You mentioned 'training' table in DB view, but 'trainings' in some places.
      // Based on previous view, it might be 'trainings' or not existing yet.
      // Safe fallback:
      let trainingsData = [];
      if (db.training) {
        trainingsData = await db.training.filter(t => !!t.scheduleDate).toArray();
      }
      setTrainings(trainingsData);

      setTrainings(trainingsData);

      // Load projects for linking
      const projectsData = await db.projects.toArray();
      setProjects(projectsData);

      // Load all quests for linking
      const allQuestsData = await db.quests.toArray();
      setQuests(questsData); // Keep the filtered ones for display
      setFullQuests(allQuestsData); // Need a new state for all quests

    } catch (error) {
      console.error('Error loading agenda data:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.startDate) {
      toast.error('Titre et date requis');
      return;
    }

    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = formData.endTime
        ? new Date(`${formData.startDate}T${formData.endTime}`)
        : new Date(startDateTime.getTime() + 60 * 60 * 1000);

      // Recurrence Rule Generation
      let recurrenceRule = null;
      if (formData.recurrence !== 'none') {
        const ruleOptions = {
          freq: formData.recurrence === 'daily' ? RRule.DAILY :
            formData.recurrence === 'weekly' ? RRule.WEEKLY : RRule.MONTHLY,
          dtstart: startDateTime,
        };
        recurrenceRule = new RRule(ruleOptions).toString();
      }

      if (editEvent) {
        if (isInstanceEdit && editEvent.isRecurring) {
          // 1. Add exception to the original series
          const originalEvent = events.find(e => e.id === editEvent.id);
          if (originalEvent) {
            const newExceptions = [...(originalEvent.exceptionDates || []), editEvent.startDate];
            await db.events.update(originalEvent.id, { exceptionDates: newExceptions });

            // 2. Create a new single event
            await db.events.add({
              id: `event-${Date.now()}`,
              title: formData.title,
              type: formData.type,
              startDate: startDateTime.toISOString(),
              endDate: endDateTime.toISOString(),
              description: formData.description,
              location: formData.location,
              projectId: formData.projectId,
              questId: formData.questId,
              createdAt: new Date(),
              recurrenceRule: null,
              exceptionDates: []
            });
            toast.success('Occurrence modifiée !');
          }
        } else {
          await db.events.update(editEvent.id, {
            title: formData.title,
            type: formData.type,
            startDate: startDateTime.toISOString(),
            endDate: endDateTime.toISOString(),
            description: formData.description,
            location: formData.location,
            projectId: formData.projectId,
            questId: formData.questId,
            recurrenceRule // Update rule if changed
          });
          toast.success('Événement modifié!');
        }
      } else {
        await db.events.add({
          id: `event-${Date.now()}`,
          title: formData.title,
          type: formData.type,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          description: formData.description,
          location: formData.location,
          projectId: formData.projectId,
          questId: formData.questId,
          createdAt: new Date(),
          recurrenceRule,
          exceptionDates: []
        });
        toast.success('Événement créé!');
      }
      setIsOpen(false);
      resetForm();
      setEditEvent(null);
      loadAllData();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'meeting',
      startDate: '',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      recurrence: 'none',
      projectId: null,
      questId: null
    });
    setIsInstanceEdit(false);
  };

  const handleDelete = async (event, isInstance = false) => {
    try {
      if (event.source !== 'event') {
        toast.error("Impossible de supprimer cet élément.");
        return;
      }

      if (isInstance && event.isRecurring) {
        if (window.confirm("Supprimer cette occurrence uniquement ? (Annuler pour ne rien faire)")) {
          const originalEvent = events.find(e => e.id === event.id);
          if (originalEvent) {
            const newExceptions = [...(originalEvent.exceptionDates || []), event.startDate];
            await db.events.update(event.id, { exceptionDates: newExceptions });
            toast.success('Occurrence supprimée');
            loadAllData();
          }
        }
        return;
      }

      if (confirm('Voulez-vous vraiment supprimer cet événement ?')) {
        await db.events.delete(event.id);
        toast.success('Événement supprimé');
        loadAllData();
      }
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const handleEdit = (event) => {
    if (event.source !== 'event') {
      toast.info("Modifiez cet élément depuis sa page dédiée.");
      return;
    }

    // For recurring instances, we ask if editing series or just instance
    if (event.isRecurring) {
      if (confirm("Modifier uniquement cette occurrence ? (Annuler pour modifier toute la série)")) {
        setIsInstanceEdit(true);
      } else {
        setIsInstanceEdit(false);
      }
    } else {
      setIsInstanceEdit(false);
    }

    setEditEvent(event);
    setFormData({
      title: event.title,
      type: event.type,
      startDate: format(new Date(event.startDate), 'yyyy-MM-dd'),
      startTime: format(new Date(event.startDate), 'HH:mm'),
      endTime: event.endDate ? format(new Date(event.endDate), 'HH:mm') : '10:00',
      description: event.description || '',
      location: event.location || '',
      recurrence: event.recurrenceRule ? (event.recurrenceRule.includes('DAILY') ? 'daily' : event.recurrenceRule.includes('WEEKLY') ? 'weekly' : 'monthly') : 'none',
      projectId: event.projectId || null,
      questId: event.questId || null
    });
    setIsOpen(true);
  };

  const getItemsForDay = (day) => {
    // 1. Regular & Recurring Events
    const dayEvents = [];

    events.forEach(event => {
      if (event.recurrenceRule) {
        try {
          const rule = RRule.fromString(event.recurrenceRule);
          const startOfDayDate = startOfDay(day);
          const endOfDayDate = new Date(day);
          endOfDayDate.setHours(23, 59, 59, 999);

          // Check if an instance falls on this day
          const instances = rule.between(startOfDayDate, endOfDayDate, true);

          if (instances.length > 0) {
            const instanceDate = instances[0];
            // Check exceptions
            const isException = (event.exceptionDates || []).some(ex => isSameDay(new Date(ex), instanceDate));

            if (!isException) {
              dayEvents.push({
                ...event,
                startDate: instanceDate.toISOString(), // Override logic
                source: 'event',
                isRecurring: true
              });
            }
          }
        } catch (e) {
          console.error("RRule error", e);
        }
      } else {
        if (isSameDay(new Date(event.startDate), day)) {
          dayEvents.push({ ...event, source: 'event' });
        }
      }
    });


    const dayQuests = quests.filter(q => isSameDay(new Date(q.dueDate), day)).map(q => ({
      id: q.id,
      title: q.title,
      type: 'deadline', // pour badge couleur
      startDate: new Date(q.dueDate), // approximation pour le tri
      source: 'quest',
      description: 'Échéance de quête'
    }));

    const dayTrainings = trainings.filter(t => isSameDay(new Date(t.scheduleDate), day)).map(t => ({
      id: t.id,
      title: `Entraînement: ${t.type}`,
      type: 'training',
      startDate: new Date(t.scheduleDate),
      source: 'training',
      description: `${t.duration} min - ${t.intensity}`
    }));

    return [...dayEvents, ...dayQuests, ...dayTrainings].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const selectedDayItems = getItemsForDay(selectedDate);

  return (
    <div className="space-y-6 animate-fade-in" data-testid="agenda-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-2 flex items-center gap-3" data-testid="agenda-title">
            <CalendarIcon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            Agenda
          </h1>
          <p className="text-foreground/60 text-sm sm:text-lg">Organisez vos événements et deadlines</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="create-event-button" onClick={resetForm}>
              <Plus className="w-5 h-5" />
              Nouvel événement
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="create-event-dialog">
            <DialogHeader>
              <DialogTitle>{editEvent ? 'Modifier un événement' : 'Créer un événement'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Titre *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Titre de l'événement"
                  data-testid="event-title-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger data-testid="event-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meeting">Réunion</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="event">Événement</SelectItem>
                      <SelectItem value="reminder">Rappel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Récurrence</label>
                  <Select
                    value={formData.recurrence}
                    onValueChange={(value) => setFormData({ ...formData, recurrence: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Répétition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Une fois</SelectItem>
                      <SelectItem value="daily">Tous les jours</SelectItem>
                      <SelectItem value="weekly">Toutes les semaines</SelectItem>
                      <SelectItem value="monthly">Tous les mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                    <FolderKanban className="w-3 h-3" /> Projet (Optionnel)
                  </label>
                  <Select
                    value={formData.projectId || "none"}
                    onValueChange={(value) => setFormData({ ...formData, projectId: value === "none" ? null : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un projet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun</SelectItem>
                      {projects.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                    <Sword className="w-3 h-3" /> Quête (Optionnel)
                  </label>
                  <Select
                    value={formData.questId || "none"}
                    onValueChange={(value) => setFormData({ ...formData, questId: value === "none" ? null : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Lier à une quête" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun</SelectItem>
                      {fullQuests.map(q => (
                        <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date *</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  data-testid="event-date-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Heure début</label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    data-testid="event-start-time-input"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Heure fin</label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    data-testid="event-end-time-input"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de l'événement"
                  data-testid="event-description-input"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Lieu</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Lieu de l'événement"
                  data-testid="event-location-input"
                />
              </div>
              <Button onClick={handleCreate} className="w-full" data-testid="submit-event-button">
                {editEvent ? 'Modifier' : 'Créer'} l'événement
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 card-modern" data-testid="calendar-widget">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 hover:bg-foreground/10 rounded-lg transition-colors"
              data-testid="prev-month-button"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </h2>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 hover:bg-foreground/10 rounded-lg transition-colors"
              data-testid="next-month-button"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-foreground/60 p-2">
                {day}
              </div>
            ))}
            {calendarDays.map((day, idx) => {
              const dayItems = getItemsForDay(day);
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();

              // Indicateurs de contenu
              const hasEvents = dayItems.some(i => i.source === 'event');
              const hasQuests = dayItems.some(i => i.source === 'quest');
              const hasTraining = dayItems.some(i => i.source === 'training');

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedDate(day);
                    setFormData({ ...formData, startDate: format(day, 'yyyy-MM-dd') });
                  }}
                  className={`aspect-square p-1 sm:p-2 rounded-lg transition-all relative flex flex-col items-center justify-center ${isSelected ? 'bg-primary text-white' :
                    isToday ? 'bg-primary/20 text-primary font-bold' :
                      isCurrentMonth ? 'hover:bg-foreground/5' : 'text-foreground/30'
                    }`}
                  data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
                >
                  <span className="text-xs sm:text-base">{format(day, 'd')}</span>
                  <div className="flex gap-0.5 mt-0.5 h-1 justify-center">
                    {hasEvents && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />}
                    {hasQuests && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-red-500'}`} />}
                    {hasTraining && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-orange-500'}`} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Events List */}
        <div className="card-modern" data-testid="events-list-widget">
          <h3 className="text-xl font-bold mb-4">
            {format(selectedDate, 'd MMMM yyyy', { locale: fr })}
          </h3>
          <div className="space-y-3">
            {selectedDayItems.length > 0 ? (
              selectedDayItems.map((item, idx) => (
                <div
                  key={`${item.source}-${item.id}-${idx}`}
                  className="p-4 bg-foreground/5 rounded-xl hover:bg-foreground/10 transition-colors border-l-4"
                  style={{
                    borderLeftColor:
                      item.source === 'event' ? '#3b82f6' :
                        item.source === 'quest' ? '#ef4444' :
                          item.source === 'training' ? '#f97316' : 'transparent'
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold flex items-center gap-1">
                      {item.isRecurring && <Repeat className="w-3 h-3 text-muted-foreground" />}
                      {item.title}
                    </h4>
                    {item.projectId && (
                      <Badge variant="outline" className="text-[10px] h-5 bg-primary/5 text-primary border-primary/20">
                        {projects.find(p => p.id === item.projectId)?.title || 'Projet'}
                      </Badge>
                    )}
                    {item.source === 'event' ? (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} title="Modifier">
                          <Plus className="w-4 h-4 rotate-45" />
                        </Button>
                        <button
                          onClick={() => handleDelete(item, item.isRecurring)}
                          className="p-1 hover:bg-red-500/20 text-red-500 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs opacity-50 uppercase font-bold tracking-wider">{item.source === 'quest' ? 'Quête' : 'Sport'}</div>
                    )}
                  </div>

                  {item.source === 'event' && (
                    <div className="flex items-center gap-2 text-sm text-foreground/60 mb-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {format(new Date(item.startDate), 'HH:mm')} -
                        {item.endDate && format(new Date(item.endDate), 'HH:mm')}
                      </span>
                    </div>
                  )}

                  {item.source === 'training' && (
                    <div className="flex items-center gap-2 text-sm text-foreground/60 mb-1">
                      <Dumbbell className="w-4 h-4" />
                      <span>Programmé</span>
                    </div>
                  )}

                  {item.source === 'quest' && (
                    <div className="flex items-center gap-2 text-sm text-foreground/60 mb-1">
                      <Target className="w-4 h-4" />
                      <span>Deadline</span>
                    </div>
                  )}

                  {item.location && (
                    <div className="text-sm text-foreground/60 flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {item.location}
                    </div>
                  )}
                  {item.description && (
                    <div className="text-sm text-foreground/70 mt-1 italic">
                      {item.description}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-foreground/40 py-8">Rien de prévu ce jour</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agenda;
