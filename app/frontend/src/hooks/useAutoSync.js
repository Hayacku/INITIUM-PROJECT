import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCloudSync } from './useCloudSyncNew';

/**
 * Hook to handle automatic synchronization on app start or login
 */
export const useAutoSync = () => {
    const { isAuthenticated, user, isGuest } = useAuth();
    const { syncAll } = useCloudSync();

    useEffect(() => {
        // Only sync if user is logged in (not guest)
        if (isAuthenticated && user && !isGuest && user.id !== 'guest') {
            const lastSync = localStorage.getItem('last_auto_sync');
            const now = Date.now();

            // Sync if not synced in the last 15 minutes
            if (!lastSync || (now - parseInt(lastSync) > 15 * 60 * 1000)) {
                syncAll().then(() => {
                    localStorage.setItem('last_auto_sync', now.toString());
                }).catch(err => {
                    console.error('Auto-sync failed:', err);
                });
            }
        }
    }, [isAuthenticated, user, isGuest, syncAll]);
};
