import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { db } from '../lib/db';

const HistoryContext = createContext();

export const useHistory = () => useContext(HistoryContext);

export const HistoryProvider = ({ children }) => {
    const [history, setHistory] = useState([]); // User facing history
    const [undoStack, setUndoStack] = useState([]); // For technical undo
    const [redoStack, setRedoStack] = useState([]);

    const addToHistory = useCallback((action) => {
        setHistory(prev => {
            const newHistory = [
                {
                    id: Date.now(),
                    timestamp: new Date(),
                    ...action
                },
                ...prev
            ];
            return newHistory.slice(0, 10); // Keep last 10
        });
    }, []);

    // Generic execute function to wrap actions
    // For now, we specifically target "delete" for undo
    const executeDelete = useCallback(async (collectionName, id, itemData = null) => {
        try {
            // 1. If itemData not provided, fetch it safely before delete? 
            // Better to provided it or fetch it.
            let dataToRestore = itemData;
            if (!dataToRestore) {
                // Try fetch
                dataToRestore = await db[collectionName].get(id);
            }

            if (!dataToRestore) {
                console.warn("Could not find item to delete/backup");
                return;
            }

            // 2. Perform Delete
            await db[collectionName].delete(id);

            // 3. Log to history
            addToHistory({
                type: 'delete',
                description: `Suppression de "${dataToRestore.title || 'élément'}"`,
                collection: collectionName
            });

            // 4. Add to Undo Stack
            setUndoStack(prev => [
                {
                    type: 'delete',
                    collection: collectionName,
                    data: dataToRestore,
                    timestamp: Date.now()
                },
                ...prev
            ]);

            // Clear redo stack on new action
            setRedoStack([]);

            toast.success("Élément supprimé", {
                action: {
                    label: "Annuler",
                    onClick: () => undo()
                }
            });

        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Erreur lors de la suppression");
        }
    }, [addToHistory]);

    const undo = useCallback(async () => {
        setUndoStack(prev => {
            if (prev.length === 0) return prev;

            const [action, ...rest] = prev;

            // Execute Undo Logic
            (async () => {
                if (action.type === 'delete') {
                    try {
                        await db[action.collection].add(action.data);
                        toast.success("Action annulée");
                        addToHistory({
                            type: 'undo',
                            description: `Annulation suppression "${action.data.title || 'élément'}"`
                        });
                    } catch (e) {
                        console.error("Undo failed", e);
                        toast.error("Impossible d'annuler");
                    }
                }
            })();

            return rest;
        });
    }, [addToHistory]);

    // Keyboard shortcuts for Undo
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
                if (e.shiftKey) {
                    // Redo (not implemented yet)
                } else {
                    e.preventDefault();
                    undo();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo]);

    return (
        <HistoryContext.Provider value={{
            history,
            executeDelete,
            undo,
            canUndo: undoStack.length > 0
        }}>
            {children}
        </HistoryContext.Provider>
    );
};
