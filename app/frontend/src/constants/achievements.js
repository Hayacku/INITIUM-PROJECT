
import { Rocket, Target, Zap, Clock, Star, Flame, Crown, Book, Shield, Heart } from 'lucide-react';

export const GUEST_ACHIEVEMENTS = [
    {
        id: 'guest-1',
        name: "Premier Pas",
        description: "Visiter l'application pour la première fois",
        rarity: "common",
        icon: <Rocket className="w-10 h-10 text-blue-400" />,
        reward_xp: 50,
        reward_coins: 10,
        secret: false
    },
    {
        id: 'guest-2',
        name: "Explorateur Curieux",
        description: "Ouvrir 3 pages différentes",
        rarity: "common",
        icon: <Target className="w-10 h-10 text-green-400" />,
        reward_xp: 75,
        reward_coins: 15,
        secret: false
    },
    {
        id: 'guest-3',
        name: "Productivité Pure",
        description: "Compléter une tâche (Simulation)",
        rarity: "rare",
        icon: <Zap className="w-10 h-10 text-yellow-400" />,
        reward_xp: 150,
        reward_coins: 50,
        secret: false
    },
    {
        id: 'guest-4',
        name: "Maître du Temps",
        description: "Utiliser le Pomodoro",
        rarity: "epic",
        icon: <Clock className="w-10 h-10 text-purple-400" />,
        reward_xp: 300,
        reward_coins: 100,
        secret: true
    },
    {
        id: 'guest-5',
        name: "Légende Vivante",
        description: "Atteindre le niveau 5",
        rarity: "legendary",
        icon: <Crown className="w-10 h-10 text-amber-500" />,
        reward_xp: 1000,
        reward_coins: 500,
        secret: false
    }
];
