import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Target, TrendingUp, BarChart3, ChevronRight, Check, Sparkles } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

/**
 * Immersive Welcome Screen / Onboarding
 * Replaces the traditional "Tour" with a visual storytelling modal
 */
const WelcomeExperience = () => {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);
    const { user } = useApp();

    useEffect(() => {
        // Show only if user is new or hasn't seen the welcome (using local storage for now)
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcomeV2');
        if (!hasSeenWelcome) {
            setOpen(true);
        }
    }, []);

    const handleComplete = () => {
        setOpen(false);
        localStorage.setItem('hasSeenWelcomeV2', 'true');
    };

    if (!open) return null;

    const steps = [
        {
            title: "Bienvenue dans INITIUM",
            subtitle: "Votre vie, gamifiée.",
            description: "Transformez vos objectifs en quêtes, vos routines en habitudes et suivez votre évolution comme dans un RPG.",
            icon: Sparkles,
            color: "from-violet-600 to-indigo-600"
        },
        {
            title: "Vos Quêtes (Objectifs)",
            subtitle: "Définissez votre cap.",
            description: "Structurez vos grands projets en missions concrètes. Chaque pas compte et vous rapporte de l'expérience.",
            icon: Target,
            color: "from-blue-600 to-cyan-500"
        },
        {
            title: "Vos Habitudes",
            subtitle: "La puissance de la régularité.",
            description: "Créez des routines solides. La répétition est la clé de la maîtrise. Suivez vos streaks et restez discipliné.",
            icon: TrendingUp,
            color: "from-emerald-500 to-green-500"
        },
        {
            title: "Vos Statistiques",
            subtitle: "Mesurez votre progression.",
            description: "Visualisez vos efforts. Gagnez des niveaux, débloquez des badges et analysez votre productivité.",
            icon: BarChart3,
            color: "from-orange-500 to-amber-500"
        }
    ];

    const currentStep = steps[step];
    const Icon = currentStep.icon;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg bg-[#09090b] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">

                {/* Visual Header */}
                <div className={`h-48 w-full bg-gradient-to-br ${currentStep.color} flex items-center justify-center relative overflow-hidden transition-colors duration-500`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10 p-4 rounded-full bg-white/10 backdrop-blur-sm shadow-xl">
                        <Icon className="w-16 h-16 text-white drop-shadow-md" strokeWidth={1.5} />
                    </div>
                    {/* Decorative Circles */}
                    <div className="absolute top-[-20%] left-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-40 h-40 bg-black/20 rounded-full blur-3xl"></div>
                </div>

                {/* Content */}
                <div className="p-8 text-center space-y-4">
                    <h2 className="text-2xl font-bold text-white tracking-tight">{currentStep.title}</h2>
                    <p className="text-lg font-medium text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        {currentStep.subtitle}
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                        {currentStep.description}
                    </p>
                </div>

                {/* Footer / Controls */}
                <div className="p-6 pt-0 flex flex-col gap-4">
                    {/* Progress Dots */}
                    <div className="flex justify-center gap-2 mb-2">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-primary' : 'w-1.5 bg-white/10'}`}
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {step > 0 ? (
                            <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="w-full">
                                Retour
                            </Button>
                        ) : (
                            <Button variant="ghost" onClick={handleComplete} className="w-full text-muted-foreground">
                                Passer
                            </Button>
                        )}

                        <Button
                            onClick={() => {
                                if (step < steps.length - 1) {
                                    setStep(s => s + 1);
                                } else {
                                    handleComplete();
                                }
                            }}
                            className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                        >
                            {step < steps.length - 1 ? (
                                <span className="flex items-center">Suivant <ChevronRight className="w-4 h-4 ml-1" /></span>
                            ) : (
                                <span className="flex items-center">Commencer <Check className="w-4 h-4 ml-1" /></span>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeExperience;
