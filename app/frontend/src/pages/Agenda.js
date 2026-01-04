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
  Dumbbell
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

const Agenda = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Données
  const [events, setEvents] = useState([]);
  const [quests, setQuests] = useState([]);
  const [trainings, setTrainings] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'meeting',
    startDate: '',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: ''
  });
  const [editEvent, setEditEvent] = useState(null);

  useEffect(() => {
    loadAllData();
  }, [currentDate]);

  const loadAllData = async () => {
    try {
      // Charger événements
      const eventsData = await db.events.toArray();
      setEvents(eventsData);

      // Charger quêtes (actives ou non, tant qu'il y a une échéance)
      const questsData = await db.quests.filter(q => !!q.dueDate).toArray();
      setQuests(questsData);

      // Charger entraînements programmés
      // On filtre ceux qui ont une scheduleDate
      const trainingsData = await db.training.filter(t => !!t.scheduleDate).toArray();
      setTrainings(trainingsData);

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
      const endDateTime = new Date(`${formData.startDate}T${formData.endTime}`);

      if (editEvent) {
        await db.events.update(editEvent.id, {
          title: formData.title,
          type: formData.type,
          startDate: startDateTime,
          endDate: endDateTime,
          description: formData.description,
          location: formData.location
        });
        toast.success('Événement modifié!');
      } else {
        await db.events.add({
          id: `event-${Date.now()}`,
          title: formData.title,
          type: formData.type,
          startDate: startDateTime,
          endDate: endDateTime,
          description: formData.description,
          location: formData.location,
          createdAt: new Date()
        });
        toast.success('Événement créé!');
      }
      setIsOpen(false);
      setFormData({
        title: '',
        type: 'meeting',
        startDate: '',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: ''
      });
      setEditEvent(null);
      loadAllData();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const handleDelete = async (id, type) => {
    try {
      if (type === 'event') await db.events.delete(id);
      // On ne supprime pas une quête ou un training depuis l'agenda pour éviter les fausses manips, 
      // ou alors on affiche un toast explicite. Pour l'instant, seulement les events custom.
      else {
        toast.error("Impossible de supprimer cet élément depuis l'agenda.");
        return;
      }

      toast.success('Événement supprimé');
      loadAllData();
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
    setEditEvent(event);
    setFormData({
      title: event.title,
      type: event.type,
      startDate: format(new Date(event.startDate), 'yyyy-MM-dd'),
      startTime: format(new Date(event.startDate), 'HH:mm'),
      endTime: format(new Date(event.endDate), 'HH:mm'),
      description: event.description || '',
      location: event.location || ''
    });
    setIsOpen(true);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Agrégation des items par date
  const getItemsForDay = (day) => {
    const dayEvents = events.filter(e => isSameDay(new Date(e.startDate), day)).map(e => ({ ...e, source: 'event' }));

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

    return [...dayEvents, ...dayQuests, ...dayTrainings];
  };

  const selectedDayItems = getItemsForDay(selectedDate); // Recalcule pour le jour sélectionné

  return (
    <div className="space-y-6 animate-fade-in" data-testid="agenda-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 flex items-center gap-3" data-testid="agenda-title">
            <CalendarIcon className="w-10 h-10 text-primary" />
            Agenda
          </h1>
          <p className="text-foreground/60 text-lg">Organisez vos événements et deadlines</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="create-event-button">
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
                <Input
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
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square p-2 rounded-lg transition-all relative ${isSelected ? 'bg-primary text-white' :
                    isToday ? 'bg-primary/20 text-primary font-bold' :
                      isCurrentMonth ? 'hover:bg-foreground/5' : 'text-foreground/30'
                    }`}
                  data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
                >
                  <span>{format(day, 'd')}</span>
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5 max-w-[80%] justify-center overflow-hidden">
                    {/* Dots indicateurs simples */}
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
                  }} // Blue, Red, Orange
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{item.title}</h4>
                    {item.source === 'event' ? (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} title="Modifier">
                          <Plus className="w-4 h-4 rotate-45" />
                        </Button>
                        <button
                          onClick={() => handleDelete(item.id, item.source)}
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
                    <div className="text-sm text-foreground/60">
                      <span className="font-medium">Lieu :</span> {item.location}
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
