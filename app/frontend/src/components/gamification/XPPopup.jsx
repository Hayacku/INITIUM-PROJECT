import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

const XPPopup = ({ amount, onComplete }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -100, scale: 1.2 }}
            exit={{ opacity: 0, scale: 1.5 }}
            onAnimationComplete={onComplete}
            className="fixed pointer-events-none z-[9999] flex items-center gap-2 font-black text-yellow-500 text-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
            style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
            }}
        >
            <Zap className="w-6 h-6 fill-yellow-500" />
            +{amount} XP
        </motion.div>
    );
};

export default XPPopup;
