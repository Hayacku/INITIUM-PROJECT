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

const Settings = () => {
    const fileInputRef = useRef(null);
    const [theme, setTheme] = useState(getCurrentTheme());

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
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5 text-primary" /> Thèmes Visuels</CardTitle>
                            <CardDescription>Choisissez l'ambiance qui convient le mieux à votre aventure.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.values(THEMES).map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => changeTheme(t.id)}
                                        className={`group relative p-4 rounded-xl border transition-all duration-300 text-left hover:scale-[1.02] flex items-start gap-4 ${theme === t.id
                                            ? 'bg-primary/10 border-primary ring-1 ring-primary'
                                            : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-lg shadow-lg border border-white/10 flex-shrink-0 ${t.preview || 'bg-black'}`} />
                                        <div>
                                            <h4 className="font-bold text-base flex items-center gap-2">
                                                {t.label}
                                                {theme === t.id && <Check className="w-4 h-4 text-primary" />}
                                            </h4>
                                            <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
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
