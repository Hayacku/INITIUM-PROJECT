import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';

const ProjectCard = ({ project, compact = false }) => {
    if (compact) {
        return (
            <div className="group rounded-xl border border-border/50 bg-card p-4 hover:bg-accent/50 transition-colors">
                <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                        {project.title}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono bg-secondary px-1.5 py-0.5 rounded">
                        {Math.round(project.progress || 0)}%
                    </span>
                </div>
                <Progress
                    value={project.progress || 0}
                    className="h-1.5 bg-secondary"
                    indicatorClassName="bg-primary/80"
                />
            </div>
        );
    }

    return (
        <Link to={`/projects/${project.id}`}>
            <Card className="border border-border/50 bg-card hover:bg-accent/50 transition-all duration-300 group shadow-sm">
                <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {project.title}
                            </h4>
                            {project.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                                    {project.description}
                                </p>
                            )}
                        </div>
                        <div className="bg-secondary p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all" />
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs items-end">
                            <span className="text-muted-foreground font-medium">Progression</span>
                            <span className="text-primary font-bold">
                                {Math.round(project.progress || 0)}%
                            </span>
                        </div>
                        <Progress
                            value={project.progress || 0}
                            className="h-2 bg-secondary"
                            indicatorClassName="bg-primary"
                        />
                    </div>

                    {/* Metadata */}
                    {project.deadline && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                                Échéance: {new Date(project.deadline).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
};

export default ProjectCard;
