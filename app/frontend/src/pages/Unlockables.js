import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import {
    Trophy,
    Lock,
    Unlock,
    Star,
    Palette,
    User,
    Zap,
    Shield,
    Sparkles,
    Flame,
    Crown,
    Medal
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useApp } from '../contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const RARITY_CONFIG = {
    common: { color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20', label: 'Commun' },
    rare: { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', label: 'Rare' },
    epic: { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', label: 'Épique' },
    legendary: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', label: 'Légendaire' }
};

const Unlockables = () => {
    const { user, setActiveTitle, setActiveEffect } = useApp();
    const [unlockables, setUnlockables] = useState([]);
    const totalXP = user?.totalXP || 0;
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            let items = await db.unlockables.toArray();
            setUnlockables(items);
        } catch (error) {
            console.error("Error loading unlockables", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnlock = async (item) => {
        if (totalXP >= item.xpCost) {
            await db.unlockables.update(item.id, { isUnlocked: true, unlockedAt: new Date() });
            toast.success(`Débloqué : ${item.title || item.name} !`);
            loadData();
        } else {
            toast.error(`XP insuffisant ! Il vous manque ${item.xpCost - totalXP} XP`);
        }
    };

    const handleEquip = (item) => {
        if (item.type === 'title') {
            setActiveTitle(item.name);
            toast.success(`Titre équipé : ${item.name}`);
        } else if (item.type === 'effect') {
            setActiveEffect(item.name);
            toast.success(`Effet activé : ${item.name}`);
        }
    };

    const getIcon = (type, rarity) => {
        const config = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
        const iconClasses = `w-6 h-6 ${config.color}`;

        switch (type) {
            case 'theme': return <Palette className={iconClasses} />;
            case 'title': return <User className={iconClasses} />;
            case 'effect': return <Zap className={iconClasses} />;
            case 'badge': return <Medal className={iconClasses} />;
            default: return <Star className={iconClasses} />;
        }
    };

    const categories = [
        { id: 'badges', label: 'Badges', icon: Medal },
        { id: 'titles', label: 'Titres', icon: Crown },
        { id: 'themes', label: 'Thèmes', icon: Palette },
        { id: 'effects', label: 'Effets FX', icon: Sparkles },
    ];

    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Ouverture du Coffre...</div>;

    return (
        <div className="space-y-8 pb-32 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-background via-card to-background border border-primary/20 p-8 shadow-2xl shadow-primary/5">
                <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl">
                    <Trophy className="w-64 h-64 text-primary" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center justify-center md:justify-start gap-4 mb-2">
                            <Crown className="w-10 h-10 text-amber-500 animate-bounce" />
                            Le Coffre-Fort
                        </h1>
                        <p className="text-muted-foreground max-w-md">Transformez vos exploits en récompenses légendaires. Votre légende commence ici.</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-background/50 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/5 text-center shadow-lg">
                            <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Total XP</div>
                            <div className="text-3xl font-black text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.4)]">{totalXP.toLocaleString()}</div>
                        </div>
                        <div className="bg-background/50 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/5 text-center shadow-lg">
                            <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Niveau</div>
                            <div className="text-3xl font-black text-emerald-500">{user?.level || 1}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="badges" className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-muted/50 rounded-2xl border border-white/5 mb-8">
                    {categories.map(cat => (
                        <TabsTrigger key={cat.id} value={cat.id} className="py-4 font-black uppercase tracking-tighter italic gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-xl transition-all">
                            <cat.icon className="w-4 h-4" />
                            {cat.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <AnimatePresence mode="wait">
                    {categories.map(cat => (
                        <TabsContent key={cat.id} value={cat.id} className="focus-visible:outline-none">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {unlockables
                                    .filter(item => (cat.id === 'badges' ? item.type === 'badge' : item.type === cat.id.slice(0, -1)))
                                    .map(item => (
                                        <VaultItem
                                            key={item.id}
                                            item={item}
                                            totalXP={totalXP}
                                            onUnlock={handleUnlock}
                                            onEquip={handleEquip}
                                            icon={getIcon(item.type, item.rarity)}
                                        />
                                    ))}
                            </motion.div>
                        </TabsContent>
                    ))}
                </AnimatePresence>
            </Tabs>
        </div>
    );
};

const VaultItem = ({ item, totalXP, onUnlock, onEquip, icon }) => {
    const config = RARITY_CONFIG[item.rarity || 'common'];
    const isAffordable = totalXP >= (item.xpCost || 0);
    const progress = Math.min((totalXP / (item.xpCost || 1)) * 100, 100);

    return (
        <div className={`
            group relative overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-sm p-5 transition-all duration-300
            ${item.isUnlocked ? `${config.border} hover:bg-card` : 'border-white/5 grayscale opacity-80 hover:grayscale-0 hover:opacity-100'}
        `}>
            {/* Rarity Tag */}
            <div className={`absolute top-0 right-0 px-3 py-1 text-[8px] font-black uppercase tracking-tighter rounded-bl-xl ${config.bg} ${config.color}`}>
                {config.label}
            </div>

            <div className="flex items-start gap-4 mb-4">
                <div className={`p-4 rounded-xl flex items-center justify-center ${config.bg} transition-transform group-hover:scale-110 duration-500 shadow-inner`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-black italic uppercase tracking-tighter text-lg truncate">
                        {item.name || item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-tight">
                        {item.description}
                    </p>
                </div>
            </div>

            {item.isUnlocked ? (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[10px] font-medium text-emerald-500">
                        <span className="flex items-center gap-1"><Unlock className="w-3 h-3" /> ACQUIS</span>
                        <span>DÉBLOQUÉ</span>
                    </div>
                    {item.type !== 'badge' && (
                        <Button
                            size="sm"
                            variant="secondary"
                            className="w-full font-black uppercase text-xs h-9 rounded-lg"
                            onClick={() => onEquip(item)}
                        >
                            Équiper
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <span>Progression</span>
                        <span>{totalXP.toLocaleString()} / {(item.xpCost || 0).toLocaleString()} XP</span>
                    </div>
                    <Progress value={progress} className="h-1 bg-white/5" indicatorClassName={config.bg.replace('bg-', 'bg-')} />
                    <Button
                        size="sm"
                        disabled={!isAffordable}
                        className={`w-full font-black uppercase text-xs h-9 rounded-lg shadow-lg ${isAffordable ? 'bg-primary' : 'bg-muted/50 cursor-not-allowed'}`}
                        onClick={() => onUnlock(item)}
                    >
                        {isAffordable ? "Débloquer" : `Requis: ${item.xpCost} XP`}
                    </Button>
                </div>
            )}

            {/* Background Aesthetic */}
            <div className={`absolute -bottom-12 -right-12 w-24 h-24 ${config.bg} blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-700`} />
        </div>
    );
};

export default Unlockables;
