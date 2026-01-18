import React from 'react';
import { Card, CardContent } from '../ui/card';

/**
 * Modern stat card component for dashboard
 * Professional design with optional icon, trend indicator, and progress bar
 */
const StatCard = ({
    label,
    value,
    subtitle,
    icon: Icon,
    trend,
    progress,
    variant = 'default',
    className = ''
}) => {
    const variants = {
        default: "from-blue-600 to-blue-400 text-white shadow-blue-500/20",
        warning: "from-orange-500 to-amber-400 text-white shadow-orange-500/20",
        success: "from-emerald-500 to-emerald-400 text-white shadow-emerald-500/20",
        info: "from-violet-600 to-purple-500 text-white shadow-purple-500/20",
        secondary: "from-pink-600 to-rose-400 text-white shadow-pink-500/20",
    };

    return (
        <div className={`
            relative overflow-hidden rounded-2xl p-4 transition-all duration-200
            bg-[#18181b] border border-white/5 hover:border-white/10
            group hover:translate-y-[-2px] hover:shadow-lg ${className}
        `}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        {label}
                    </p>
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                        {value}
                    </h3>
                    <p className="text-xs text-white/60 mt-1 font-medium">
                        {subtitle}
                    </p>
                </div>

                {Icon && (
                    <div className={`
                        p-3 rounded-xl bg-gradient-to-br shadow-lg ${variants[variant] || variants.default}
                        transform transition-transform group-hover:scale-110 group-hover:rotate-3
                    `}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                )}
            </div>

            {/* Progress Bar for XP (Clash Royale style) */}
            {typeof progress === 'number' && (
                <div className="mt-4">
                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                            style={{ width: `${Math.min(100, progress)}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatCard;
