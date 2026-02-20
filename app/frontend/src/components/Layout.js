
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MobileDock from './layout/MobileDock';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useCloudSync } from '../hooks/useCloudSyncNew';
import {
    LayoutDashboard,
    FolderKanban,
    Sword,
    CheckCircle2,
    Dumbbell,
    StickyNote,
    Settings,
    LogOut,
    Menu,
    X,
    Cloud,
    CloudOff,
    Loader2,
    HelpCircle,
    Calendar,
    BarChart3,
    Timer,
    WifiOff,
    Trophy
} from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Logo from './Logo';
import SidebarMoreMenu from './SidebarMoreMenu';
import AppBreadcrumbs from './AppBreadcrumbs';
import { GlobalSearch } from './GlobalSearch';
import LevelUpModal from './gamification/LevelUpModal';

import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

const Layout = ({ children }) => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const { levelUpData, setLevelUpData } = useApp();
    const { syncStatus, lastSyncTime } = useCloudSync();

    useKeyboardShortcuts();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Full list of navigation items
    const allNavItems = [
        { label: 'Tableau de bord', icon: LayoutDashboard, path: '/' },
        { label: 'Agenda', icon: Calendar, path: '/agenda' },
        { label: 'Projets', icon: FolderKanban, path: '/projects' },
        { label: 'Quêtes', icon: Sword, path: '/quests' },
        { label: 'Habitudes', icon: CheckCircle2, path: '/habits' },
        { label: 'Entraînement', icon: Dumbbell, path: '/training' },
        { label: 'Notes', icon: StickyNote, path: '/notes' },
        { label: 'Récompenses', icon: Trophy, path: '/unlockables' },
        { label: 'Analytique', icon: BarChart3, path: '/analytics' },
        { label: 'Pomodoro', icon: Timer, path: '/pomodoro' },
        { label: 'Aide', icon: HelpCircle, path: '/help' },
    ];

    // Logic to limiting items: 
    // We want max 8 visible items in the main list.
    // So we take first 7, and put the rest in "More".
    const VISIBLE_LIMIT = 7;
    const isOverflow = allNavItems.length > VISIBLE_LIMIT;

    const primaryItems = isOverflow ? allNavItems.slice(0, VISIBLE_LIMIT) : allNavItems;
    const overflowItems = isOverflow ? allNavItems.slice(VISIBLE_LIMIT) : [];

    const bottomItems = [
        { label: 'Paramètres', icon: Settings, path: '/settings' },
    ];

    const SyncIndicator = () => {
        if (!isOnline) {
            return (
                <div className="flex items-center gap-2 text-xs font-bold px-4 py-2 text-orange-500 bg-orange-500/10 rounded-lg mb-2 mx-2">
                    <WifiOff className="w-4 h-4 ml-1" />
                    <span>Mode Hors Ligne</span>
                </div>
            );
        }

        let icon = <Cloud className="w-4 h-4 text-muted-foreground" />;
        let text = "Synchronisé";
        let color = "text-muted-foreground";

        if (syncStatus === 'syncing') {
            icon = <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
            text = "En cours...";
            color = "text-blue-500";
        } else if (syncStatus === 'error') {
            icon = <CloudOff className="w-4 h-4 text-red-500" />;
            text = "Erreur Sync";
            color = "text-red-500";
        } else if (syncStatus === 'success') {
            icon = <CheckCircle2 className="w-4 h-4 text-green-500" />;
            text = "Synchronisé";
            color = "text-green-500";
        }

        return (
            <div className={`flex items-center gap-2 text-xs font-medium px-4 py-2 ${color}`} title={`Dernière synchro : ${lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'Jamais'}`}>
                {icon}
                <span>{text}</span>
            </div>
        );
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-background border-r border-white/5">
            <div className="p-6">
                <Logo className="h-8 w-auto" />
            </div>

            <ScrollArea className="flex-1 px-4">
                <div className="space-y-1">
                    {primaryItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileOpen(false)}
                            className="block"
                        >
                            <Button
                                variant={location.pathname === item.path ? "secondary" : "ghost"}
                                className={`w-full justify-start gap-3 mb-1 font-ui uppercase tracking-wider text-xs ${location.pathname === item.path ? 'bg-primary/10 text-primary border-r-2 border-primary rounded-none' : ''}`}
                            >
                                <item.icon className={`w-4 h-4 ${location.pathname === item.path ? 'text-primary' : ''}`} />
                                {item.label}
                            </Button>
                        </Link>
                    ))}

                    {/* Overflow Menu */}
                    {overflowItems.length > 0 && (
                        <SidebarMoreMenu
                            items={overflowItems}
                            onCloseMobile={() => setIsMobileOpen(false)}
                        />
                    )}
                </div>

                <Separator className="my-4" />

                <div className="space-y-1">
                    {bottomItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileOpen(false)}
                        >
                            <Button
                                variant={location.pathname === item.path ? "secondary" : "ghost"}
                                className="w-full justify-start gap-3 mb-1"
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </Button>
                        </Link>
                    ))}
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-border mt-auto">
                <SyncIndicator />

                <div className="flex items-center gap-3 p-2 mt-2 rounded-lg bg-accent/50">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photoURL} />
                        <AvatarFallback>{user?.username?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user?.username || 'Utilisateur'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={logout}>
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-background text-foreground font-ui">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 fixed inset-y-0 z-50">
                <SidebarContent />
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between p-4">
                <Logo className="h-6 w-auto" />
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="w-5 h-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen pb-28 md:pb-8">
                <div className="max-w-6xl mx-auto">
                    <AppBreadcrumbs />
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
                <LevelUpModal
                    data={levelUpData}
                    onClose={() => setLevelUpData(null)}
                />
            </main>
            <MobileDock />
            <GlobalSearch />
        </div>
    );
};

export default Layout;
