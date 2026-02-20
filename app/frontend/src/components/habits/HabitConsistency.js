import React from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';

const HabitConsistency = ({ completions = [] }) => {
    // Show last 4 weeks consistency? Or just current week?
    // Let's show last 7 days + current week trend?
    // Let's do a simple bar chart of the last 14 days.

    const today = new Date();
    const startDate = subWeeks(today, 2);
    const days = eachDayOfInterval({ start: startDate, end: today });

    const data = days.map(day => {
        const count = completions.filter(c => isSameDay(new Date(c), day)).length;
        return {
            date: day,
            count,
            dayName: format(day, 'EEEEE', { locale: fr }), // T, F, S...
            fullDate: format(day, 'd MMM', { locale: fr })
        };
    });

    const maxCount = Math.max(...data.map(d => d.count), 1); // Avoid div by 0

    return (
        <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Consistance (14 jours)</h4>
            <div className="flex items-end justify-between gap-1 h-20 w-full">
                {data.map((d, i) => (
                    <div key={i} className="flex flex-col items-center justify-end h-full gap-1 flex-1 group relative">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {d.count} fois - {d.fullDate}
                        </div>

                        <div
                            className={`w-full rounded-t-sm transition-all duration-500 ${d.count > 0 ? 'bg-primary' : 'bg-muted/30'}`}
                            style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: '4px' }}
                        />
                        <span className={`text-[10px] ${isSameDay(d.date, today) ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                            {d.dayName}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HabitConsistency;
