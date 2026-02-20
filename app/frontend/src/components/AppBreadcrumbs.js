import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from './ui/breadcrumb';
import { ChevronRight, Home } from 'lucide-react';

const routeNameMap = {
    '': 'Tableau de bord',
    'projects': 'Projets',
    'quests': 'Quêtes',
    'habits': 'Habitudes',
    'training': 'Entraînement',
    'notes': 'Notes',
    'settings': 'Paramètres',
    'help': 'Aide',
    'pomodoro': 'Pomodoro',
    'analytics': 'Analytique',
    'agenda': 'Agenda'
};

const AppBreadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Don't show breadcrumbs on dashboard
    if (pathnames.length === 0) return null;

    return (
        <Breadcrumb className="mb-4">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to="/">
                            <Home className="h-4 w-4" />
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>

                {pathnames.map((value, index) => {
                    const last = index === pathnames.length - 1;
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;

                    // Try to get a readable name, fallback to capitalization
                    let displayName = routeNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

                    // Handle IDs (simple heuristic: if it looks like an ID, show "Détails" or similar)
                    // For now, if it's long and alphanumeric, we might chop it or keep it. 
                    // Better approach might be to rely on the parent context or just show it as is for now.
                    if (value.length > 20 && /\d/.test(value)) {
                        displayName = "Détail";
                    }

                    return (
                        <React.Fragment key={to}>
                            <BreadcrumbItem>
                                {last ? (
                                    <BreadcrumbPage>{displayName}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link to={to}>{displayName}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!last && (
                                <BreadcrumbSeparator>
                                    <ChevronRight className="h-4 w-4" />
                                </BreadcrumbSeparator>
                            )}
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
};

export default AppBreadcrumbs;
