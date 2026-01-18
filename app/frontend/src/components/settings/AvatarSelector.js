import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import {
    Upload,
    Dices,
    Image as ImageIcon,
    Check,
    RefreshCw,
    Camera,
    User
} from 'lucide-react';

const AVATAR_STYLES = [
    { id: 'adventurer', label: 'Adventurer' },
    { id: 'adventurer-neutral', label: 'Adventurer Neutral' },
    { id: 'avataaars', label: 'Avataaars' },
    { id: 'bottts', label: 'Robots' },
    { id: 'fun-emoji', label: 'Emoji' },
    { id: 'lorelei', label: 'Lorelei' },
    { id: 'notionists', label: 'NotionStyle' },
    { id: 'pixel-art', label: 'Pixel Art' },
];

const PRESET_AVATARS = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Bandit',
    'https://api.dicebear.com/7.x/lorelei/svg?seed=Bear',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Spooky',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Lucky',
];

const AvatarSelector = ({ onSave }) => {
    const { user } = useAuth();
    const { setUser } = useApp(); // Local state update
    const [selectedTab, setSelectedTab] = useState('gallery');
    const [previewUrl, setPreviewUrl] = useState(user?.photoURL || null);
    const [isUploading, setIsUploading] = useState(false);

    // Generator State
    const [genStyle, setGenStyle] = useState('notionists');
    const [genSeed, setGenSeed] = useState(user?.username || 'user');

    // File Upload Handler
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Simple validation
        if (file.size > 2 * 1024 * 1024) {
            toast.error("L'image est trop volumineuse (max 2MB)");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleGenerate = () => {
        const seed = genSeed || Math.random().toString(36).substring(7);
        const url = `https://api.dicebear.com/7.x/${genStyle}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`;
        setPreviewUrl(url);
    };

    const handleSave = async () => {
        if (!previewUrl) return;

        try {
            setIsUploading(true);

            // Simulating API call delay
            await new Promise(r => setTimeout(r, 800));

            // If parent provided onSave (e.g. wrapper that calls context)
            if (onSave) {
                await onSave(previewUrl);
            }

            toast.success("Avatar mis à jour avec succès !");
        } catch (error) {
            toast.error("Erreur lors de la sauvegarde");
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Card className="glass-card overflow-hidden">
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row h-auto md:h-[500px]">

                    {/* Left: Preview Area */}
                    <div className="w-full md:w-1/3 bg-black/20 p-6 flex flex-col items-center justify-center border-r border-white/5 relative">
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-full border-4 border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.3)] overflow-hidden bg-background relative">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        <User className="w-12 h-12" />
                                    </div>
                                )}
                            </div>
                            {/* Overlay edit hint */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center flex-col text-white cursor-pointer"
                            >
                                <Camera className="w-8 h-8 mb-1" />
                                <span className="text-xs font-bold">Modifier</span>
                            </button>
                        </div>

                        <p className="mt-4 text-sm font-medium text-muted-foreground text-center">
                            Aperçu de votre avatar
                        </p>

                        <Button
                            className="mt-8 w-full gap-2"
                            onClick={handleSave}
                            disabled={!previewUrl || isUploading}
                        >
                            {isUploading ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            Sauvegarder
                        </Button>
                    </div>

                    {/* Right: Selection Area */}
                    <div className="flex-1 p-6">
                        <Tabs defaultValue="gallery" onValueChange={setSelectedTab} className="w-full h-full flex flex-col">
                            <TabsList className="grid grid-cols-3 mb-6">
                                <TabsTrigger value="gallery">Galerie</TabsTrigger>
                                <TabsTrigger value="generate">Générer</TabsTrigger>
                                <TabsTrigger value="upload">Upload</TabsTrigger>
                            </TabsList>

                            {/* GALLERY */}
                            <TabsContent value="gallery" className="flex-1 overflow-y-auto custom-scrollbar pr-2 h-[300px] md:h-auto">
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                    {PRESET_AVATARS.map((url, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setPreviewUrl(url)}
                                            className={`aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${previewUrl === url ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-white/20'}`}
                                        >
                                            <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover bg-white/5" />
                                        </button>
                                    ))}
                                </div>
                            </TabsContent>

                            {/* GENERATE */}
                            <TabsContent value="generate" className="flex-1 space-y-6 h-[300px] md:h-auto overflow-y-auto">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Style</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {AVATAR_STYLES.map(style => (
                                                <button
                                                    key={style.id}
                                                    onClick={() => { setGenStyle(style.id); handleGenerate(); }}
                                                    className={`px-3 py-2 text-sm rounded-lg border text-left transition-all ${genStyle === style.id ? 'bg-primary/20 border-primary text-white' : 'bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10'}`}
                                                >
                                                    {style.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Graine (Seed)</label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={genSeed}
                                                onChange={(e) => setGenSeed(e.target.value)}
                                                placeholder="Entrez un texte..."
                                                className="bg-white/5 border-white/10"
                                            />
                                            <Button variant="outline" onClick={() => setGenSeed(Math.random().toString(36).substring(7))}>
                                                <Dices className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <Button onClick={handleGenerate} className="w-full" variant="secondary">
                                        Générer l'aperçu
                                    </Button>
                                </div>
                            </TabsContent>

                            {/* UPLOAD */}
                            <TabsContent value="upload" className="flex-1 flex flex-col justify-center h-[300px] md:h-auto">
                                <div
                                    className="border-2 border-dashed border-white/10 rounded-2xl h-64 flex flex-col items-center justify-center p-6 transition-colors hover:border-primary/50 hover:bg-white/5 cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/gif, image/webp"
                                        onChange={handleFileChange}
                                    />
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                        <Upload className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-lg font-medium text-white mb-1">Cliquer pour uploader</p>
                                    <p className="text-sm text-muted-foreground">PNG, JPG ou GIF (max 2MB)</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AvatarSelector;
