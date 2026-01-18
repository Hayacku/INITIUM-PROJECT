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
    const { user: appUser, loading: appLoading, toggleFavorite } = useApp();
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

    // Core Navigation (Always visible in sidebar, primary in mobile)
    const coreNavItems = [
        { path: '/', icon: LayoutDashboard, label: 'Tableau de bord', testId: 'nav-dashboard', mobileOrder: 3, isCenter: true },
        { path: '/quests', icon: Target, label: 'Quêtes', testId: 'nav-quests', mobileOrder: 2 },
        { path: '/habits', icon: TrendingUp, label: 'Habitudes', testId: 'nav-habits', mobileOrder: 4 },
        { path: '/projects', icon: FolderKanban, label: 'Projets', testId: 'nav-projects', mobileOrder: 5 },
        { path: '/training', icon: Dumbbell, label: 'Entraînement', testId: 'nav-training', mobileOrder: 1 }
    ];

    // Productivity Tools (Secondary group)
    const toolsNavItems = [
        { path: '/pomodoro', icon: Timer, label: 'Pomodoro', testId: 'nav-pomodoro' },
        { path: '/agenda', icon: Calendar, label: 'Agenda', testId: 'nav-agenda' },
        { path: '/notes', icon: FileText, label: 'Notes', testId: 'nav-notes' },
        { path: '/analytics', icon: BarChart3, label: 'Analyses', testId: 'nav-analytics' }
    ];

    // System Navigation (Bottom of sidebar)
    const systemNavItems = [
        { path: '/settings', icon: SettingsIcon, label: 'Paramètres', testId: 'nav-settings' },
        { path: '/help', icon: LifeBuoy, label: "Centre d'Aide", testId: 'nav-help' }
    ];

    // Combined for sidebar (all items)
    const sidebarNavItems = [...coreNavItems, ...toolsNavItems, ...systemNavItems];

    // Mobile nav shows only core items
    const mobileNavItems = coreNavItems.sort((a, b) => a.mobileOrder - b.mobileOrder);

    // Secondary items for mobile sheet menu
    const secondaryNavItems = [...toolsNavItems, ...systemNavItems];

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
            {/* Background - Solid/Subtle instead of Blobs */}
            <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none"></div>

            <div className="relative z-10 flex w-full h-full">

                {/* --- MOBILE FLOATING NAVIGATION --- */}
                {/* --- MOBILE BOTTOM NAVIGATION (Social Style) --- */}
                <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#09090b]/95 backdrop-blur-xl border-t border-white/10 z-50 lg:hidden flex justify-around items-center px-2 pb-safe">
                    {mobileNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        // Center Action Button (e.g., Dashboard or Create)
                        if (item.isCenter) {
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="relative -top-5"
                                >
                                    <div className={`
                                        w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95
                                        bg-gradient-to-tr from-primary to-accent text-white border-4 border-[#09090b]
                                        ${isActive ? 'shadow-primary/50' : 'shadow-primary/20'}
                                    `}>
                                        <Icon className="w-6 h-6" strokeWidth={2.5} />
                                    </div>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${isActive ? 'text-primary' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* --- DESKTOP SIDEBAR --- */}
                <aside
                    className={`max-lg:hidden lg:flex fixed left-0 top-0 bottom-0 bg-[#09090b] border-r border-white/5 flex-col transition-all duration-300 z-40 overflow-hidden
            ${sidebarOpen ? 'w-64' : 'w-20'}
          `}
                    data-testid="sidebar"
                >
                    {/* Header */}
                    <div className="p-6 flex items-center h-20 mb-2">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-white flex-shrink-0 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-black" fill="currentColor" />
                            </div>
                            {sidebarOpen && (
                                <span className="font-bold text-xl tracking-tight text-white animate-fade-in whitespace-nowrap">
                                    INITIUM
                                </span>
                            )}
                        </div>
                    </div>

                    {/* User Profile - Enhanced */}
                    <div className="px-3 mb-4">
                        <div className={`relative p-3 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 ${!sidebarOpen && 'justify-center p-2.5'}`}>
                            {/* Avatar */}
                            <div className="flex items-center gap-3">
                                <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-primary via-secondary to-accent p-[2px] shrink-0 group">
                                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                                        {user?.photoURL ? (
                                            <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-bold text-gradient">{user?.username?.[0]?.toUpperCase()}</span>
                                        )}
                                    </div>
                                    {/* Online indicator */}
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background"></div>
                                </div>

                                {/* User Info */}
                                {sidebarOpen && (
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-semibold text-sm truncate text-white">{user?.username}</p>
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <span className="text-primary/90 font-mono font-semibold">Lvl {user?.level || 1}</span>
                                            <span className="text-muted-foreground">•</span>
                                            <span className="text-muted-foreground">{user?.xp || 0} XP</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* XP Progress Bar (when expanded) */}
                            {sidebarOpen && (
                                <div className="mt-3 space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Progression</span>
                                        <span className="text-primary/80 font-mono">{Math.min(100, Math.round(((user?.xp || 0) % 100) * 1))}%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(100, ((user?.xp || 0) % 100))}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Items - Grouped */}
                    <div className="flex-1 overflow-y-auto px-3 custom-scrollbar py-2">

                        {/* FAVORITES SECTION */}
                        {user?.favorites?.length > 0 && (
                            <div className="space-y-1 mb-3 animate-in slide-in-from-left-2 duration-300">
                                {sidebarOpen && (
                                    <div className="px-3 py-2 text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                                        <Sparkles className="w-3 h-3" /> Favoris
                                    </div>
                                )}
                                {sidebarNavItems.filter(item => user.favorites.includes(item.path)).map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={`fav-${item.path}`}
                                            to={item.path}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
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
                                <div className="my-3 h-px bg-white/5 mx-2"></div>
                            </div>
                        )}

                        {/* Core Navigation */}
                        <div className="space-y-1 mb-3">
                            {sidebarOpen && (
                                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Principal
                                </div>
                            )}
                            {coreNavItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                const isFav = user?.favorites?.includes(item.path);
                                return (
                                    <div key={item.path} className="relative group/item">
                                        <Link
                                            to={item.path}
                                            id={item.testId}
                                            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group relative ${isActive
                                                ? 'text-white bg-white/10 font-medium'
                                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                                }`}
                                            title={!sidebarOpen ? item.label : ''}
                                        >
                                            <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'group-hover:text-white'}`} />
                                            {sidebarOpen && <span className="text-sm">{item.label}</span>}
                                        </Link>
                                        {sidebarOpen && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    toggleFavorite(item.path);
                                                }}
                                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-white/10 ${isFav ? 'text-yellow-400 opacity-100' : 'text-muted-foreground'}`}
                                            >
                                                <Sparkles className={`w-3.5 h-3.5 ${isFav ? 'fill-yellow-400' : ''}`} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Divider */}
                        <div className="my-3 h-px bg-white/5"></div>

                        {/* Tools Navigation */}
                        <div className="space-y-1 mb-3">
                            {sidebarOpen && (
                                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Outils
                                </div>
                            )}
                            {toolsNavItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                const isFav = user?.favorites?.includes(item.path);
                                return (
                                    <div key={item.path} className="relative group/item">
                                        <Link
                                            to={item.path}
                                            id={item.testId}
                                            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group relative ${isActive
                                                ? 'text-white bg-white/10 font-medium'
                                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                                }`}
                                            title={!sidebarOpen ? item.label : ''}
                                        >
                                            <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'group-hover:text-white'}`} />
                                            {sidebarOpen && <span className="text-sm">{item.label}</span>}
                                        </Link>
                                        {sidebarOpen && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    toggleFavorite(item.path);
                                                }}
                                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-white/10 ${isFav ? 'text-yellow-400 opacity-100' : 'text-muted-foreground'}`}
                                            >
                                                <Sparkles className={`w-3.5 h-3.5 ${isFav ? 'fill-yellow-400' : ''}`} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Divider */}
                        <div className="my-3 h-px bg-white/5"></div>

                        {/* System Navigation */}
                        <div className="space-y-1">
                            {systemNavItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                const isFav = user?.favorites?.includes(item.path);
                                return (
                                    <div key={item.path} className="relative group/item">
                                        <Link
                                            to={item.path}
                                            id={item.testId}
                                            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group relative ${isActive
                                                ? 'text-white bg-white/10 font-medium'
                                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                                }`}
                                            title={!sidebarOpen ? item.label : ''}
                                        >
                                            <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'group-hover:text-white'}`} />
                                            {sidebarOpen && <span className="text-sm">{item.label}</span>}
                                        </Link>
                                        {sidebarOpen && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    toggleFavorite(item.path);
                                                }}
                                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-white/10 ${isFav ? 'text-yellow-400 opacity-100' : 'text-muted-foreground'}`}
                                            >
                                                <Sparkles className={`w-3.5 h-3.5 ${isFav ? 'fill-yellow-400' : ''}`} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
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
                    className={`flex-1 transition-all duration-300 min-h-screen flex flex-col mb-24 lg:mb-0 ml-0 w-full max-w-full
            ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} 
            p-6 lg:p-10
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
                    <div className="max-w-[1600px] mx-auto w-full animate-scale-in px-0">
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
