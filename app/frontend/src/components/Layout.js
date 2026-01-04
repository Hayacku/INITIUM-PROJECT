import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    Target,
    TrendingUp,
    Calendar,
    FolderKanban,
    FileText,
    Dumbbell,
    BarChart3,
    Settings as SettingsIcon,
    Menu,
    X,
    Sparkles,
    LogOut,
    Users,
    Timer,
    Plug,
    MoreHorizontal,
    LifeBuoy
} from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import QuickActionFab from './QuickActionFab';

const Layout = ({ children }) => {
    const { user: appUser, loading: appLoading } = useApp();
    const { user: authUser, logout, isGuest } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const isGuestMode = isGuest || (!authUser && appUser);

    const user = isGuestMode
        ? { ...appUser, ...{ username: 'Invité', email: 'mode@hors-ligne' }, photoURL: null } // Merge local stats with Guest persona
        : authUser;

    const loading = appLoading;

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    }, [location]);

    const allMenuItems = [
        { path: '/training', icon: Dumbbell, label: 'Entraînement', testId: 'nav-training', mobileOrder: 1 },
        { path: '/quests', icon: Target, label: 'Quêtes', testId: 'nav-quests', mobileOrder: 2 },
        { path: '/', icon: LayoutDashboard, label: 'Tableau de bord', testId: 'nav-dashboard', mobileOrder: 3, isCenter: true },
        { path: '/habits', icon: TrendingUp, label: 'Habitudes', testId: 'nav-habits', mobileOrder: 4 },
        { path: '/projects', icon: FolderKanban, label: 'Projets', testId: 'nav-projects', mobileOrder: 5 },
        // Secondary
        { path: '/agenda', icon: Calendar, label: 'Agenda', testId: 'nav-agenda', secondary: true },
        { path: '/notes', icon: FileText, label: 'Notes', testId: 'nav-notes', secondary: true },
        { path: '/analytics', icon: BarChart3, label: 'Analyses', testId: 'nav-analytics', secondary: true },
        { path: '/pomodoro', icon: Timer, label: 'Pomodoro', testId: 'nav-pomodoro', secondary: true },
        { path: '/settings', icon: SettingsIcon, label: 'Paramètres', testId: 'nav-settings', secondary: true },
        { path: '/help', icon: LifeBuoy, label: "Centre d'Aide", testId: 'nav-help', secondary: true }
    ];

    const mobileNavItems = allMenuItems.filter(item => !item.secondary).sort((a, b) => a.mobileOrder - b.mobileOrder);
    const secondaryNavItems = allMenuItems.filter(item => item.secondary);
    const sidebarNavItems = allMenuItems;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="animate-pulse text-2xl text-primary font-bold tracking-widest">INITIUM...</div>
            </div>
        );
    }

    return (
        <div className="app-container flex min-h-screen bg-background text-foreground overflow-x-hidden relative font-sans selection:bg-primary/30" data-testid="app-layout">
            {/* Background Animated Blobs (Cosmic theme) */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-blob mix-blend-screen opacity-40"></div>
                <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen opacity-40"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-screen opacity-40"></div>
            </div>

            <div className="relative z-10 flex w-full h-full">

                {/* --- MOBILE FLOATING NAVIGATION --- */}
                <nav className="fixed bottom-4 left-4 right-4 h-auto bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl z-50 lg:hidden flex justify-between items-end px-6 pb-4 pt-4 shadow-2xl">
                    {mobileNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        if (item.isCenter) {
                            return (
                                <div key={item.path} className="relative -top-8">
                                    <Link
                                        to={item.path}
                                        id={`mobile-${item.testId}`}
                                        className={`flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent shadow-[0_0_20px_rgba(var(--primary),0.4)] border-4 border-background transition-transform active:scale-95 ${isActive ? 'scale-110 shadow-[0_0_30px_rgba(var(--primary),0.6)]' : ''}`}
                                    >
                                        <Icon className="w-7 h-7 text-white" />
                                    </Link>
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                id={`mobile-${item.testId}`}
                                className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${isActive ? 'text-primary scale-110 drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]' : 'text-muted-foreground hover:text-white'
                                    }`}
                            >
                                <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                            </Link>
                        );
                    })}
                </nav>

                {/* --- DESKTOP FLOATING SIDEBAR --- */}
                <aside
                    className={`hidden lg:flex fixed left-4 top-4 bottom-4 glass-card border flex-col transition-all duration-500 z-40 overflow-hidden
            ${sidebarOpen ? 'w-64' : 'w-20'}
          `}
                    data-testid="sidebar"
                >
                    {/* Header */}
                    <div className="p-4 flex items-center justify-center h-20 mb-2 relative">
                        <div className={`absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-50 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}></div>
                        <div className="flex items-center gap-3 relative z-10 transition-all duration-500">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            {sidebarOpen && (
                                <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent animate-fade-in whitespace-nowrap">
                                    INITIUM
                                </span>
                            )}
                        </div>
                    </div>

                    {/* User Profile */}
                    <div className="px-3 mb-6">
                        <div className={`p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 transition-all duration-300 hover:bg-white/10 ${!sidebarOpen && 'justify-center p-2'}`}>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary p-[2px] shrink-0">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                    {user?.photoURL ? <img src={user.photoURL} alt="User" /> : <span className="text-sm font-bold">{user?.username?.[0]}</span>}
                                </div>
                            </div>
                            {sidebarOpen && (
                                <div className="overflow-hidden">
                                    <p className="font-bold text-sm truncate text-white">{user?.username}</p>
                                    <p className="text-xs text-primary/80 font-mono">Lvl.{user?.level || 1}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar py-2">
                        {sidebarNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    id={item.testId}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                                        ? 'bg-primary/20 text-white border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.2)]'
                                        : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                                        }`}
                                    title={!sidebarOpen ? item.label : ''}
                                >
                                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full shadow-[0_0_10px_var(--primary)]"></div>}
                                    <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]' : ''}`} />
                                    {sidebarOpen && <span className={`font-medium text-sm transition-all ${isActive ? 'translate-x-1' : ''}`}>{item.label}</span>}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-3 mt-auto space-y-2">
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center p-3 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors group"
                            title="Déconnexion"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="w-full flex items-center justify-center p-3 rounded-xl hover:bg-white/5 text-muted-foreground transition-colors group"
                        >
                            {sidebarOpen ? <X className="w-5 h-5 group-hover:text-white" /> : <Menu className="w-5 h-5 group-hover:text-white" />}
                        </button>
                    </div>
                </aside>

                {/* --- MAIN CONTENT AREA --- */}
                <main
                    className={`flex-1 transition-all duration-500 min-h-screen flex flex-col mb-24 lg:mb-0
            ${sidebarOpen ? 'lg:ml-[18.5rem]' : 'lg:ml-[7.5rem]'} /* Margin adjusted for floating sidebar (16rem/5rem + 1rem padding + 1.5rem gap) */
            p-4 md:p-8
          `}
                    data-testid="main-content"
                >
                    {/* Mobile Top Bar (Glass) */}
                    <div className="lg:hidden flex items-center justify-between mb-8 sticky top-4 z-30 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-lg tracking-tight">INITIUM</span>
                        </div>
                        <Sheet>
                            <SheetTrigger asChild>
                                <button className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                    {user?.photoURL ? <img src={user.photoURL} className="w-full h-full rounded-full" /> : <span className="font-bold">{user?.username?.[0]}</span>}
                                </button>
                            </SheetTrigger>
                            <SheetContent side="right" className="bg-background/95 backdrop-blur-xl border-l-white/10">
                                {/* ... Mobile Menu Content ... */}
                                <div className="flex flex-col h-full pt-8">
                                    <div className="flex items-center gap-3 mb-8 p-4 bg-white/5 rounded-xl border border-white/5">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold">
                                            {user?.username?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{user?.username}</p>
                                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {secondaryNavItems.map(item => (
                                            <Link key={item.path} to={item.path} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                                                <item.icon className="w-5 h-5 text-primary" />
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                    <div className="mt-auto">
                                        <Button variant="ghost" className="w-full justify-start gap-2 text-destructive" onClick={logout}>
                                            <LogOut className="w-4 h-4" /> Déconnexion
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Page Content Injection */}
                    <div className="max-w-[1600px] mx-auto w-full animate-scale-in">
                        {isGuestMode && (
                            <div className="mb-6 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-sm flex items-center justify-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                Mode Invité - Les données sont stockées uniquement sur cet appareil.
                            </div>
                        )}
                        {children}
                    </div>
                </main>

                <QuickActionFab />
            </div>
        </div>
    );
};

export default Layout;
