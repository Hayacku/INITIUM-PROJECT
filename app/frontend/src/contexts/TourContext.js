import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TourContext = createContext();

export const useTour = () => useContext(TourContext);

export const TourProvider = ({ children }) => {
    const [isActive, setIsActive] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();

    // SCÉNARIO COMPLET
    const steps = [
        // --- DASHBOARD ---
        {
            targetId: 'dashboard-title',
            title: 'Bienvenue sur INITIUM 🚀',
            content: 'Voici votre tableau de bord. Il centralise votre progression globale : niveau, XP et état d\'esprit du moment.',
            path: '/'
        },
        {
            targetId: 'stats-grid',
            title: 'Vos Signaux Vitaux',
            content: 'Gardez un œil sur vos métriques clés : Quêtes en cours, Série d\'habitudes (Streak), et XP du jour. C\'est votre pouls de productivité.',
            path: '/'
        },
        {
            targetId: 'active-projects-widget', // ID à ajouter ou utiliser existant
            title: 'Projets Actifs',
            content: 'Accédez rapidement aux projets sur lesquels vous travaillez. La barre de progression vous indique où vous en êtes.',
            path: '/'
        },

        // --- PROJETS ---
        {
            targetId: 'nav-projects',
            title: 'Navigation : Projets',
            content: 'Allons voir vos Projets. C\'est la structure de base de votre organisation.',
            path: '/'
        },
        {
            targetId: 'projects-title', // ID à ajouter
            title: 'Vue Projets',
            content: 'Ici, vous définissez vos grandes ambitions (ex: "Apprendre le Japonais", "Lancer mon Business"). Chaque projet regroupe quêtes, notes et tâches.',
            path: '/projects'
        },
        {
            targetId: 'new-project-btn', // ID à ajouter
            title: 'Créer un Projet',
            content: 'Commencez par créer un projet pour structurer vos idées. Vous pourrez ensuite y lier tout le reste.',
            path: '/projects'
        },

        // --- QUÊTES ---
        {
            targetId: 'nav-quests',
            title: 'Quêtes & Tâches',
            content: 'Passons à l\'action avec les Quêtes.',
            path: '/projects'
        },
        {
            targetId: 'quests-title', // ID à ajouter
            title: 'Tableau des Quêtes',
            content: 'Une quête est une mission concrète avec un début, une fin, et de l\'XP à la clé.',
            path: '/quests'
        },
        {
            targetId: 'create-quest-btn', // ID à ajouter
            title: 'Nouvelle Quête',
            content: 'Créez une quête, définissez une date limite et une priorité. Découpez-la en "Étapes" pour ne rien oublier.',
            path: '/quests'
        },

        // --- HABITUDES ---
        {
            targetId: 'nav-habits',
            title: 'Habitudes',
            content: 'La régularité est la clé du succès. Allons voir vos habitudes.',
            path: '/quests'
        },
        {
            targetId: 'habits-title', // ID à ajouter
            title: 'Suivi d\'Habitudes',
            content: 'Définissez des rituels (Quotidien, Hebdo). Chaque réalisation maintient votre "Streak" (Série) et booste votre XP.',
            path: '/habits'
        },

        // --- TRAINING ---
        {
            targetId: 'nav-training',
            title: 'Entraînement 2.0',
            content: 'Un esprit sain dans un corps sain.',
            path: '/habits'
        },
        {
            targetId: 'training-title', // ID à ajouter
            title: 'Votre Salle de Sport',
            content: 'Planifiez vos séances ou enregistrez celles terminées. Vous pouvez lier des Notes (ex: performances) à chaque séance.',
            path: '/training'
        },

        // --- NOTES ---
        {
            targetId: 'nav-notes',
            title: 'Notes & Connaissances',
            content: 'Capturez vos idées et vos apprentissages.',
            path: '/training'
        },
        {
            targetId: 'notes-title', // ID à ajouter
            title: 'Base de Connaissances',
            content: 'Rédigez en Markdown. Le point fort : vous pouvez lier une note à un Projet, une Quête ou un Entraînement.',
            path: '/notes'
        },

        // --- AGENDA ---
        {
            targetId: 'nav-agenda',
            title: 'Agenda Unifié',
            content: 'Une vue d\'ensemble de votre temps.',
            path: '/notes'
        },
        {
            targetId: 'agenda-title', // ID à ajouter
            title: 'Tout en un',
            content: 'Cet agenda fusionne vos Événements, vos Deadlines de Quêtes et vos Séances de sport planifiées.',
            path: '/agenda'
        },

        // --- POMODORO ---
        {
            targetId: 'nav-pomodoro',
            title: 'Focus Station',
            content: 'Besoin de concentration maximale ?',
            path: '/agenda'
        },
        {
            targetId: 'pomodoro-timer', // ID à ajouter (Card)
            title: 'Pomodoro & Spotify',
            content: 'Lancez un timer, connectez votre compte Spotify, et travaillez en musique sans distractions.',
            path: '/pomodoro'
        },

        // --- FIN ---
        {
            targetId: 'nav-help',
            title: 'Centre d\'Aide',
            content: 'Retrouvez ce guide, les mentions légales ou contactez-nous via le menu Aide. À vous de jouer ! 🌟',
            path: '/help'
        }
    ];

    const startTour = () => {
        setIsActive(true);
        setCurrentStepIndex(0);
        navigate('/');
    };

    const stopTour = () => {
        setIsActive(false);
        setCurrentStepIndex(0);
    };

    const nextStep = () => {
        if (currentStepIndex < steps.length - 1) {
            const nextIdx = currentStepIndex + 1;
            const nextStepData = steps[nextIdx];

            if (nextStepData.path && location.pathname !== nextStepData.path) {
                navigate(nextStepData.path);
            }
            setCurrentStepIndex(nextIdx);
        } else {
            stopTour();
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            const prevIdx = currentStepIndex - 1;
            const prevStepData = steps[prevIdx];
            if (prevStepData.path && location.pathname !== prevStepData.path) {
                navigate(prevStepData.path);
            }
            setCurrentStepIndex(prevIdx);
        }
    };

    return (
        <TourContext.Provider value={{ isActive, currentStepIndex, steps, startTour, stopTour, nextStep, prevStep }}>
            {children}
            {isActive && <TourOverlay />}
        </TourContext.Provider>
    );
};

const TourOverlay = () => {
    const { steps, currentStepIndex, nextStep, stopTour, prevStep } = useTour();
    const step = steps[currentStepIndex];
    const [position, setPosition] = useState(null);

    useEffect(() => {
        const updatePosition = () => {
            const element = document.querySelector(`[data-testid="${step.targetId}"]`);

            if (element) {
                const rect = element.getBoundingClientRect();
                setPosition({
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    height: rect.height
                });
                element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            } else {
                // En cas d'absence (ex: chargement ou mobile), on positionne au centre
                // On réessaie un peu plus tard cas où l'élément apparaitrait (anim)
                setPosition(null);
            }
        };

        // On lance plusieurs updates pour gérer les animations de transition de page
        updatePosition();
        const t1 = setTimeout(updatePosition, 300);
        const t2 = setTimeout(updatePosition, 800);

        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('resize', updatePosition);
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [step, currentStepIndex]); // Dépend de l'étape courante

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-black/60 pointer-events-auto transition-opacity duration-300" />

            {position && (
                <div
                    className="absolute z-[101] border-2 border-primary box-content rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] pointer-events-none transition-all duration-500 ease-in-out"
                    style={{
                        top: position.top - 5,
                        left: position.left - 5,
                        width: position.width + 10,
                        height: position.height + 10
                    }}
                >
                    <span className="absolute inset-0 rounded-lg animate-ping border border-primary opacity-30"></span>
                </div>
            )}

            <div
                className="absolute z-[102] pointer-events-auto bg-[#1a1a1a] text-white p-6 rounded-xl shadow-2xl border border-primary/30 max-w-[90%] md:max-w-md w-full animate-in zoom-in-95 fade-in slide-in-from-bottom-5 duration-300"
                style={{
                    top: position ? (position.top + position.height + 20 > window.innerHeight - 250 ? Math.max(20, position.top - 250) : position.top + position.height + 20) : '50%',
                    left: position ? (position.left > window.innerWidth - 450 ? window.innerWidth - 470 : position.left) : '50%',
                    transform: position ? 'none' : 'translate(-50%, -50%)'
                }}
            >
                <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
                    <h3 className="text-lg font-bold text-primary flex items-center gap-2">{step.title}</h3>
                    <span className="text-xs bg-white/10 px-2 py-1 rounded-full font-mono text-muted-foreground">{currentStepIndex + 1} / {steps.length}</span>
                </div>
                <p className="text-sm text-gray-300 mb-6 leading-relaxed font-light">{step.content}</p>

                <div className="flex justify-between items-center">
                    <button onClick={stopTour} className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-wider font-bold">
                        Passer
                    </button>
                    <div className="flex gap-2">
                        {currentStepIndex > 0 && (
                            <button onClick={prevStep} className="px-3 py-1.5 text-sm font-medium hover:bg-white/5 rounded transition-colors">
                                Précédent
                            </button>
                        )}
                        <button
                            onClick={nextStep}
                            className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                        >
                            {currentStepIndex === steps.length - 1 ? 'Terminer !' : 'Suivant'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
