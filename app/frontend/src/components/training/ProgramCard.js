import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Dumbbell, Clock, Zap, MoreVertical, Play, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

const ProgramCard = ({ template, onPlan, onEdit, onDelete, onStartNow }) => {
    return (
        <Card className="hover:border-primary/50 transition-all duration-300 group bg-card/50 border-border/50">
            <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-secondary text-primary">
                            <Dumbbell className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-foreground leading-tight">{template.title}</h3>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mt-0.5">{template.type}</p>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(template)}>
                                <Edit className="w-4 h-4 mr-2" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(template.id)}>
                                <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Metrics */}
                <div className="flex gap-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-primary/70" />
                        <span>{template.defaultDuration} min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-yellow-500/70" />
                        <span className="capitalize">{template.intensity === 'low' ? 'Léger' : template.intensity === 'medium' ? 'Modéré' : 'Intense'}</span>
                    </div>
                </div>

                {/* Exercises Preview */}
                <div className="space-y-1 mb-5">
                    {template.exercises.slice(0, 3).map((ex, i) => (
                        <div key={i} className="text-xs text-muted-foreground/80 flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-border" />
                            {ex.name} <span className="opacity-50">({ex.sets}x{ex.reps})</span>
                        </div>
                    ))}
                    {template.exercises.length > 3 && (
                        <div className="text-xs text-muted-foreground italic pl-3">+ {template.exercises.length - 3} autres...</div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => onPlan(template)} className="w-full">
                        Planifier
                    </Button>
                    <Button size="sm" onClick={() => onStartNow(template)} className="w-full gap-2">
                        <Play className="w-3.5 h-3.5" /> Lancer
                    </Button>
                </div>
            </CardContent>
        </Card >
    );
};

export default ProgramCard;
