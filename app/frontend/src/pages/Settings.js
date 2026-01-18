import React, { useState, useRef, useEffect } from 'react';
import { db } from '../lib/db';
import { THEMES, applyTheme, getCurrentTheme } from '../lib/themes';
import {
    Settings as SettingsIcon,
    Database,
    Download,
    Upload,
    Trash2,
    ShieldAlert,
    Save,
    Palette,
    Layout,
    User,
    Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useCloudSync } from '../hooks/useCloudSyncNew';
import {
    Cloud,
    CloudOff,
    RefreshCw,
    AlertCircle,
    Zap
} from 'lucide-react';
import AvatarSelector from '../components/settings/AvatarSelector';
import AppearanceSettings from '../components/settings/AppearanceSettings';

const Settings = () => {
    const fileInputRef = useRef(null);
    const [theme, setTheme] = useState(getCurrentTheme());
    const { user, isGuest } = useAuth();
    const { syncing, lastSync, syncAll, migrateToCloud } = useCloudSync();

    // Data Export/Import Logic
    const handleExport = async () => {
        try {
            const data = {
                meta: { version: 1, date: new Date(), app: 'INITIUM' },
                quests: await db.quests.toArray(),
                habits: await db.habits.toArray(),
                notes: await db.notes.toArray(),
                events: await db.events.toArray(),
                projects: await db.projects.toArray(),
                training: await db.training.toArray(),
                analytics: await db.analytics.toArray(),
                feedback: await db.feedback.toArray(),
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `initium-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('Sauvegarde téléchargée avec succès');
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'export");
        }
    };

    const handleImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.meta || data.meta.app !== 'INITIUM') {
                    toast.error("Format de fichier invalide");
                    return;
                }
                if (!window.confirm("Attention : Cette action va écouler toutes les données actuelles et les remplacer par la sauvegarde. Continuer ?")) {
                    return;
                }
                await db.transaction('rw', db.tables, async () => {
                    await Promise.all(db.tables.map(table => table.clear()));
                    if (data.quests) await db.quests.bulkAdd(data.quests);
                    if (data.habits) await db.habits.bulkAdd(data.habits);
                    if (data.notes) await db.notes.bulkAdd(data.notes);
                    if (data.events) await db.events.bulkAdd(data.events);
                    if (data.projects) await db.projects.bulkAdd(data.projects);
                    if (data.training) await db.training.bulkAdd(data.training);
                    if (data.analytics) await db.analytics.bulkAdd(data.analytics);
                    if (data.feedback) await db.feedback.bulkAdd(data.feedback);
                });
                toast.success("Restauration terminée !");
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                console.error(error);
                toast.error("Erreur, fichier corrompu ?");
            }
        };
        reader.readAsText(file);
    };

    const handleReset = async () => {
        if (window.confirm("ÊTES-VOUS SÛR ? Toutes vos données seront définitivement effacées. Cette action est irréversible.")) {
            try {
                await db.delete();
                await db.open();
                localStorage.clear();
                window.location.reload();
            } catch (e) {
                toast.error("Erreur lors du reset");
            }
        }
    };

    const changeTheme = (newTheme) => {
        applyTheme(newTheme);
        setTheme(newTheme);
        toast.success(`Thème ${THEMES[newTheme].label} appliqué`);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-12" data-testid="settings-page">
            {/* Header */}
            <div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-2 flex items-center gap-3" data-testid="settings-title">
                    <SettingsIcon className="w-10 h-10 text-primary" />
                    Paramètres
                </h1>
                <p className="text-muted-foreground text-lg">Personnalisation et maintenance du système.</p>
            </div>

            <Tabs defaultValue="appearance" className="space-y-6">
                <TabsList className="bg-white/5 border border-white/5 p-1 rounded-xl w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
                    <TabsTrigger value="appearance" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"><Palette className="w-4 h-4 mr-2" /> Apparence</TabsTrigger>
                    <TabsTrigger value="data" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"><Database className="w-4 h-4 mr-2" /> Données</TabsTrigger>
                    <TabsTrigger value="system" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"><Layout className="w-4 h-4 mr-2" /> Système</TabsTrigger>
                </TabsList>

                {/* --- APPEARANCE TAB --- */}
                <TabsContent value="appearance" className="space-y-6 animate-in fade-in slide-in-from-bottom-5">

                    {/* AVATAR SECTION */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold ml-1">Personnalisation du Profil</h3>
                        <AvatarSelector onSave={async (url) => {
                            // Update user in DB or Context
                            // This logic can be moved to context later
                            if (user && user.id) {
                                try {
                                    await db.users.update(user.id, { photoURL: url });
                                    // Trigger reload or context update if needed
                                    // For now relying on local state update in AvatarSelector
                                } catch (e) { console.error(e); }
                            }
                        }} />
                    </div>

                    <AppearanceSettings />
                </TabsContent>

                {/* --- DATA TAB --- */}
                <TabsContent value="data" className="space-y-6 animate-in fade-in slide-in-from-bottom-5">
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-primary" /> Gestion des Sauvegardes</CardTitle>
                            <CardDescription>Vos données sont précieuses. Exportez-les régulièrement.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button onClick={handleExport} className="w-full h-auto py-6 flex flex-col items-center gap-2 border-dashed" variant="outline" data-testid="export-btn">
                                    <Download className="w-6 h-6 mb-1" />
                                    <span>Sauvegarder (Export JSON)</span>
                                    <span className="text-xs font-normal text-muted-foreground">Télécharger une copie locale</span>
                                </Button>

                                <div className="relative">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImport}
                                        className="hidden"
                                        accept=".json"
                                    />
                                    <Button onClick={() => fileInputRef.current.click()} className="w-full h-auto py-6 flex flex-col items-center gap-2 border-dashed" variant="secondary" data-testid="import-btn">
                                        <Upload className="w-6 h-6 mb-1" />
                                        <span>Restaurer (Import JSON)</span>
                                        <span className="text-xs font-normal text-muted-foreground">Remplacer les données actuelles</span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* --- CLOUD SYNC SECTION --- */}
                    <Card className="glass-card border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Cloud className="w-5 h-5 text-primary" />
                                Synchronisation Cloud
                            </CardTitle>
                            <CardDescription>
                                Synchronisez vos données avec votre compte INITIUM pour les retrouver partout.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {isGuest ? (
                                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-4">
                                    <AlertCircle className="w-6 h-6 text-yellow-500 shrink-0 mt-1" />
                                    <div className="space-y-1">
                                        <p className="font-bold text-yellow-500">Mode Invité Actif</p>
                                        <p className="text-sm text-yellow-200/60">
                                            La synchronisation cloud est désactivée en mode invité.
                                            Connectez-vous à un compte pour activer la sauvegarde automatique.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                                <Cloud className="w-5 h-5 text-green-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold">Statut : Connecté</p>
                                                <p className="text-xs text-muted-foreground">Compte : {user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Dernière synchro</p>
                                            <p className="text-sm font-mono">{lastSync ? lastSync.toLocaleTimeString() : 'Jamais'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Button
                                            onClick={syncAll}
                                            disabled={syncing}
                                            className="gap-2 h-12"
                                        >
                                            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                                            Synchroniser maintenant
                                        </Button>

                                        <Button
                                            onClick={migrateToCloud}
                                            disabled={syncing}
                                            variant="outline"
                                            className="gap-2 h-12 border-primary/30 hover:bg-primary/10"
                                        >
                                            <Zap className="w-4 h-4 text-primary" />
                                            Migrer les données locales
                                        </Button>
                                    </div>

                                    <p className="text-[10px] text-center text-muted-foreground italic">
                                        Note: La synchronisation fusionne vos données locales avec le serveur. La migration envoie toutes vos données locales actuelles vers le cloud.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- SYSTEM TAB --- */}
                <TabsContent value="system" className="space-y-6 animate-in fade-in slide-in-from-bottom-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle>Informations</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between p-2 bg-white/5 rounded">
                                    <span className="text-muted-foreground">Version</span>
                                    <span className="font-mono">2.5.0 PWA</span>
                                </div>
                                <div className="flex justify-between p-2 bg-white/5 rounded">
                                    <span className="text-muted-foreground">Build</span>
                                    <span className="font-mono">Production</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="glass-card border-red-500/20 bg-red-500/5">
                            <CardHeader>
                                <CardTitle className="text-red-500 flex items-center gap-2"><ShieldAlert className="w-5 h-5" /> Zone de Danger</CardTitle>
                                <CardDescription className="text-red-200/60">Actions destructrices irréversibles.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    variant="destructive"
                                    className="w-full gap-2"
                                    onClick={handleReset}
                                    data-testid="reset-btn"
                                >
                                    <Trash2 className="w-4 h-4" /> Réinitialisation d'Usine
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Settings;
