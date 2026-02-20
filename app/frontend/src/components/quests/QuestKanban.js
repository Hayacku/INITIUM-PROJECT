import React from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Zap, Calendar, MoreVertical, CheckCircle2, Circle, Clock } from 'lucide-react';

const QuestKanban = ({ quests, onStatusChange, onEdit, onDelete }) => {
    const columns = [
        { id: 'todo', title: 'À faire', status: 'active' },
        { id: 'in_progress', title: 'En cours', status: 'in_progress' },
        { id: 'completed', title: 'Terminé', status: 'completed' }
    ];

    const getQuestsByStatus = (status) => {
        // Map 'active' to include any other potential todo-like status if needed
        return quests.filter(q => q.status === status);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[500px]">
            {columns.map(col => (
                <div key={col.id} className="flex flex-col bg-muted/30 rounded-xl border border-border/50 p-4">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="font-bold flex items-center gap-2">
                            {col.title}
                            <Badge variant="secondary" className="h-5 px-1.5">{getQuestsByStatus(col.status).length}</Badge>
                        </h3>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto max-h-[70vh] pr-2 scrollbar-thin">
                        {getQuestsByStatus(col.status).map(quest => (
                            <div
                                key={quest.id}
                                className="group bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider h-5">
                                        {quest.category}
                                    </Badge>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(quest)}>
                                            <MoreVertical className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>

                                <h4 className={`font-bold text-sm mb-2 ${quest.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                    {quest.title}
                                </h4>

                                {quest.steps && quest.steps.length > 0 && (
                                    <div className="mb-3">
                                        <div className="flex justify-between text-[9px] text-muted-foreground uppercase mb-1">
                                            <span>Progression</span>
                                            <span>{quest.progress || 0}%</span>
                                        </div>
                                        <Progress value={quest.progress || 0} className="h-1" />
                                    </div>
                                )}

                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Zap className="w-3 h-3 text-yellow-500" /> {quest.xp}
                                        </span>
                                        {quest.dueDate && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(quest.dueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex gap-1">
                                        {quest.status !== 'completed' ? (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-emerald-500 hover:bg-emerald-500/10"
                                                onClick={() => onStatusChange(quest, 'completed')}
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                            </Button>
                                        ) : (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-primary hover:bg-primary/10"
                                                onClick={() => onStatusChange(quest, 'in_progress')}
                                            >
                                                <Clock className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {getQuestsByStatus(col.status).length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border/50 rounded-xl opacity-40">
                                <Circle className="w-8 h-8 mb-2" />
                                <p className="text-xs">Vide</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default QuestKanban;
