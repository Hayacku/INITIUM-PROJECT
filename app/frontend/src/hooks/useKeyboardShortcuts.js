import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useKeyboardShortcuts = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Check for modifier keys (Cmd on Mac, Ctrl on Windows)
            const isModifier = e.metaKey || e.ctrlKey;

            if (!isModifier) return;

            switch (e.key.toLowerCase()) {
                case 'n':
                    e.preventDefault();
                    navigate('/quests?new=true'); // Assuming Quests page handles query param or just navigate there
                    toast.info("Nouvelle quête (Raccourci)");
                    break;
                case 'h':
                    e.preventDefault();
                    navigate('/habits?new=true');
                    toast.info("Nouvelle habitude (Raccourci)");
                    break;
                // Add more shortcuts here
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);
};
