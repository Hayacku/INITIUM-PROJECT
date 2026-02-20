import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Trophy, Star, Zap, PartyPopper } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const LevelUpModal = ({ data, onClose }) => {
    if (!data) return null;

    return (
        <Dialog open={!!data} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-primary/30 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <Confetti
                        width={window.innerWidth}
                        height={window.innerHeight}
                        recycle={false}
                        numberOfPieces={200}
                        colors={['#8B5CF6', '#D946EF', '#F59E0B']}
                    />
                </div>

                <DialogHeader className="relative z-10 pt-6">
                    <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/50"
                    >
                        <Trophy className="w-10 h-10 text-primary animate-pulse" />
                    </motion.div>
                    <DialogTitle className="text-3xl font-black text-center uppercase tracking-tighter italic">
                        Niveau Supérieur !
                    </DialogTitle>
                    <DialogDescription className="text-center text-lg font-medium">
                        Félicitations Initié
                    </DialogDescription>
                </DialogHeader>

                <div className="relative z-10 py-6 text-center">
                    <div className="flex items-center justify-center gap-6 mb-6">
                        <div className="text-muted-foreground line-through text-xl font-bold">Lvl {data.oldLevel}</div>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-primary text-5xl font-black italic drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                        >
                            {data.newLevel}
                        </motion.div>
                    </div>

                    <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3 flex items-center justify-center gap-2">
                            <Star className="w-3 h-3" /> Récompenses débloquées <Star className="w-3 h-3" />
                        </h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 text-sm font-medium">
                                <Zap className="w-4 h-4 text-yellow-500" />
                                <span>Capacité de stockage d'énergie accrue</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium">
                                <PartyPopper className="w-4 h-4 text-pink-500" />
                                <span>Nouveaux thèmes disponibles</span>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="relative z-10">
                    <Button onClick={onClose} className="w-full bg-primary font-bold uppercase py-6 shadow-lg shadow-primary/20">
                        Continuer l'Aventure
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default LevelUpModal;
