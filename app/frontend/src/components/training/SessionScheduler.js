import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Calendar as CalendarIcon, Clock, ChevronRight } from 'lucide-react';
import { format, addHours, startOfHour } from 'date-fns';

const SessionScheduler = ({ program, onClose, onSchedule }) => {
    const defaultDate = format(addHours(startOfHour(new Date()), 1), "yyyy-MM-dd'T'HH:mm");
    const [date, setDate] = useState(defaultDate);
    const [recurrence, setRecurrence] = useState('none');

    const handleConfirm = () => {
        onSchedule(program, date, recurrence);
    };

    return (
        <DialogContent className="max-w-sm">
            <DialogHeader>
                <DialogTitle>Planifier : {program.title}</DialogTitle>
            </DialogHeader>

            <div className="py-6 space-y-4">
                <div className="bg-secondary/20 p-3 rounded-lg border border-border/50 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{program.defaultDuration} min</span>
                    </div>
                    <div className="text-muted-foreground text-xs">
                        {program.exercises.length} exercices • {program.linkedHabitId !== 'none' ? 'Lier à une habitude' : 'Standard'}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Date et Heure de la première séance</Label>
                    <div className="relative">
                        <CalendarIcon className="absolute left-3 top-3 w-4 h-4 text-primary" />
                        <Input
                            type="datetime-local"
                            className="pl-9"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Répétition (Hebdomadaire)</Label>
                    <select
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={recurrence}
                        onChange={(e) => setRecurrence(e.target.value)}
                    >
                        <option value="none">Une seule fois</option>
                        <option value="4weeks">Pendant 4 semaines</option>
                        <option value="8weeks">Pendant 8 semaines</option>
                        <option value="12weeks">Pendant 12 semaines</option>
                    </select>
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={onClose}>Annuler</Button>
                <Button onClick={handleConfirm} className="gap-2">
                    Valider <ChevronRight className="w-4 h-4" />
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default SessionScheduler;
