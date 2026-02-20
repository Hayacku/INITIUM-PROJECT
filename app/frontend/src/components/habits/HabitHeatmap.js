import React from 'react';
import { ActivityCalendar } from 'react-activity-calendar';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const HabitHeatmap = ({ completions = [] }) => {
    // completions is an array of ISO date strings or Date objects
    // We need to transform it into the format expected by react-activity-calendar
    // Array<{ date: string, count: number, level: number }>

    // Generate data for the last 365 days (or less if we want compact)
    // Let's do last 6 months for compactness? Or 1 year.
    // The component handles empty days automatically if we provide start/end but usually it expects a full year or we just pass the data we have.
    // Actually react-activity-calendar fills in the gaps if we give it a date range, but usually we just give it the days with activity.

    // 1. Initialize last 365 days with 0
    const today = new Date();
    const counts = {};
    for (let i = 0; i < 365; i++) {
        const d = subDays(today, i);
        counts[format(d, 'yyyy-MM-dd')] = 0;
    }

    // 2. Aggregate actual counts
    completions.forEach(date => {
        const dateStr = format(new Date(date), 'yyyy-MM-dd');
        // Only count if within last year
        if (counts.hasOwnProperty(dateStr)) {
            counts[dateStr] = (counts[dateStr] || 0) + 1;
        }
    });

    // 3. Convert to array (sorted by date)
    const data = Object.entries(counts)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, count]) => ({
            date,
            count,
            level: Math.min(count, 4) // Level 0-4
        }));

    return (
        <div className="w-full overflow-x-auto pb-2">
            <ActivityCalendar
                data={data}
                theme={{
                    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                }}
                labels={{
                    months: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
                    weekdays: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
                    totalCount: '{{count}} jours complétés cette année',
                    legend: {
                        less: 'Moins',
                        more: 'Plus',
                    },
                }}
                renderBlock={(block, activity) => (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                {block}
                            </TooltipTrigger>
                            <TooltipContent>
                                {activity.count} réalisations le {activity.date}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                blockSize={10}
                blockMargin={4}
                fontSize={12}
                hideColorLegend={false}
                hideTotalCount={true}
            />
        </div>
    );
};

export default HabitHeatmap;
