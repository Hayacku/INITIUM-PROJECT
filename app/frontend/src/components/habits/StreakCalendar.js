import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle2, XCircle } from 'lucide-react';

const StreakCalendar = ({ completions = [], streak = 0 }) => {
    const today = new Date();
    const currentMonth = today; // Show current month
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    // Adjust grid start
    const startDay = getDay(start); // 0 = Sun
    const offset = startDay === 0 ? 6 : startDay - 1;

    return (
        <div className="bg-card/50 rounded-lg p-4 border border-border/50">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">{format(currentMonth, 'MMMM yyyy', { locale: fr })}</h4>
                <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-mono">
                    Série : {streak} 🔥
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => (
                    <div key={d} className="text-[10px] text-muted-foreground">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: offset }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {days.map(day => {
                    const isCompleted = completions.some(c => isSameDay(new Date(c), day));
                    const isFuture = day > today;
                    const isToday = isSameDay(day, today);

                    return (
                        <div
                            key={day.toISOString()}
                            className={`aspect-square rounded-md flex items-center justify-center text-xs relative
                                ${isCompleted ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                                    isToday ? 'bg-primary/20 text-primary border border-primary/50' :
                                        isFuture ? 'text-muted-foreground/30' : 'bg-muted/30 text-muted-foreground'}
                            `}
                        >
                            {format(day, 'd')}
                            {isCompleted && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 opacity-50" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StreakCalendar;
