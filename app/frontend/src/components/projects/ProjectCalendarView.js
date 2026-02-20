import React, { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const ProjectCalendarView = ({ projects, categories, onSelect }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-2xl font-bold capitalize">
                    {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                </h2>
                <div className="flex gap-1">
                    <Button variant="outline" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
                        Aujourd'hui
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const dateFormat = "EEEE";
        const dayLabels = [];
        let start = startOfWeek(currentMonth, { weekStartsOn: 1 });

        for (let i = 0; i < 7; i++) {
            dayLabels.push(
                <div key={i} className="text-center text-xs font-bold text-muted-foreground uppercase tracking-wider py-2">
                    {format(addMonths(start, 0), dateFormat, { locale: fr }).substring(0, 3)}
                </div>
            );
            start = addMonths(start, 0); // Not used properly here but we just want the 7 days labels
        }

        // Manual labels for simplicity
        const labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        return <div className="grid grid-cols-7 border-b border-border">{labels.map(l => (
            <div key={l} className="text-center text-[10px] font-bold text-muted-foreground uppercase py-2 bg-muted/30">
                {l}
            </div>
        ))}</div>;
    };

    const renderCells = () => {
        const rows = [];
        let dayCells = [];

        days.forEach((day, i) => {
            const formattedDate = format(day, "d");
            const dayProjects = projects.filter(p => p.targetDate && isSameDay(new Date(p.targetDate), day));

            dayCells.push(
                <div
                    key={day.toString()}
                    className={`
                        min-h-[120px] border-r border-b border-border p-2 transition-colors
                        ${!isSameMonth(day, monthStart) ? 'bg-muted/10 opacity-30' : 'bg-card'}
                        ${isSameDay(day, new Date()) ? 'bg-primary/5' : ''}
                    `}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className={`
                            text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
                            ${isSameDay(day, new Date()) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}
                        `}>
                            {formattedDate}
                        </span>
                    </div>
                    <div className="space-y-1">
                        {dayProjects.map(project => {
                            const category = categories.find(c => c.id === project.category) || categories[4];
                            return (
                                <div
                                    key={project.id}
                                    onClick={() => onSelect(project)}
                                    className={`
                                        text-[10px] p-1.5 rounded border border-l-4 cursor-pointer truncate
                                        bg-background/80 hover:bg-accent hover:border-primary/50 transition-all
                                        ${category.color.split(' ')[0]}
                                    `}
                                    title={project.title}
                                    style={{ borderLeftColor: category.color.split(' ')[1].replace('text-', '') }}
                                >
                                    {project.title}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );

            if ((i + 1) % 7 === 0) {
                rows.push(
                    <div className="grid grid-cols-7" key={day.toString() + '-row'}>
                        {dayCells}
                    </div>
                );
                dayCells = [];
            }
        });

        return <div className="border-l border-t border-border rounded-lg overflow-hidden">{rows}</div>;
    };

    return (
        <div className="animate-in fade-in duration-300">
            {renderHeader()}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                {renderDays()}
                {renderCells()}
            </div>
        </div>
    );
};

export default ProjectCalendarView;
