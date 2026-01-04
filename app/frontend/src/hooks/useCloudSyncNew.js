import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/db';
import { toast } from 'sonner';

export const useCloudSync = () => {
  const { api, isAuthenticated } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  /**
   * Push a specific collection to cloud
   */
  const pushCollection = useCallback(async (collectionName) => {
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour synchroniser');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      setSyncing(true);

      // Get all documents from local IndexedDB
      const localData = await db[collectionName].toArray();

      if (localData.length === 0) {
        return { success: true, synced: 0 };
      }

      // Push to cloud
      const response = await api.post('/sync/push', {
        collection: collectionName,
        data: localData,
        last_sync: new Date().toISOString()
      });

      return {
        success: true,
        synced: response.data.synced_count
      };
    } catch (error) {
      console.error(`Error pushing ${collectionName}:`, error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    } finally {
      setSyncing(false);
    }
  }, [api, isAuthenticated]);

  /**
   * Pull a specific collection from cloud
   */
  const pullCollection = useCallback(async (collectionName) => {
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour synchroniser');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      setSyncing(true);

      // Pull from cloud
      const response = await api.get(`/sync/pull?collections=${collectionName}`);
      const cloudData = response.data.data[collectionName] || [];

      if (cloudData.length === 0) {
        return { success: true, pulled: 0 };
      }

      // Update local IndexedDB
      for (const doc of cloudData) {
        // Generic Date Reviver: Convert all ISO date strings to Date objects
        for (const [key, value] of Object.entries(doc)) {
          if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
            doc[key] = new Date(value);
          }
        }

        await db[collectionName].put(doc);
      }

      return {
        success: true,
        pulled: cloudData.length
      };
    } catch (error) {
      console.error(`Error pulling ${collectionName}:`, error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    } finally {
      setSyncing(false);
    }
  }, [api, isAuthenticated]);

  /**
   * Sync all collections (push then pull)
   */
  const syncAll = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour synchroniser');
      return { success: false };
    }

    try {
      setSyncing(true);
      toast.info('Synchronisation en cours...');

      const collections = [
        'quests', 'habits', 'projects', 'tasks',
        'notes', 'training', 'events', 'analytics', 'badges'
      ];

      let totalPushed = 0;
      let totalPulled = 0;

      // Push all collections
      for (const collection of collections) {
        const result = await pushCollection(collection);
        if (result.success) {
          totalPushed += result.synced || 0;
        }
      }

      // Pull all collections
      for (const collection of collections) {
        const result = await pullCollection(collection);
        if (result.success) {
          totalPulled += result.pulled || 0;
        }
      }

      setLastSync(new Date());
      toast.success(`Synchronisation terminée ! ${totalPushed} envoyés, ${totalPulled} reçus`);

      return {
        success: true,
        pushed: totalPushed,
        pulled: totalPulled
      };
    } catch (error) {
      console.error('Error syncing all:', error);
      toast.error('Erreur lors de la synchronisation');
      return { success: false };
    } finally {
      setSyncing(false);
    }
  }, [api, isAuthenticated, pushCollection, pullCollection]);

  /**
   * Migrate all local data to cloud (one-time operation)
   */
  const migrateToCloud = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour migrer');
      return { success: false };
    }

    try {
      setSyncing(true);
      toast.info('Migration des données locales vers le cloud...');

      const collections = [
        'quests', 'habits', 'projects', 'tasks',
        'notes', 'training', 'events', 'analytics', 'badges'
      ];

      const allData = {};

      // Gather all local data
      for (const collection of collections) {
        const data = await db[collection].toArray();
        if (data.length > 0) {
          allData[collection] = data;
        }
      }

      if (Object.keys(allData).length === 0) {
        toast.info('Aucune donnée locale à migrer');
        return { success: true, migrated: 0 };
      }

      // Send to cloud
      const response = await api.post('/sync/migrate', allData);

      toast.success(`Migration terminée ! ${response.data.total_synced} éléments migrés`);

      return {
        success: true,
        migrated: response.data.total_synced
      };
    } catch (error) {
      console.error('Error migrating:', error);
      toast.error('Erreur lors de la migration');
      return { success: false };
    } finally {
      setSyncing(false);
    }
  }, [api, isAuthenticated]);

  return {
    syncing,
    lastSync,
    pushCollection,
    pullCollection,
    syncAll,
    migrateToCloud
  };
};
