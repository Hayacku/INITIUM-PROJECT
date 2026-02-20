import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from './ui/command';
import {
    Sword,
    CheckCircle2,
    FolderKanban,
    StickyNote,
    Search
} from 'lucide-react';
import { db } from '../lib/db';

export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [results, setResults] = useState({
        quests: [],
        habits: [],
        projects: [],
        notes: []
    });
    const navigate = useNavigate();

    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    useEffect(() => {
        if (!open) return;

        // Simple search implementation: fetch all names/titles and filter client-side 
        // (Optimization: use a real search index or db query with limit)
        const fetchData = async () => {
            try {
                const [quests, habits, projects, notes] = await Promise.all([
                    db.quests.toArray(),
                    db.habits.toArray(),
                    db.projects.toArray(),
                    db.notes.toArray()
                ]);

                setResults({
                    quests: quests.map(q => ({ id: q.id, title: q.title, type: 'quest' })),
                    habits: habits.map(h => ({ id: h.id, title: h.title, type: 'habit' })),
                    projects: projects.map(p => ({ id: p.id, title: p.title, type: 'project' })),
                    notes: notes.map(n => ({ id: n.id, title: n.title, type: 'note' }))
                });

            } catch (error) {
                console.error("Search data fetch failed", error);
            }
        };

        fetchData();
    }, [open]);

    const handleSelect = (id, type) => {
        setOpen(false);
        switch (type) {
            case 'quest':
                navigate(`/quests?id=${id}`); // Or however quests are linked
                break;
            case 'habit':
                navigate(`/habits`); // Habits page usually doesn't have deep linking ID yet, maybe just go there
                break;
            case 'project':
                navigate(`/projects/${id}`);
                break;
            case 'note':
                navigate(`/notes/${id}`);
                break;
            default:
                break;
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-4 right-4 md:bottom-8 md:right-8 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all z-50 md:hidden"
                aria-label="Search"
            >
                <Search className="h-6 w-6" />
            </button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Rechercher partout..." />
                <CommandList>
                    <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>

                    {results.quests.length > 0 && (
                        <CommandGroup heading="Quêtes">
                            {results.quests.map((item) => (
                                <CommandItem key={item.id} onSelect={() => handleSelect(item.id, 'quest')}>
                                    <Sword className="mr-2 h-4 w-4" />
                                    <span>{item.title}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    <CommandSeparator />

                    {results.projects.length > 0 && (
                        <CommandGroup heading="Projets">
                            {results.projects.map((item) => (
                                <CommandItem key={item.id} onSelect={() => handleSelect(item.id, 'project')}>
                                    <FolderKanban className="mr-2 h-4 w-4" />
                                    <span>{item.title}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    <CommandSeparator />

                    {results.habits.length > 0 && (
                        <CommandGroup heading="Habitudes">
                            {results.habits.map((item) => (
                                <CommandItem key={item.id} onSelect={() => handleSelect(item.id, 'habit')}>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    <span>{item.title}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    <CommandSeparator />

                    {results.notes.length > 0 && (
                        <CommandGroup heading="Notes">
                            {results.notes.map((item) => (
                                <CommandItem key={item.id} onSelect={() => handleSelect(item.id, 'note')}>
                                    <StickyNote className="mr-2 h-4 w-4" />
                                    <span>{item.title}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                </CommandList>
            </CommandDialog>
        </>
    );
}
