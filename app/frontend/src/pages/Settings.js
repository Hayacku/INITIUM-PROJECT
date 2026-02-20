
import React from 'react';
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from '../contexts/HistoryContext';
import { useApp } from '../contexts/AppContext';
import { useCloudSync } from '../hooks/useCloudSyncNew';
import {
    Settings as SettingsIcon,
    Cloud,
    Trash2,
    Database,
    Moon,
    Sun,
    Monitor,
    LogOut,
    AlertTriangle,
    CheckCircle2,
    History,
    Bug,
    Terminal,
    Loader2
} from 'lucide-react';
import { DeveloperService } from '../services/DeveloperService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { applyTheme, getCurrentTheme, THEMES } from '../lib/themes';

const Settings = () => {
    const { user, logout } = useAuth();
    const { history } = useHistory();
    const { compactMode, toggleCompactMode } = useApp();
    const { syncStatus, lastSyncTime, syncAll, error } = useCloudSync();

    const [devMode, setDevMode] = React.useState(localStorage.getItem('devMode') === 'true');
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [genProgress, setGenProgress] = React.useState({ percent: 0, status: '' });

    const handleDeleteExamples = async () => {
        if (window.confirm('Voulez-vous vraiment supprimer toutes les données exemples ?')) {
            try {
                // Delete items explicitly marked as example
                await db.quests.where('isExample').equals(1).delete(); // Dexie boolean is 1/0 sometimes or needs check
                // Fallback for older items not marked, or just rely on 'isExample'
                // For now, let's assume we update DB to mark them.

                // Advanced: delete by ID pattern 'quest-1', 'habit-1' etc if logical
                const exampleIds = ['quest-1', 'quest-2', 'quest-3', 'habit-1', 'habit-2', 'habit-3', 'project-1', 'project-2'];
                await db.quests.bulkDelete(exampleIds);
                await db.habits.bulkDelete(exampleIds);
                await db.projects.bulkDelete(exampleIds);

                toast.success('Données exemples supprimées');
                // Trigger reload or state update if possible
                setTimeout(() => window.location.reload(), 1000);
            } catch (err) {
                console.error(err);
                toast.error('Erreur lors de la suppression');
            }
        }
    };

    const handleThemeChange = (theme) => {
        applyTheme(theme);
        toast.success(`Thème ${theme} appliqué`);
    };

    const toggleDevMode = (checked) => {
        setDevMode(checked);
        localStorage.setItem('devMode', checked);
        if (checked) {
            toast.info("Mode Développeur activé");
        }
    };

    const handleGenerateData = async () => {
        if (!window.confirm("CETTE ACTION VA SUPPRIMER VOS DONNÉES ACTUELLES et générer un an d'historique test. Continuer ?")) {
            return;
        }

        setIsGenerating(true);
        try {
            await DeveloperService.generateYearOfData((percent, status) => {
                setGenProgress({ percent, status });
            });
            toast.success("Données générées avec succès !");
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de la génération");
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6 pb-20 max-w-4xl mx-auto" data-testid="settings-page">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <SettingsIcon className="w-8 h-8 text-primary" />
                    Paramètres
                </h1>
                <p className="text-muted-foreground">Personnalisez votre expérience INITIUM</p>
            </div>

            {/* CLOUD SYNC STATUS */}
            <Card className="border-border/60">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Cloud className="w-5 h-5 text-blue-500" />
                        Synchronisation Cloud
                    </CardTitle>
                    <CardDescription>État de la connexion avec les serveurs INITIUM</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg border border-border/50">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 font-medium">
                                Statut
                                {syncStatus === 'success' && <span className="text-green-500 flex items-center text-xs"><CheckCircle2 className="w-3 h-3 mr-1" /> Connecté</span>}
                                {syncStatus === 'syncing' && <span className="text-blue-500 text-xs">Synchronisation...</span>}
                                {syncStatus === 'error' && <span className="text-red-500 flex items-center text-xs"><AlertTriangle className="w-3 h-3 mr-1" /> Erreur</span>}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Dernière synchro : {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : 'Jamais'}
                            </div>
                            {error && <div className="text-xs text-red-500 mt-1">{error.message}</div>}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => syncAll()} disabled={syncStatus === 'syncing'}>
                            Forcer la synchro
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* DATA MANAGEMENT */}
            <Card className="border-border/60">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-purple-500" />
                        Données
                    </CardTitle>
                    <CardDescription>Gérez votre stockage local</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Supprimer les exemples</Label>
                            <p className="text-sm text-muted-foreground">Retire les quêtes et projets de démonstration.</p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={handleDeleteExamples}>
                            <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* APPEARANCE */}
            <Card className="border-border/60">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-orange-500" />
                        Apparence
                    </CardTitle>
                    <CardDescription>Interface et Thèmes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Monitor className="w-4 h-4" /> Sélection du Thème
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.values(THEMES).filter(t => ['basique', 'dark', 'light', 'terra'].includes(t.id)).map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => handleThemeChange(theme.id)}
                                    className={`relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 group ${getCurrentTheme() === theme.id ? 'border-primary bg-primary/5' : 'border-border/40 hover:border-border'
                                        }`}
                                >
                                    <div className={`w-full h-12 rounded md ${theme.preview} border border-white/10`} />
                                    <span className={`text-xs font-bold uppercase tracking-tight ${getCurrentTheme() === theme.id ? 'text-primary' : 'text-muted-foreground'}`}>
                                        {theme.label}
                                    </span>
                                    {getCurrentTheme() === theme.id && (
                                        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                                            <CheckCircle2 className="w-3 h-3" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground italic mt-2">
                            * Le thème <strong>Basique</strong> correspond à la Direction Artistique officielle.
                        </p>
                    </div>

                    <Separator className="bg-border/40" />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Vue compacte</Label>
                            <p className="text-sm text-muted-foreground">Réduire l'espacement et la taille globale des éléments.</p>
                        </div>
                        <Switch checked={compactMode} onCheckedChange={toggleCompactMode} />
                    </div>
                </CardContent>
            </Card>

            {/* HISTORY */}
            <Card className="border-border/60">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5 text-blue-400" />
                        Historique récent
                    </CardTitle>
                    <CardDescription>Vos 10 dernières actions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {history.length === 0 && <p className="text-sm text-muted-foreground">Aucune action récente.</p>}
                        {history.map((action) => (
                            <div key={action.id} className="flex items-center justify-between text-sm p-2 bg-accent/20 rounded">
                                <span>{action.description}</span>
                                <span className="text-xs text-muted-foreground">{new Date(action.timestamp).toLocaleTimeString()}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* DEVELOPER MODE */}
            <Card className={`border-dashed border-primary/40 bg-primary/5 transition-all ${devMode ? 'ring-1 ring-primary/20' : ''}`}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bug className="w-5 h-5 text-primary" />
                        Mode Développeur
                    </CardTitle>
                    <CardDescription>Outils de test et débogage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-2 rounded-md hover:bg-primary/5 cursor-pointer" onClick={() => toggleDevMode(!devMode)}>
                        <div className="space-y-0.5 pointer-events-none">
                            <Label className="cursor-pointer">Activer le mode développeur</Label>
                            <p className="text-xs text-muted-foreground">Affiche les options avancées de test.</p>
                        </div>
                        <Switch
                            checked={devMode}
                            onCheckedChange={toggleDevMode}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {devMode && (
                        <>
                            <Separator className="bg-primary/20" />
                            <div className="space-y-4">
                                <div className="p-4 bg-background rounded-lg border border-primary/20 flex flex-col gap-3">
                                    <h4 className="flex items-center gap-2 text-sm font-bold">
                                        <Terminal className="w-4 h-4" />
                                        Génération de Données Tests
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        Peuple la base de données avec 1 an d'historique (Analytics, Quests, Habits, etc.).
                                        <br /><strong className="text-destructive">Attention: Écrase les données existantes.</strong>
                                    </p>

                                    {isGenerating ? (
                                        <div className="space-y-2 mt-2">
                                            <div className="flex justify-between text-[10px] mb-1">
                                                <span>{genProgress.status}</span>
                                                <span>{genProgress.percent}%</span>
                                            </div>
                                            <div className="w-full bg-accent/30 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-primary h-full transition-all duration-300"
                                                    style={{ width: `${genProgress.percent}%` }}
                                                />
                                            </div>
                                            <p className="text-center text-[10px] animate-pulse">Ne fermez pas la page...</p>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            className="border-primary/50 hover:bg-primary/10 w-full"
                                            onClick={handleGenerateData}
                                        >
                                            Générer 1 an de données
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* ACCOUNT */}
            <Card className="border-border/60">
                <CardHeader>
                    <CardTitle>Compte</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                {user?.username?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <p className="font-medium">{user?.username}</p>
                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={logout}>
                            <LogOut className="w-4 h-4 mr-2" /> Déconnexion
                        </Button>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
};

export default Settings;
