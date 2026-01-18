import React, { useState } from 'react';
import { Plus, Target, CheckSquare, Dumbbell, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

const QuickActionFab = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const actions = [
        { icon: Target, label: 'Quête', path: '/quests', color: 'bg-primary' },
        { icon: Dumbbell, label: 'Habitude', path: '/habits', color: 'bg-orange-500' },
        { icon: CheckSquare, label: 'Tâche', path: '/tasks', color: 'bg-green-500' },
        { icon: FileText, label: 'Note', path: '/notes', color: 'bg-blue-500' },
    ];

    return (
        <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end space-y-3 lg:bottom-8 lg:right-8">
            {/* Action Buttons */}
            {isOpen && (
                <div className="flex flex-col items-end space-y-3 animate-slide-in-up">
                    {actions.map((action, index) => (
                        <div key={index} className="flex items-center gap-2 group">
                            <span className="text-xs font-medium bg-background/80 backdrop-blur px-2 py-1 rounded-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                {action.label}
                            </span>
                            <Button
                                size="icon"
                                className={`rounded-full w-10 h-10 shadow-lg ${action.color} hover:opacity-90 transition-transform hover:scale-110`}
                                onClick={() => {
                                    navigate(action.path);
                                    setIsOpen(false);
                                }}
                            >
                                <action.icon className="w-5 h-5 text-white" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Main Toggle Button */}
            <Button
                size="icon"
                className={`rounded-full w-14 h-14 shadow-xl bg-gradient-to-br from-primary to-accent transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Plus className="w-8 h-8 text-white" />
            </Button>
        </div>
    );
};

export default QuickActionFab;
