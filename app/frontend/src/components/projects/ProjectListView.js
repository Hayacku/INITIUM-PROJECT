import React from 'react';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MoreVertical, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';

const ProjectListView = ({ projects, categories, onSelect, onDelete }) => {
    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-bold">Projet</th>
                        <th className="px-6 py-4 font-bold text-center">Catégorie</th>
                        <th className="px-6 py-4 font-bold text-center">Priorité</th>
                        <th className="px-6 py-4 font-bold">Progression</th>
                        <th className="px-6 py-4 font-bold">Début</th>
                        <th className="px-6 py-4 font-bold">Échéance</th>
                        <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {projects.map(project => {
                        const category = categories.find(c => c.id === project.category) || categories[4];
                        return (
                            <tr key={project.id} className="hover:bg-accent/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer" onClick={() => onSelect(project)}>
                                            {project.title}
                                        </span>
                                        <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                                            {project.description || 'Sans description'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <Badge variant="outline" className={`${category.color} border-none`}>
                                        {category.label}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <Badge variant={project.priority === 'high' ? 'destructive' : project.priority === 'medium' ? 'default' : 'secondary'}>
                                        {project.priority === 'high' ? 'Haute' : project.priority === 'medium' ? 'Moyenne' : 'Basse'}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3 min-w-[120px]">
                                        <Progress value={project.progress || 0} className="h-1.5" />
                                        <span className="text-xs font-mono w-8">{project.progress || 0}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs text-muted-foreground font-mono">
                                        {project.startDate ? format(new Date(project.startDate), 'dd MMM yyyy', { locale: fr }) : '-'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs text-muted-foreground font-mono">
                                        {project.targetDate ? format(new Date(project.targetDate), 'dd MMM yyyy', { locale: fr }) : '-'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => onSelect(project)}>
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(project.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {projects.length === 0 && (
                <div className="p-12 text-center text-muted-foreground italic">
                    Aucun projet à afficher.
                </div>
            )}
        </div>
    );
};

export default ProjectListView;
