import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const AiContext = createContext(null);

export const AiProvider = ({ children }) => {
    const { api, isAuthenticated } = useAuth();
    const [analyzing, setAnalyzing] = useState(false);

    const analyzeAction = async (context, voiceTranscript = null) => {
        if (!isAuthenticated) {
            toast.error("You must be logged in to use The Axiom Engine.");
            return null;
        }

        setAnalyzing(true);
        const toastId = toast.loading("Analysing consequences...");

        try {
            const payload = {
                context,
                user_voice_transcript: voiceTranscript
            };

            const response = await api.post('/ai/analyze', payload);

            toast.success("Analysis complete", { id: toastId });
            return response.data; // Should return DecisionResult structure

        } catch (error) {
            console.error("Axiom Analysis Error:", error);
            const msg = error.response?.data?.detail || "Analysis failed.";
            toast.error(msg, { id: toastId });
            return null;
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <AiContext.Provider value={{ analyzeAction, analyzing }}>
            {children}
        </AiContext.Provider>
    );
};

export const useAi = () => {
    const context = useContext(AiContext);
    if (!context) {
        throw new Error('useAi must be used within an AiProvider');
    }
    return context;
};
