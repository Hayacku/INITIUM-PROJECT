import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RefreshCw, CheckCircle, PhoneOff } from 'lucide-react';
import { Button } from './ui/button';
// import { triggerSchoolPride } from '../lib/confetti';

const FocusMode = ({ isOpen, onClose, taskTitle = "Session de Concentration" }) => {
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('focus'); // 'focus' | 'break'

    // Disable body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            // Timer finished
            setIsActive(false);
            // triggerSchoolPride(); // Celebration removed
            // Play notification sound here
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-[#09090b] text-white flex flex-col items-center justify-center animate-in fade-in duration-300">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
                title="Quitter le mode Focus"
            >
                <X className="w-8 h-8 text-muted-foreground hover:text-white" />
            </button>

            {/* Content */}
            <div className="max-w-md w-full px-6 flex flex-col items-center text-center space-y-12">

                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-muted-foreground mb-4">
                        <PhoneOff className="w-4 h-4" />
                        <span>Mode Zen activé</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50">
                        {taskTitle}
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        {isActive ? "Concentration maximale..." : "Prêt à commencer ?"}
                    </p>
                </div>

                {/* Timer Display */}
                <div className="relative">
                    {/* Pulse Effect */}
                    {isActive && (
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
                    )}
                    <div className="text-[6rem] md:text-[8rem] font-black font-mono tracking-tighter tabular-nums leading-none select-none text-white drop-shadow-2xl">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 border-0"
                        onClick={resetTimer}
                    >
                        <RefreshCw className="w-6 h-6" />
                    </Button>

                    <Button
                        size="icon"
                        className={`w-24 h-24 rounded-full shadow-2xl transition-all duration-300 ${isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-primary hover:bg-primary/90'}`}
                        onClick={toggleTimer}
                    >
                        {isActive ? (
                            <Pause className="w-10 h-10 fill-current" />
                        ) : (
                            <Play className="w-10 h-10 fill-current ml-1" />
                        )}
                    </Button>

                    <Button
                        size="icon"
                        variant="secondary"
                        className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 border-0"
                        onClick={() => {
                            // Finish early logic or switch mode
                            setIsActive(false);
                            onClose();
                        }}
                    >
                        <CheckCircle className="w-6 h-6" />
                    </Button>
                </div>
            </div>

            {/* Ambient Footer */}
            <div className="absolute bottom-8 text-white/20 text-sm font-medium">
                INITIUM FOCUS OS
            </div>
        </div>
    );
};

export default FocusMode;
