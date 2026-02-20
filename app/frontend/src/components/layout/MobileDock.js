import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Sword,
    CheckCircle2,
    Calendar,
    StickyNote
} from 'lucide-react';

const MobileDock = () => {
    const location = useLocation();

    const items = [
        { icon: LayoutDashboard, path: '/', label: 'Home' },
        { icon: CheckCircle2, path: '/habits', label: 'Habits' },
        { icon: Sword, path: '/quests', label: 'Quests' },
        { icon: Calendar, path: '/agenda', label: 'Agenda' },
        { icon: StickyNote, path: '/notes', label: 'Notes' }
    ];

    return (
        <div className="md:hidden fixed bottom-6 left-0 right-0 z-[100] flex justify-center px-6 pointer-events-none">
            <div className="glass-card flex items-center gap-1 p-2 bg-black/40 border-white/10 shadow-2xl rounded-full pointer-events-auto max-w-full overflow-hidden">
                {items.map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="relative flex items-center justify-center w-12 h-12"
                        >
                            {/* Sliding Background Capsule */}
                            {isActive && (
                                <motion.div
                                    layoutId="dock-active"
                                    className="absolute inset-0 bg-primary/20 rounded-full border border-primary/30"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}

                            <item.icon
                                className={`w-5 h-5 transition-colors duration-300 relative z-10 ${isActive ? 'text-primary' : 'text-muted-foreground'
                                    }`}
                            />

                            {/* Dot indicator */}
                            {isActive && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full z-10"
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileDock;
