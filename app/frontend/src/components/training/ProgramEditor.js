import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Plus, Trash2, Link as LinkIcon, Calendar } from 'lucide-react';
import { db } from '../../lib/db';

const ProgramEditor = ({ onClose, onSave, initialData = null }) => {
    const [formData, setFormData] = useState({
        title: '',
        type: 'Musculation',
        intensity: 'medium',
        defaultDuration: 45,
        exercises: [],
        notes: '',
        questId: 'none',
        linkedHabitId: 'none'
    });

    const [quests, setQuests] = useState([]);
    const [habits, setHabits] = useState([]);

    useEffect(() => {
        const loadLinks = async () => {
            setQuests(await db.quests.where('status').equals('active').toArray());
            setHabits(await db.habits.filter(h => !h.archived).toArray());
        };
        loadLinks();

        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                questId: initialData.questId || 'none',
                linkedHabitId: initialData.linkedHabitId || 'none',
                exercises: initialData.exercises || []
            }));
        }
    }, [initialData]);

    const handleAddExercise = () => {
        setFormData(prev => ({
            ...prev,
            exercises: [...prev.exercises, { name: '', sets: '3', reps: '10', details: '' }]
        }));
    };

    const handleUpdateExercise = (index, field, value) => {
        const newExercises = [...formData.exercises];
        newExercises[index] = { ...newExercises[index], [field]: value };
        setFormData(prev => ({ ...prev, exercises: newExercises }));
    };

    const handleRemoveExercise = (index) => {
        setFormData(prev => ({
            ...prev,
            exercises: prev.exercises.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = () => {
        if (!formData.title) return alert("Nom du programme requis");
        onSave(formData);
    };

    return (
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{initialData ? 'Modifier le Programme' : 'Nouveau Programme'}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">

                {/* 1. Identity */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nom du Programme</Label>
                        <Input
                            placeholder="Ex: Pectoraux / Triceps A"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="text-lg font-bold"
                        />
                    </div>
                </div>

                {/* 2. Specs */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Musculation">Musculation</SelectItem>
                                <SelectItem value="Cardio">Cardio</SelectItem>
                                <SelectItem value="Yoga">Yoga</SelectItem>
                                <SelectItem value="Crossfit">Crossfit</SelectItem>
                                <SelectItem value="Sport Co">Sport Co</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Durée (min)</Label>
                        <Input
                            type="number"
                            value={formData.defaultDuration}
                            onChange={(e) => setFormData({ ...formData, defaultDuration: parseInt(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Intensité</Label>
                        <Select value={formData.intensity} onValueChange={(v) => setFormData({ ...formData, intensity: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Faible</SelectItem>
                                <SelectItem value="medium">Moyenne</SelectItem>
                                <SelectItem value="high">Élevée</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* 3. Links (NEW) */}
                <div className="grid grid-cols-2 gap-4 bg-secondary/20 p-4 rounded-xl border border-border/50">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2"><LinkIcon className="w-3 h-3 text-primary" /> Lier à une Quête</Label>
                        <Select value={formData.questId} onValueChange={(v) => setFormData({ ...formData, questId: v })}>
                            <SelectTrigger className="h-8 text-xs bg-background"><SelectValue placeholder="Aucune" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Aucune</SelectItem>
                                {quests.map(q => <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Calendar className="w-3 h-3 text-primary" /> Lier à une Habitude</Label>
                        <Select value={formData.linkedHabitId} onValueChange={(v) => setFormData({ ...formData, linkedHabitId: v })}>
                            <SelectTrigger className="h-8 text-xs bg-background"><SelectValue placeholder="Aucune" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Aucune</SelectItem>
                                {habits.map(h => <SelectItem key={h.id} value={h.id}>{h.title}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* 4. Exercises */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Structure de la séance</Label>
                        <Button variant="ghost" size="sm" onClick={handleAddExercise} className="text-primary h-8">
                            <Plus className="w-4 h-4 mr-1" /> Ajouter Ex.
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {formData.exercises.map((ex, i) => (
                            <div key={i} className="flex gap-2 items-center bg-card p-2 rounded border border-border/50">
                                <div className="font-mono text-xs text-muted-foreground w-6 text-center">{i + 1}</div>
                                <Input
                                    className="h-8 text-xs flex-1"
                                    placeholder="Nom de l'exercice"
                                    value={ex.name}
                                    onChange={(e) => handleUpdateExercise(i, 'name', e.target.value)}
                                />
                                <div className="flex items-center gap-1 w-20">
                                    <Input
                                        className="h-8 text-xs text-center px-1"
                                        placeholder="Séries"
                                        value={ex.sets}
                                        onChange={(e) => handleUpdateExercise(i, 'sets', e.target.value)}
                                    />
                                    <span className="text-xs text-muted-foreground">x</span>
                                    <Input
                                        className="h-8 text-xs text-center px-1"
                                        placeholder="Reps"
                                        value={ex.reps}
                                        onChange={(e) => handleUpdateExercise(i, 'reps', e.target.value)}
                                    />
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleRemoveExercise(i)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                        {formData.exercises.length === 0 && <p className="text-center text-xs text-muted-foreground italic py-2">Vide pour l'instant</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Notes par défaut</Label>
                    <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Instructions spéciales..."
                        className="h-20 text-sm"
                    />
                </div>

            </div>

            <DialogFooter>
                <Button variant="outline" onClick={onClose}>Annuler</Button>
                <Button onClick={handleSubmit}>{initialData ? 'Mettre à jour' : 'Créer le Programme'}</Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default ProgramEditor;
