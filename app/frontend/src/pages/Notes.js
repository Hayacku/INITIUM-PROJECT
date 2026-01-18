import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Tag,
  Link as LinkIcon,
  Save,
  X,
  Target,
  FolderKanban,
  Dumbbell
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // États de liaison
  const [projects, setProjects] = useState([]);
  const [activeQuests, setActiveQuests] = useState([]); // Renamed for clarity but keeping variable name if easier, actually let's stick to user request: need to link quests.
  const [quests, setQuests] = useState([]);
  const [trainings, setTrainings] = useState([]);

  // États d'édition
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editLinks, setEditLinks] = useState([]); // Tableau d'IDs liés

  useEffect(() => {
    loadNotes();
    loadLinkData();
  }, []);

  const loadLinkData = async () => {
    try {
      const p = await db.projects.toArray();
      const q = await db.quests.where('status').notEqual('completed').toArray();
      const t = await db.training.toArray();
      setProjects(p);
      setQuests(q);
      setTrainings(t);
    } catch (error) {
      console.error('Error loading link data:', error);
    }
  };

  const loadNotes = async () => {
    try {
      const data = await db.notes.reverse().toArray();
      setNotes(data);
      // Restaurer la sélection si elle existe encore (optionnel, pour UX fluide)
      if (selectedNote) {
        const updatedSelected = data.find(n => n.id === selectedNote.id);
        if (updatedSelected && !isEditing) setSelectedNote(updatedSelected);
      } else if (data.length > 0) {
        setSelectedNote(data[0]);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleCreateNote = async () => {
    try {
      const newNote = {
        id: `note-${Date.now()}`,
        title: 'Nouvelle note',
        content: '# Nouvelle note\n\nCommencez à écrire...',
        tags: [],
        linkedTo: [], // Nouveau champ
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.notes.add(newNote);
      toast.success('Note créée!');
      await loadNotes();

      setSelectedNote(newNote);
      setIsEditing(true);
      setEditTitle(newNote.title);
      setEditContent(newNote.content);
      setEditTags('');
      setEditLinks([]);
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;

    try {
      const tags = editTags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      await db.notes.update(selectedNote.id, {
        title: editTitle,
        content: editContent,
        tags,
        linkedTo: editLinks, // Sauvegarde des liens
        updatedAt: new Date()
      });

      toast.success('Note enregistrée!');
      setIsEditing(false);
      loadNotes();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("Supprimer définitivement cette note ?")) return;
    try {
      await db.notes.delete(id);
      toast.success('Note supprimée');
      setSelectedNote(null);
      loadNotes();
    } catch (error) {
      toast.error('Erreur');
      console.error(error);
    }
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setIsEditing(true);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags ? note.tags.join(', ') : '');
    setEditLinks(note.linkedTo || []);
  };

  const addLink = (id) => {
    if (id && !editLinks.includes(id)) {
      setEditLinks([...editLinks, id]);
    }
  };

  const removeLink = (id) => {
    setEditLinks(editLinks.filter(linkId => linkId !== id));
  };

  // Helper pour obtenir le nom d'un objet lié
  const getLinkedObject = (id) => {
    const project = projects.find(p => p.id === id);
    if (project) return { ...project, type: 'project' };
    const quest = quests.find(q => q.id === id);
    if (quest) return { ...quest, type: 'quest' };
    const training = trainings.find(t => t.id === id);
    if (training) return { ...training, type: 'training' };
    return null;
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="space-y-6 animate-fade-in" data-testid="notes-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 flex items-center gap-3" data-testid="notes-title">
            <FileText className="w-10 h-10 text-primary" />
            Notes
          </h1>
          <p className="text-foreground/60 text-lg">Votre base de connaissances personnelle</p>
        </div>
        <Button className="gap-2" onClick={handleCreateNote} data-testid="create-note-button">
          <Plus className="w-5 h-5" />
          Nouvelle note
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Notes List */}
        <div className="glass-card flex flex-col h-[600px]" data-testid="notes-list">
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-10 bg-white/5 border-white/10 focus:border-primary/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="notes-search-input"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedNote?.id === note.id
                  ? 'bg-primary/20 border-primary/50 text-white shadow-[0_0_15px_rgba(var(--primary),0.3)]'
                  : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10 text-muted-foreground hover:text-foreground'
                  }`}
                onClick={() => {
                  setSelectedNote(note);
                  setIsEditing(false);
                }}
                data-testid={`note-item-${note.id}`}
              >
                <div className="flex justify-between items-start">
                  <h3 className={`font-semibold mb-1 truncate ${selectedNote?.id === note.id ? 'text-white' : 'text-foreground'}`}>
                    {note.title}
                  </h3>
                  {note.linkedTo && note.linkedTo.length > 0 && <LinkIcon className="w-3 h-3 opacity-50 flex-shrink-0 mt-1" />}
                </div>
                <p className={`text-xs ${selectedNote?.id === note.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {format(new Date(note.updatedAt || note.createdAt), 'dd/MM/yyyy HH:mm')}
                </p>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className={`text-[10px] px-1.5 py-0.5 rounded-full border ${selectedNote?.id === note.id
                          ? 'bg-white/20 border-white/20 text-white'
                          : 'bg-background/50 border-white/10 text-muted-foreground'
                          }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {filteredNotes.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Search className="w-8 h-8 opacity-20 mb-2" />
                <p>Aucune note</p>
              </div>
            )}
          </div>
        </div>

        {/* Note Content */}
        <div className="lg:col-span-3 glass-card flex flex-col min-h-[600px] p-6" data-testid="note-content">
          {selectedNote ? (
            <div>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-0 h-auto"
                      placeholder="Titre de la note"
                      data-testid="note-title-input"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSaveNote} className="gap-2" data-testid="save-note-button">
                        <Save className="w-4 h-4" />
                        Enregistrer
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        data-testid="cancel-edit-button"
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>

                  {/* Liens en mode édition */}
                  <div className="space-y-2 p-4 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Liens ({editLinks.length})</label>
                      <Select onValueChange={(val) => addLink(val)}>
                        <SelectTrigger className="w-[200px] h-8 text-xs">
                          <SelectValue placeholder="Ajouter un lien..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Projets</SelectLabel>
                            {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Quêtes</SelectLabel>
                            {quests.map(q => <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>)}
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Entraînement</SelectLabel>
                            {trainings.map(t => <SelectItem key={t.id} value={t.id}>{t.type} - {format(new Date(t.createdAt), 'dd/MM')}</SelectItem>)}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editLinks.map(linkId => {
                        const obj = getLinkedObject(linkId);
                        if (!obj) return null;
                        return (
                          <span key={linkId} className="flex items-center gap-1 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full border border-primary/20">
                            {obj.type === 'project' ? <FolderKanban className="w-3 h-3" /> : obj.type === 'quest' ? <Target className="w-3 h-3" /> : <Dumbbell className="w-3 h-3" />}
                            {obj.title || obj.type}
                            <button onClick={() => removeLink(linkId)} className="ml-1 hover:text-white"><X className="w-3 h-3" /></button>
                          </span>
                        );
                      })}
                      {editLinks.length === 0 && <span className="text-xs text-foreground/40 italic">Aucun lien</span>}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags (séparés par des virgules)
                    </label>
                    <Input
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      placeholder="react, dev, apprentissage"
                      data-testid="note-tags-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Contenu (Markdown)</label>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[400px] font-mono text-sm leading-relaxed"
                      placeholder="# Titre\n\nVotre contenu en Markdown..."
                      data-testid="note-content-input"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold mb-2">{selectedNote.title}</h2>
                      <p className="text-sm text-foreground/60">
                        Mis à jour le {format(new Date(selectedNote.updatedAt || selectedNote.createdAt), 'dd/MM/yyyy à HH:mm')}
                      </p>

                      {/* Affichage Tags */}
                      {selectedNote.tags && selectedNote.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 mb-2">
                          {selectedNote.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary-foreground flex items-center gap-1 border border-secondary/20"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Affichage Liens */}
                      {selectedNote.linkedTo && selectedNote.linkedTo.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedNote.linkedTo.map((linkId) => {
                            const obj = getLinkedObject(linkId);
                            if (!obj) return null;
                            return (
                              <span key={linkId} className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary flex items-center gap-1 border border-primary/20">
                                {obj.type === 'project' ? <FolderKanban className="w-3 h-3" /> : obj.type === 'quest' ? <Target className="w-3 h-3" /> : <Dumbbell className="w-3 h-3" />}
                                {obj.title || obj.type}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditNote(selectedNote)}
                        data-testid="edit-note-button"
                      >
                        Éditer
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteNote(selectedNote.id)}
                        data-testid="delete-note-button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="prose prose-invert max-w-none pt-4 border-t border-white/10" data-testid="note-markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedNote.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <FileText className="w-20 h-20 mx-auto text-foreground/20 mb-4" />
              <p className="text-xl text-foreground/40">Sélectionnez une note</p>
              <p className="text-foreground/30 mt-2">Ou créez-en une nouvelle</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
