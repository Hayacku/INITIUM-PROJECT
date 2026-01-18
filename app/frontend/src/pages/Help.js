import React, { useState } from 'react';
import { db } from '../lib/db';
import { useTour } from '../contexts/TourContext';
import {
    HelpCircle,
    MessageSquare,
    FileText,
    Shield,
    Play,
    Send,
    LifeBuoy,
    Scale
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

const Help = () => {
    const { startTour } = useTour();

    // Feedback States
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('suggestion');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const YEAR = new Date().getFullYear();

    // CONTENU JURIDIQUE DÉTAILLÉ
    const LEGAL_MENTIONS = `
  1. Éditeur du Service
  L'application INITIUM est éditée par l'équipe de développement INITIUM (Projet Open Source / Propriétaire).
  Siège social : [Adresse Physique de l'entreprise]
  Contact : legal@initium.app

  2. Hébergement
  Ce service est une Progressive Web App (PWA) fonctionnant principalement en local sur votre appareil.
  Les composants cloud sont hébergés par [Votre Hébergeur, ex: Vercel Inc.], situé aux États-Unis / Europe.

  3. Propriété Intellectuelle
  L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle.
  Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
  
  © ${YEAR} INITIUM. Tous droits réservés.
  `;

    const CGU_CONTENT = `
  CONDITIONS GÉNÉRALES D'UTILISATION (CGU)
  Dernière mise à jour : 01/01/2026

  ARTICLE 1 : OBJET
  Les présentes "conditions générales d'utilisation" ont pour objet l'encadrement juridique de l'utilisation de l'application INITIUM et de ses services. Ce contrat est conclu entre : Le gérant du site internet, ci-après désigné "l'Éditeur", et toute personne physique ou morale souhaitant accéder au site et à ses services, ci-après appelé "l'Utilisateur".

  ARTICLE 2 : ACCÈS AUX SERVICES
  L'Utilisateur de l'application INITIUM a accès aux services suivants :
  - Création et gestion de Quêtes et Projets
  - Suivi d'Habitudes
  - Prise de notes
  - Système de Gamification (XP, Niveaux)
  
  Tout Utilisateur ayant accès a internet peut accéder gratuitement et depuis n’importe où à l’application. Les frais supportés par l’Utilisateur pour y accéder (connexion internet, matériel informatique, etc.) ne sont pas à la charge de l’Éditeur.

  ARTICLE 3 : RESPONSABILITÉ DE L'UTILISATEUR
  L'Utilisateur est responsable des risques liés à l’utilisation de son identifiant de connexion et de son mot de passe. 
  L'Utilisateur assume l’entière responsabilité de l’utilisation qu’il fait des informations et contenus présents sur l’application INITIUM.

  ARTICLE 4 : RESPONSABILITÉ DE L'ÉDITEUR
  Tout dysfonctionnement du serveur ou du réseau ne peut engager la responsabilité de l’Éditeur. De même, la responsabilité du site ne peut être engagée en cas de force majeure ou du fait imprévisible et insurmontable d'un tiers.

  ARTICLE 5 : PROPRIÉTÉ INTELLECTUELLE
  Les contenus de l'application INITIUM (logos, textes, éléments graphiques, vidéos, etc.) sont protégés par le droit d'auteur, en vertu du Code de la propriété intellectuelle.
  `;

    const PRIVACY_CONTENT = `
  POLITIQUE DE CONFIDENTIALITÉ & COOKIES (RGPD)
  
  1. COLLECTE DES DONNÉES
  INITIUM adopte une approche "Local First". La majorité de vos données (quêtes, notes, habitudes) sont stockées exclusivement sur votre appareil via la technologie IndexedDB.
  
  Données collectées lors de la synchronisation (Optionnel) :
  - Adresse Email (authentification)
  - Nom d'utilisateur
  - Photo de profil (si OAuth utilisé)
  
  2. UTILISATION DES COOKIES
  Un "cookie" est un fichier de petite taille stocké par le site sur votre navigateur.
  
  Cookies Essentiels :
  Nécessaires au fonctionnement de l'application (maintien de la session, sécurité).
  
  Cookies de Préférence :
  Utilisés pour mémoriser vos choix (Mode Sombre/Clair, Bannière fermée).
  
  Cookies d'Analyse :
  Nous pouvons utiliser des outils anonymisés pour comprendre l'usage de l'application et l'améliorer. Vous avez la possibilité de refuser ces cookies via le panneau de configuration.

  3. VOS DROITS
  Conformément à la réglementation RGPD, vous disposez des droits suivants :
  - Droit d'accès et de rectification de vos données.
  - Droit à l'effacement (Droit à l'oubli).
  - Droit à la portabilité des données.
  
  Pour exercer ces droits, contactez-nous via le formulaire de feedback ou à privacy@initium.app.
  `;

    const handleSubmitFeedback = async () => {
        if (!subject.trim() || !message.trim()) {
            toast.error('Veuillez remplir le sujet et le message');
            return;
        }

        setIsSubmitting(true);
        try {
            await db.feedback.add({
                id: `feedback-${Date.now()}`,
                type,
                subject,
                message,
                status: 'pending',
                createdAt: new Date()
            });

            await new Promise(r => setTimeout(r, 1000));
            toast.success('Message bien reçu par notre équipe !');
            setSubject('');
            setMessage('');
            setType('suggestion');
        } catch (error) {
            toast.error("Erreur lors de l'envoi");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12" data-testid="help-page">
            {/* Header */}
            <div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-2 flex items-center gap-3">
                    <LifeBuoy className="w-10 h-10 text-primary" />
                    Centre d'Aide & Juridique
                </h1>
                <p className="text-foreground/60 text-lg">Support, documentation officielle et conformité</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Sidebar Actions */}
                <div className="md:col-span-4 space-y-4 h-fit sticky top-24">
                    {/* Card Tour */}
                    <div className="glass-card p-6 rounded-xl hover:border-primary/50 transition-colors cursor-pointer group bg-gradient-to-br from-primary/10 to-transparent" onClick={startTour}>
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-primary/10">
                            <Play className="w-6 h-6 text-primary fill-current" />
                        </div>
                        <h3 className="font-bold text-lg mb-1">Visite Guidée</h3>
                        <p className="text-sm text-muted-foreground">Relancez le tutoriel interactif pour redécouvrir l'interface.</p>
                    </div>

                    {/* Card Contact */}
                    <div className="p-5 rounded-xl bg-card border border-white/5 space-y-4">
                        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                            <HelpCircle className="w-4 h-4" /> Contact Support
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Une question technique ou juridique ? Notre équipe est disponible du Lundi au Vendredi.
                        </p>
                        <a
                            href="mailto:legal@initium.app"
                            className="flex w-full items-center justify-center px-4 py-2 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors text-sm font-bold"
                        >
                            legal@initium.app
                        </a>
                    </div>

                    {/* Copyright Footer */}
                    <div className="text-center pt-4 border-t border-white/5">
                        <p className="text-xs text-muted-foreground">
                            © {YEAR} INITIUM Inc.<br />
                            v2.4.0 (Stable) - Paris, France
                        </p>
                    </div>
                </div>

                {/* Main Content Tabs */}
                <div className="md:col-span-8 glass-card p-0 overflow-hidden flex flex-col min-h-[600px]">
                    <Tabs defaultValue="feedback" className="flex-1 flex flex-col">
                        <div className="border-b border-white/10 p-4 bg-black/20">
                            <TabsList className="w-full grid grid-cols-4 bg-white/5">
                                <TabsTrigger value="feedback"><MessageSquare className="w-4 h-4 mr-2" />Feedback</TabsTrigger>
                                <TabsTrigger value="legal"><Scale className="w-4 h-4 mr-2" />Mentions</TabsTrigger>
                                <TabsTrigger value="cgu"><FileText className="w-4 h-4 mr-2" />CGU</TabsTrigger>
                                <TabsTrigger value="privacy"><Shield className="w-4 h-4 mr-2" />Privacy</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto">
                            <TabsContent value="feedback" className="mt-0 space-y-4 animate-in fade-in zoom-in-95">
                                <div className="flex items-center gap-2 mb-2">
                                    <h2 className="text-xl font-bold">Envoyer un commentaire</h2>
                                </div>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Utilisez ce formulaire pour signaler des bugs, suggérer des fonctionnalités ou exercer vos droits RGPD.
                                </p>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-3">
                                        {['suggestion', 'bug', 'other'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setType(t)}
                                                className={`px-3 py-2 rounded-lg text-xs md:text-sm font-medium border transition-all ${type === t ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-transparent border-white/10 hover:bg-white/5'}`}
                                            >
                                                {t === 'suggestion' ? '💡 Idée' : t === 'bug' ? '🐛 Bug' : '💬 Autre'}
                                            </button>
                                        ))}
                                    </div>

                                    <Input
                                        placeholder="Sujet du message..."
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        className="bg-white/5 border-white/10 focus:border-primary/50"
                                    />
                                    <Textarea
                                        placeholder="Votre message détaillé ici..."
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        className="bg-white/5 border-white/10 min-h-[200px] focus:border-primary/50 resize-none p-4"
                                    />

                                    <Button onClick={handleSubmitFeedback} disabled={isSubmitting} className="w-full h-12 text-lg">
                                        {isSubmitting ? 'Envoi en cours...' : <><Send className="w-5 h-5 mr-2" /> Envoyer</>}
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="legal" className="mt-0 animate-in fade-in zoom-in-95">
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <h2 className="text-xl font-bold mb-4 text-primary">Mentions Légales</h2>
                                    <div className="whitespace-pre-line leading-relaxed text-muted-foreground">
                                        {LEGAL_MENTIONS}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="cgu" className="mt-0 animate-in fade-in zoom-in-95">
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <h2 className="text-xl font-bold mb-4 text-primary">Conditions Générales d'Utilisation</h2>
                                    <div className="whitespace-pre-line leading-relaxed text-muted-foreground p-4 bg-white/5 rounded-xl border border-white/5">
                                        {CGU_CONTENT}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="privacy" className="mt-0 animate-in fade-in zoom-in-95">
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <h2 className="text-xl font-bold mb-4 text-primary">Politique de Confidentialité & Cookies</h2>
                                    <div className="whitespace-pre-line leading-relaxed text-muted-foreground p-4 bg-white/5 rounded-xl border border-white/5">
                                        {PRIVACY_CONTENT}
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default Help;
