import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, Cookie, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            // Délai pour ne pas agresser l'utilisateur immédiatement
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie_consent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom-full duration-500">
            <div className="max-w-4xl mx-auto glass-card bg-black/80 backdrop-blur-xl border-primary/20 p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row items-start md:items-center gap-6">

                <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                    <Cookie className="w-8 h-8 text-primary" />
                </div>

                <div className="flex-1 space-y-2">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        Gestion des Cookies & Confidentialité
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Nous utilisons des cookies essentiels pour sécuriser votre session et mémoriser vos préférences (thème, langue).
                        Avec votre accord, nous utilisons également des cookies d'analyse pour améliorer INITIUM.
                        <br />
                        <Link to="/help" className="text-primary hover:underline mt-1 inline-block">En savoir plus sur notre Politique de Confidentialité.</Link>
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                    <Button variant="ghost" onClick={handleDecline} className="text-muted-foreground hover:text-white">
                        Refuser
                    </Button>
                    <Button onClick={handleAccept} className="bg-primary hover:bg-primary/90 text-white min-w-[120px] shadow-lg shadow-primary/20">
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Accepter
                    </Button>
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-2 right-2 p-2 text-muted-foreground hover:text-white md:hidden"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default CookieConsent;
