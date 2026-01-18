import { useEffect } from 'react';
import { dbCloud } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/db';

// Synchronise la progression locale Dexie avec Firestore pour l'utilisateur connecté
export function useCloudSync(user) {
  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    // Télécharge la progression Firestore et remplace la locale
    async function syncFromCloud() {
      const ref = doc(dbCloud, 'progression', uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        // Exemple : remplacer la progression locale
        if (data.xp) await db.users.put({ id: uid, xp: data.xp });
        // Ajoute ici la synchronisation des autres collections
      }
    }
    syncFromCloud();
  }, [user]);

  // Fonction pour sauvegarder la progression locale vers Firestore
  async function saveToCloud(progression) {
    if (!user) return;
    const uid = user.uid;
    const ref = doc(dbCloud, 'progression', uid);
    await setDoc(ref, progression);
  }

  return { saveToCloud };
}
