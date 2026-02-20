import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import {
  FolderKanban,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  MoreVertical,
  Target,
  TrendingUp,
  FileText,
  Calendar,
  Layout,
  Tag,
  LayoutGrid,
  List
} from 'lucide-react';
import ProjectListView from '../components/projects/ProjectListView';
import ProjectCalendarView from '../components/projects/ProjectCalendarView';
import ProjectTasks from '../components/projects/ProjectTasks';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'; // Assurez-vous d'avoir ce composant ou utilisez une version simple
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { format } from 'date-fns';

const CATEGORIES = [
  { id: 'work', label: 'Travail', color: 'bg-blue-500/20 text-blue-500' },
  { id: 'learning', label: 'Apprentissage', color: 'bg-purple-500/20 text-purple-500' },
  { id: 'health', label: 'Santé', color: 'bg-green-500/20 text-green-500' },
  { id: 'creative', label: 'Créativité', color: 'bg-pink-500/20 text-pink-500' },
  { id: 'personal', label: 'Personnel', color: 'bg-orange-500/20 text-orange-500' },
  { id: 'finance', label: 'Finance', color: 'bg-yellow-500/20 text-yellow-500' },
];

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [view, setView] = useState(() => localStorage.getItem('projects_view_preference') || 'grid');

  // Données liées au projet sélectionné
  const [linkedQuests, setLinkedQuests] = useState([]);
  const [linkedHabits, setLinkedHabits] = useState([]);
  const [linkedNotes, setLinkedNotes] = useState([]);
  const [projectTasks, setProjectTasks] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium',
    status: 'active',
    startDate: '',
    targetDate: ''
  });

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadProjectDetails(selectedProject.id);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const data = await db.projects.reverse().toArray();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadProjectDetails = async (projectId) => {
    try {
      // Charger Quêtes liées
      const quests = await db.quests.where('projectId').equals(projectId).toArray();
      setLinkedQuests(quests);

      // Charger Habitudes liées
      const habits = await db.habits.where('projectId').equals(projectId).toArray();
      setLinkedHabits(habits);

      // Charger Notes liées (via linkedTo array string matching - limitation Dexie simple, on filtre manuellement si besoin ou index)
      // Pour l'instant, supposons que linkedTo contient l'ID du projet
      const allNotes = await db.notes.toArray();
      const notes = allNotes.filter(n => n.linkedTo && n.linkedTo.includes(projectId));
      setLinkedNotes(notes);

      // Charger Tâches (legacy Kanban + Subtasks)
      const tasks = await db.tasks.where('projectId').equals(projectId).toArray();
      setProjectTasks(tasks);

    } catch (error) {
      console.error('Error loading details:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast.error('Titre requis');
      return;
    }

    try {
      if (editProject) {
        await db.projects.update(editProject.id, {
          ...formData,
          updatedAt: new Date()
        });
        toast.success('Projet mis à jour !');
        if (selectedProject?.id === editProject.id) {
          setSelectedProject({ ...selectedProject, ...formData });
        }
      } else {
        const newProject = {
          id: `project-${Date.now()}`,
          ...formData,
          startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
          targetDate: formData.targetDate ? new Date(formData.targetDate) : null,
          progress: 0,
          createdAt: new Date()
        };

        await db.projects.add(newProject);
        toast.success('Projet créé !');
      }
      setIsCreateOpen(false);
      setEditProject(null);
      setFormData({
        title: '',
        description: '',
        category: 'personal',
        priority: 'medium',
        status: 'active',
        startDate: '',
        targetDate: ''
      });
      loadProjects();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleEdit = (project) => {
    setEditProject(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      category: project.category || 'personal',
      priority: project.priority || 'medium',
      status: project.status || 'active',
      startDate: project.startDate ? format(new Date(project.startDate), 'yyyy-MM-dd') : '',
      targetDate: project.targetDate ? format(new Date(project.targetDate), 'yyyy-MM-dd') : ''
    });
    setIsCreateOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce projet et toutes ses données liées ?')) {
      try {
        await db.projects.delete(id);
        // Optionnel : Délier ou supprimer les enfants ?
        // Pour l'instant on garde les enfants mais on retire le lien projectId
        await db.quests.where('projectId').equals(id).modify({ projectId: null });
        await db.habits.where('projectId').equals(id).modify({ projectId: null });
        await db.tasks.where('projectId').equals(id).delete();

        toast.success('Projet supprimé');
        setSelectedProject(null);
        loadProjects();
      } catch (error) {
        toast.error('Erreur');
      }
    }
  };

  // Calcul du % global du projet (basé sur Quêtes + Tâches)
  const calculateTotalProgress = () => {
    if (!selectedProject) return 0;
    const totalItems = linkedQuests.length + projectTasks.length;
    if (totalItems === 0) return selectedProject.progress || 0;

    const completedQuests = linkedQuests.filter(q => q.status === 'completed').length;
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;

    return Math.round(((completedQuests + completedTasks) / totalItems) * 100);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20" data-testid="projects-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <FolderKanban className="w-10 h-10 text-primary" />
            Projets Hub
          </h1>
          <p className="text-foreground/60">Gérez vos grands objectifs et tout ce qui s'y rattache</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setEditProject(null);
        }}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 shadow-lg hover:shadow-primary/20" data-testid="new-project-btn" onClick={() => {
              setEditProject(null);
              setFormData({
                title: '',
                description: '',
                category: 'personal',
                priority: 'medium',
                status: 'active',
                startDate: '',
                targetDate: ''
              });
            }}>
              <Plus className="w-5 h-5" />
              Nouveau Projet
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editProject ? `Modifier: ${editProject.title}` : 'Créer un nouveau projet'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Titre</label>
                <Input
                  placeholder="Mon super projet..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Détails et objectifs..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catégorie</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priorité</label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date de début</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date de fin (Deadline)</label>
                  <Input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleCreate} className="w-full mt-4">
                {editProject ? 'Enregistrer les modifications' : 'Créer le projet'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Switcher */}
      {!selectedProject && (
        <div className="flex justify-end mb-4">
          <div className="inline-flex p-1 bg-muted/50 rounded-lg border border-border">
            <Button
              variant={view === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="gap-2 px-3"
              onClick={() => { setView('grid'); localStorage.setItem('projects_view_preference', 'grid'); }}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grille</span>
            </Button>
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="gap-2 px-3"
              onClick={() => { setView('list'); localStorage.setItem('projects_view_preference', 'list'); }}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Liste</span>
            </Button>
            <Button
              variant={view === 'calendar' ? 'secondary' : 'ghost'}
              size="sm"
              className="gap-2 px-3"
              onClick={() => { setView('calendar'); localStorage.setItem('projects_view_preference', 'calendar'); }}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendrier</span>
            </Button>
          </div>
        </div>
      )}

      {/* Main Content : Grid vs Detail */}
      {!selectedProject ? (
        <div className="animate-in fade-in duration-500">
          {view === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => {
                const category = CATEGORIES.find(c => c.id === project.category) || CATEGORIES[4];
                return (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="glass-card p-6 rounded-xl hover:scale-[1.02] transition-all cursor-pointer group border-l-4"
                    style={{ borderLeftColor: category.color.split(' ')[1].replace('text-', '') }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${category.color}`}>
                          {category.label}
                        </span>
                        <h3 className="text-xl font-bold mt-2 group-hover:text-primary transition-colors">{project.title}</h3>
                      </div>
                      {project.priority === 'high' && <span className="text-red-500 animate-pulse">●</span>}
                    </div>

                    <p className="text-sm text-foreground/60 line-clamp-2 mb-6 h-10">
                      {project.description || 'Aucune description'}
                    </p>

                    <div className="flex justify-between items-end">
                      <div className="w-full mr-4">
                        <div className="flex justify-between text-xs mb-1 text-foreground/50">
                          <span>Progression</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-background border-2 border-white/10 flex items-center justify-center text-[10px]">
                          <Layout className="w-4 h-4 text-foreground/50" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === 'list' && (
            <ProjectListView
              projects={projects}
              categories={CATEGORIES}
              onSelect={setSelectedProject}
              onDelete={handleDelete}
            />
          )}

          {view === 'calendar' && (
            <ProjectCalendarView
              projects={projects}
              categories={CATEGORIES}
              onSelect={setSelectedProject}
            />
          )}

          {projects.length === 0 && (
            <div className="col-span-full text-center py-20 text-foreground/30">
              <FolderKanban className="w-20 h-20 mx-auto mb-4" />
              <p>Créez votre premier projet pour commencer</p>
            </div>
          )}
        </div>
      ) : (
        /* VUE DÉTAILLÉE DU PROJET */
        <div className="animate-in slide-in-from-right-4">
          {/* Detail Header */}
          <div className="glass-card p-6 mb-6 relative overflow-hidden">
            <div className="relative z-10">
              <Button variant="ghost" className="mb-4 pl-0 hover:pl-2 transition-all" onClick={() => setSelectedProject(null)}>
                ← Retour aux projets
              </Button>

              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-4xl font-bold mb-2">{selectedProject.title}</h2>
                  <p className="text-lg text-foreground/70 max-w-2xl">{selectedProject.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(selectedProject)}>
                      <Plus className="w-4 h-4 mr-2 rotate-45" /> Modifier
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedProject.id)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                    </Button>
                  </div>
                  <div className="text-right mt-2">
                    <span className="text-3xl font-bold text-primary">{calculateTotalProgress()}%</span>
                    <p className="text-xs text-foreground/50 uppercase">Progression Globale</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <div className="p-3 bg-background/50 rounded-lg flex items-center gap-3">
                  <Target className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-xl font-bold">{linkedQuests.length}</p>
                    <p className="text-xs text-foreground/50">Quêtes</p>
                  </div>
                </div>
                <div className="p-3 bg-background/50 rounded-lg flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-xl font-bold">{linkedHabits.length}</p>
                    <p className="text-xs text-foreground/50">Habitudes</p>
                  </div>
                </div>
                <div className="p-3 bg-background/50 rounded-lg flex items-center gap-3">
                  <Layout className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-xl font-bold">{projectTasks.length}</p>
                    <p className="text-xs text-foreground/50">Tâches</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="quests" className="space-y-6">
            <TabsList className="bg-background/50 p-1 rounded-xl">
              <TabsTrigger value="quests" className="px-6 gap-2"><Target className="w-4 h-4" /> Quêtes</TabsTrigger>
              <TabsTrigger value="habits" className="px-6 gap-2"><TrendingUp className="w-4 h-4" /> Habitudes</TabsTrigger>
              <TabsTrigger value="tasks" className="px-6 gap-2"><Layout className="w-4 h-4" /> Kanban</TabsTrigger>
              <TabsTrigger value="notes" className="px-6 gap-2"><FileText className="w-4 h-4" /> Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="quests" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Quêtes liées</h3>
                {/* Idéalement un bouton pour créer une quête liée directement ici */}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {linkedQuests.map(q => (
                  <div key={q.id} className="p-4 bg-white/5 rounded-lg border border-white/5 hover:border-primary/50 transition-colors">
                    <h4 className="font-bold">{q.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${q.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'}`}>
                      {q.status}
                    </span>
                  </div>
                ))}
                {linkedQuests.length === 0 && <p className="text-foreground/40 italic">Aucune quête liée.</p>}
              </div>
            </TabsContent>

            <TabsContent value="habits" className="space-y-4">
              <h3 className="text-xl font-bold">Habitudes associées</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {linkedHabits.map(h => (
                  <div key={h.id} className="p-4 bg-white/5 rounded-lg flex justify-between items-center">
                    <span>{h.title}</span>
                    <span className="text-xs font-mono">{h.frequency}</span>
                  </div>
                ))}
                {linkedHabits.length === 0 && <p className="text-foreground/40 italic">Aucune habitude liée au projet.</p>}
              </div>
            </TabsContent>

            <TabsContent value="tasks">
              <ProjectTasks projectId={selectedProject.id} />
            </TabsContent>

            <TabsContent value="notes">
              <h3 className="text-xl font-bold">Notes & Idées</h3>
              <div className="grid grid-cols-1 gap-2">
                {linkedNotes.map(n => (
                  <div key={n.id} className="p-3 bg-white/5 rounded flex gap-2 items-center">
                    <FileText className="w-4 h-4 text-foreground/50" />
                    <span>{n.title}</span>
                  </div>
                ))}
                {linkedNotes.length === 0 && <p className="text-foreground/40 italic">Aucune note liée.</p>}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default Projects;
