import React from 'react';
import { format } from 'date-fns';
import { Clock, Target, Calendar } from 'lucide-react';

/**
 * Timeline event item for agenda/calendar display
 */
const TimelineEvent = ({ event }) => {
    const isDeadline = event.type === 'deadline';

    return (
        <div className="flex gap-4 items-start p-3 rounded-xl bg-background border border-border/40 hover:border-border transition-all group">
            {/* Indicator */}
            <div className={`w-1 h-full min-h-[40px] rounded-full shrink-0 ${isDeadline
                ? 'bg-red-400'
                : 'bg-primary/50'
                }`} />

            {/* Content */}
            <div className="flex-1 min-w-0 py-0.5">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
                            {event.title}
                        </h4>
                        {event.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {event.description}
                            </p>
                        )}
                    </div>

                    {/* Icon */}
                    {isDeadline ? (
                        <Target className="w-3.5 h-3.5 text-red-500 shrink-0 opacity-70" />
                    ) : (
                        <Calendar className="w-3.5 h-3.5 text-primary shrink-0 opacity-70" />
                    )}
                </div>

                {/* Time */}
                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">
                    <Clock className="w-3 h-3" />
                    <span>
                        {event.startTime || format(new Date(event.startDate), 'HH:mm')}
                    </span>
                    {event.endTime && (
                        <>
                            <span>→</span>
                            <span>{event.endTime}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TimelineEvent;
