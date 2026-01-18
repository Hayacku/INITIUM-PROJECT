import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { THEMES, getCurrentTheme, hexToHSL } from '../../lib/themes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Check, Palette, Type, LayoutGrid, Monitor } from 'lucide-react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';

const AppearanceSettings = () => {
    const { theme, changeTheme, appearance, updateAppearance } = useApp();
    const [customColor, setCustomColor] = useState('#6366f1'); // Default indigo

    const handleColorChange = (e) => {
        const hex = e.target.value;
        setCustomColor(hex);
        const hsl = hexToHSL(hex);
        updateAppearance({ ...appearance, primaryColor: hsl });
    };

    const resetColor = () => {
        updateAppearance({ ...appearance, primaryColor: null });
        setCustomColor('#6366f1');
    };

    return (
        <div className="space-y-6">

            {/* 1. Theme Selection */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-primary" /> Thème Principal
                    </CardTitle>
                    <CardDescription>Choisissez l'ambiance globale de l'interface.</CardDescription>
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

            {/* 2. Customization (Accent & Density) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Accent Color */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Monitor className="w-4 h-4" /> Couleur d'Accent
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-inner">
                                <input
                                    type="color"
                                    value={customColor}
                                    onChange={handleColorChange}
                                    className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Couleur Personnalisée</p>
                                <p className="text-xs text-muted-foreground">Cliquez sur le cercle pour changer la couleur principale.</p>
                            </div>
                            {appearance?.primaryColor && (
                                <Button size="sm" variant="outline" onClick={resetColor}>
                                    Rétablir
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Density & Font */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <LayoutGrid className="w-4 h-4" /> Affichage
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* Density */}
                        <div className="space-y-3">
                            <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Densité</Label>
                            <div className="flex gap-2 p-1 bg-black/20 rounded-lg">
                                <button
                                    onClick={() => updateAppearance({ ...appearance, density: 'comfortable' })}
                                    className={`flex-1 py-1.5 text-sm rounded-md transition-all ${appearance?.density !== 'compact' ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:bg-white/5'}`}
                                >
                                    Confortable
                                </button>
                                <button
                                    onClick={() => updateAppearance({ ...appearance, density: 'compact' })}
                                    className={`flex-1 py-1.5 text-sm rounded-md transition-all ${appearance?.density === 'compact' ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:bg-white/5'}`}
                                >
                                    Compact
                                </button>
                            </div>
                        </div>

                        {/* Font */}
                        <div className="space-y-3">
                            <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Police</Label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => updateAppearance({ ...appearance, font: 'sans' })}
                                    className={`px-3 py-1.5 text-sm border rounded-md transition-all ${!appearance?.font || appearance?.font === 'sans' ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 hover:border-white/20'}`}
                                >
                                    Sans
                                </button>
                                <button
                                    onClick={() => updateAppearance({ ...appearance, font: 'serif' })}
                                    className={`px-3 py-1.5 text-sm border rounded-md font-serif transition-all ${appearance?.font === 'serif' ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 hover:border-white/20'}`}
                                >
                                    Serif
                                </button>
                                <button
                                    onClick={() => updateAppearance({ ...appearance, font: 'mono' })}
                                    className={`px-3 py-1.5 text-sm border rounded-md font-mono transition-all ${appearance?.font === 'mono' ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 hover:border-white/20'}`}
                                >
                                    Mono
                                </button>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AppearanceSettings;
