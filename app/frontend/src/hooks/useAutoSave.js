import { useEffect } from 'react';
import { db } from '../lib/db';

// Hook de sauvegarde automatique pour Dexie
export function useAutoSave(collection, data, interval = 10000) {
  useEffect(() => {
    if (!collection || !data) return;
    const timer = setInterval(async () => {
      try {
        if (Array.isArray(data)) {
          for (const item of data) {
            if (item.id) await db[collection].put(item);
          }
        } else if (data.id) {
          await db[collection].put(data);
        }
      } catch (e) {
        // Optionnel: toast ou log
      }
    }, interval);
    return () => clearInterval(timer);
  }, [collection, data, interval]);
}
