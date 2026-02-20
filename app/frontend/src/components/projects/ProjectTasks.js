import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import {
    CheckCircle2,
    Circle,
    Plus,
    Trash2,
    ChevronRight,
    ChevronDown,
    MoreVertical,
    CornerDownRight,
    Lock,
    Link as LinkIcon,
    X
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from '../ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { Badge } from '../ui/badge';

const ProjectTasks = ({ projectId }) => {
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [expandedTasks, setExpandedTasks] = useState({}); // { taskId: boolean }

    useEffect(() => {
        loadTasks();
    }, [projectId]);

    const loadTasks = async () => {
        try {
            const allTasks = await db.tasks.where('projectId').equals(projectId).toArray();
            // Sort: completed at bottom, then by order/created
            const sorted = allTasks.sort((a, b) => {
                if (a.status === 'completed' && b.status !== 'completed') return 1;
                if (a.status !== 'completed' && b.status === 'completed') return -1;
                return new Date(a.createdAt) - new Date(b.createdAt);
            });
            setTasks(sorted);
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    };

    const handleAddTask = async (parentId = null) => {
        const title = newTaskTitle.trim();
        if (!title && !parentId) return; // Only check empty for root input here

        try {
            const newTask = {
                id: `task-${Date.now()}`,
                projectId,
                title: title,
                status: 'todo',
                parentId,
                blockedBy: [],
                order: tasks.length,
                createdAt: new Date()
            };

            await db.tasks.add(newTask);
            if (!parentId) setNewTaskTitle('');

            // If adding subtask, ensure parent is expanded
            if (parentId) {
                setExpandedTasks(prev => ({ ...prev, [parentId]: true }));
            }

            toast.success(parentId ? 'Sous-tâche ajoutée' : 'Tâche ajoutée');
            loadTasks();
            return true; // Success
        } catch (error) {
            toast.error('Erreur');
            return false;
        }
    };

    const toggleTaskStatus = async (task) => {
        // Check dependencies
        if (task.blockedBy && task.blockedBy.length > 0) {
            const blockingTasks = tasks.filter(t => task.blockedBy.includes(t.id) && t.status !== 'completed');
            if (blockingTasks.length > 0) {
                toast.error(`Bloqué par : ${blockingTasks.map(t => t.title).join(', ')}`);
                return;
            }
        }

        try {
            const newStatus = task.status === 'completed' ? 'todo' : 'completed';
            await db.tasks.update(task.id, { status: newStatus });
            loadTasks();
        } catch (error) {
            toast.error('Erreur');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Supprimer cette tâche et ses sous-tâches ?')) return;
        try {
            // Recursive delete function to find all descendants
            const getAllDescendants = (parentId, allTasks) => {
                const children = allTasks.filter(t => t.parentId === parentId);
                let ids = [...children.map(t => t.id)];
                children.forEach(child => {
                    ids = [...ids, ...getAllDescendants(child.id, allTasks)];
                });
                return ids;
            };

            const descendants = getAllDescendants(taskId, tasks);
            const idsToDelete = [taskId, ...descendants];

            // Clean up blockedBy references in other tasks
            const tasksToUpdate = tasks.filter(t => t.blockedBy && t.blockedBy.some(id => idsToDelete.includes(id)));
            for (const task of tasksToUpdate) {
                const newBlockedBy = task.blockedBy.filter(id => !idsToDelete.includes(id));
                await db.tasks.update(task.id, { blockedBy: newBlockedBy });
            }

            await db.tasks.bulkDelete(idsToDelete);
            toast.success('Tâche supprimée');
            loadTasks();
        } catch (error) {
            toast.error('Erreur');
        }
    };

    const toggleExpand = (taskId) => {
        setExpandedTasks(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
    };

    const updateDependencies = async (taskId, newBlockedBy) => {
        try {
            await db.tasks.update(taskId, { blockedBy: newBlockedBy });
            toast.success('Dépendances mises à jour');
            loadTasks();
        } catch (error) {
            toast.error('Erreur lors de la mise à jour des dépendances');
        }
    };

    // Stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // Recursive render helper
    const renderTaskTree = (parentId = null, depth = 0) => {
        const currentLevelTasks = tasks.filter(t => t.parentId === parentId);

        if (currentLevelTasks.length === 0) return null;

        return (
            <div className={`space-y-2 ${depth > 0 ? 'mt-2' : ''}`}>
                {currentLevelTasks.map(task => (
                    <TaskItem
                        key={task.id}
                        task={task}
                        depth={depth}
                        allTasks={tasks}
                        onToggle={() => toggleTaskStatus(task)}
                        onDelete={() => handleDeleteTask(task.id)}
                        expanded={expandedTasks[task.id]}
                        onToggleExpand={() => toggleExpand(task.id)}
                        onUpdateDependencies={(newDeps) => updateDependencies(task.id, newDeps)}
                        onAddSubtask={async (title) => {
                            try {
                                const newTask = {
                                    id: `task-${Date.now()}`,
                                    projectId,
                                    title: title,
                                    status: 'todo',
                                    parentId: task.id,
                                    blockedBy: [],
                                    order: 999,
                                    createdAt: new Date()
                                };
                                await db.tasks.add(newTask);
                                setExpandedTasks(prev => ({ ...prev, [task.id]: true }));
                                toast.success('Sous-tâche ajoutée');
                                loadTasks();
                            } catch (e) {
                                toast.error('Erreur');
                            }
                        }}
                    >
                        {/* Recursive Children Render */}
                        {expandedTasks[task.id] && renderTaskTree(task.id, depth + 1)}
                    </TaskItem>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header & Progress */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <h3 className="text-lg font-bold">Progression des tâches</h3>
                        <p className="text-sm text-foreground/60">{completedTasks} / {totalTasks} terminées</p>
                    </div>
                    <span className="text-2xl font-bold text-primary">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* Add Root Task */}
            <div className="flex gap-2">
                <Input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Nouvelle tâche principale..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask(null)}
                    className="bg-background/50"
                />
                <Button onClick={() => handleAddTask(null)}>
                    <Plus className="w-5 h-5" />
                </Button>
            </div>

            {/* Task Tree */}
            <div className="space-y-2">
                {renderTaskTree(null, 0)}

                {tasks.length === 0 && (
                    <div className="text-center py-10 text-foreground/30 italic">
                        Aucune tâche. Commencez par en ajouter une !
                    </div>
                )}
            </div>
        </div>
    );
};

const TaskItem = ({ task, depth, allTasks, onToggle, onDelete, expanded, onToggleExpand, onAddSubtask, onUpdateDependencies, children }) => {
    const [isAddingSub, setIsAddingSub] = useState(false);
    const [subTaskTitle, setSubTaskTitle] = useState('');
    const [isDependencyDialogOpen, setIsDependencyDialogOpen] = useState(false);

    const handleAddSub = () => {
        if (!subTaskTitle.trim()) return;
        onAddSubtask(subTaskTitle);
        setSubTaskTitle('');
        setIsAddingSub(false);
    };

    const completed = task.status === 'completed';
    // Count direct children for info badge
    const directChildren = allTasks.filter(t => t.parentId === task.id);
    const completedChildren = directChildren.filter(t => t.status === 'completed');
    const hasChildren = directChildren.length > 0;

    // Limit nesting depth visual if desired, but 3 levels (0, 1, 2) is fine.
    // If depth is 2, prevent adding more subtasks if we want strict 3-level limit.
    const maxDepth = 2; // Level 0, 1, 2 = 3 levels
    const canAddSubtasks = depth < maxDepth;

    // Dependency check
    const blockingTasks = allTasks.filter(t => task.blockedBy?.includes(t.id) && t.status !== 'completed');
    const isBlocked = blockingTasks.length > 0;
    const completedDependencies = allTasks.filter(t => task.blockedBy?.includes(t.id) && t.status === 'completed');

    return (
        <div
            className={`
                rounded-lg border transition-all 
                ${completed ? 'bg-white/5 border-transparent opacity-60' : 'bg-card border-white/10'}
                ${depth > 0 ? 'ml-0 border-l-2 border-l-primary/20' : ''}
                ${isBlocked ? 'bg-red-500/5 border-red-500/20' : ''}
            `}
            style={{ marginLeft: depth > 0 ? `${depth * 1.5}rem` : 0 }}
        >
            <div className="p-3 flex items-center gap-3">
                {/* Checkbox */}
                <button
                    onClick={onToggle}
                    disabled={isBlocked}
                    className={`flex-shrink-0 transition-colors ${completed ? 'text-primary' : isBlocked ? 'text-destructive/50 cursor-not-allowed' : 'text-foreground/30 hover:text-primary'}`}
                >
                    {completed ? <CheckCircle2 className="w-5 h-5" /> : isBlocked ? <Lock className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </button>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center overflow-hidden">
                    <div className="flex items-center gap-2">
                        <span className={`font-medium truncate ${completed ? 'line-through text-foreground/50' : ''}`}>
                            {task.title}
                        </span>
                        {hasChildren && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/10 text-secondary-foreground border border-secondary/20 flex-shrink-0">
                                {completedChildren.length}/{directChildren.length}
                            </span>
                        )}
                        {task.blockedBy?.length > 0 && (
                            <div className="flex -space-x-1">
                                {isBlocked ? (
                                    <Badge variant="destructive" className="h-5 px-1.5 text-[10px] gap-1">
                                        <Lock className="w-3 h-3" /> Bloqué
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="h-5 px-1.5 text-[10px] gap-1 border-green-500/30 text-green-500">
                                        <LinkIcon className="w-3 h-3" /> Prêt
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 items-center">
                    {canAddSubtasks && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/50 hover:text-primary" onClick={() => setIsAddingSub(!isAddingSub)} title="Ajouter sous-tâche">
                            <Plus className="w-4 h-4" />
                        </Button>
                    )}

                    {(hasChildren || canAddSubtasks) && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 text-foreground/50 ${hasChildren ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
                            onClick={onToggleExpand}
                        >
                            <div className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/50">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setIsDependencyDialogOpen(true)}>
                                <LinkIcon className="w-4 h-4 mr-2" /> Gérer dépendances
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Sub-tasks container */}
            {expanded && (
                <div className="pb-2">
                    {/* Render Children (Recursive) */}
                    {children}

                    {/* Input for new sub-task */}
                    {isAddingSub && (
                        <div className="flex gap-2 items-center mt-2 px-3 pl-8 animate-in slide-in-from-top-2" style={{ marginLeft: `${(depth + 1) * 0.5}rem` }}>
                            <CornerDownRight className="w-4 h-4 text-foreground/30" />
                            <Input
                                autoFocus
                                value={subTaskTitle}
                                onChange={e => setSubTaskTitle(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddSub()}
                                placeholder="Nouvelle sous-tâche..."
                                className="h-8 text-sm bg-background/50"
                            />
                            <Button size="sm" onClick={handleAddSub}>OK</Button>
                        </div>
                    )}
                </div>
            )}

            <Dialog open={isDependencyDialogOpen} onOpenChange={setIsDependencyDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Gérer les dépendances pour "{task.title}"</DialogTitle>
                    </DialogHeader>
                    <DependencySelector
                        task={task}
                        allTasks={allTasks}
                        onSave={(newDeps) => {
                            onUpdateDependencies(newDeps);
                            setIsDependencyDialogOpen(false);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

const DependencySelector = ({ task, allTasks, onSave }) => {
    // Candidates are all tasks except self and own descendants (to prevent cycles if we want to be strict, but simple cycle check is ID)
    // Simple cycle prevention: Don't allow selecting self.
    // Ideally we should also prevent selecting a task that depends on THIS task (cycle), but for MVP just filter self.

    // Better candidates filter:
    // 1. Not self
    // 2. Not a direct descendant (optional, but logical)

    const [selectedIds, setSelectedIds] = useState(task.blockedBy || []);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleSelection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const candidates = allTasks.filter(t => t.id !== task.id);
    const filteredCandidates = candidates.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-4">
            <Input
                placeholder="Rechercher une tâche..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            <div className="max-h-[300px] overflow-y-auto space-y-1 p-1">
                {filteredCandidates.map(t => (
                    <div
                        key={t.id}
                        onClick={() => toggleSelection(t.id)}
                        className={`p-2 rounded cursor-pointer flex items-center justify-between border ${selectedIds.includes(t.id) ? 'bg-primary/20 border-primary' : 'bg-card border-border hover:bg-accent'}`}
                    >
                        <div className="flex items-center gap-2">
                            {t.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-foreground/30" />}
                            <span className="text-sm">{t.title}</span>
                        </div>
                        {selectedIds.includes(t.id) && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </div>
                ))}
                {filteredCandidates.length === 0 && <p className="text-center text-muted-foreground my-4">Aucune tâche trouvée</p>}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button variant="outline" onClick={() => onSave(task.blockedBy || [])}>Annuler</Button>
                <Button onClick={() => onSave(selectedIds)}>Enregistrer</Button>
            </div>
        </div>
    );
};

export default ProjectTasks;
