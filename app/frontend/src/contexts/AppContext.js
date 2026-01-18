import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, initializeData } from '../lib/db';
import { THEMES, applyTheme, applyCustomAppearance, getStoredAppearance } from '../lib/themes';
// ...existing code...

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('violet');
  const [appearance, setAppearance] = useState({});
  const [loading, setLoading] = useState(true);
  const [zenMode, setZenMode] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await initializeData();

        // Load Theme
        const themeSetting = await db.settings.get('theme');
        if (themeSetting) {
          setTheme(themeSetting.value);
          applyTheme(themeSetting.value);
        }

        // Load Appearance (Local Storage mostly for UI prefs)
        const storedAppearance = getStoredAppearance();
        setAppearance(storedAppearance);
        applyCustomAppearance(storedAppearance);

        // Charger l'utilisateur local par défaut
        const localUser = await db.users.toCollection().first();
        setUser(localUser);
      } catch (error) {
        console.error('Error initializing app:', error);
        console.error('Error Details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        if (error.inner) console.error('Inner Error:', error.inner);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Function to change theme
  const changeTheme = async (newThemeId) => {
    setTheme(newThemeId);
    applyTheme(newThemeId); // Uses the imported function from lib/themes
    await db.settings.put({ id: 'theme', key: 'theme', value: newThemeId });
  };

  const addXP = async (amount, source = 'general') => {
    if (!user) return;

    // ✅ Validation XP
    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
      console.error('Invalid XP amount:', amount);
      return;
    }

    const newXP = user.xp + amount;
    let newLevel = user.level;
    let xpToNextLevel = user.xpToNextLevel;

    if (newXP >= xpToNextLevel) {
      newLevel += 1;
      xpToNextLevel = Math.floor(xpToNextLevel * 1.5);
    }

    const updatedUser = {
      ...user,
      xp: newXP,
      level: newLevel,
      xpToNextLevel
    };

    await db.users.update(user.id, updatedUser);
    setUser(updatedUser);

    // Analytics - ✅ Normalisation de la date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAnalytics = await db.analytics
      .where('date')
      .between(today, new Date(today.getTime() + 86400000))
      .first();

    if (existingAnalytics) {
      await db.analytics.update(existingAnalytics.id, {
        xpEarned: existingAnalytics.xpEarned + amount
      });
    } else {
      await db.analytics.add({
        id: `analytics-${Date.now()}`,
        date: today,
        xpEarned: amount,
        habitsCompleted: 0,
        questsCompleted: 0
      });
    }
  };

  const updateAppearance = (newSettings) => {
    setAppearance(newSettings);
    applyCustomAppearance(newSettings);
  };

  const toggleFavorite = async (path) => {
    if (!user) return;
    const currentFavorites = user.favorites || [];
    let newFavorites;
    if (currentFavorites.includes(path)) {
      newFavorites = currentFavorites.filter(p => p !== path);
    } else {
      newFavorites = [...currentFavorites, path];
    }

    // Optimistic update
    const updatedUser = { ...user, favorites: newFavorites };
    setUser(updatedUser);

    try {
      await db.users.update(user.id, { favorites: newFavorites });
    } catch (e) {
      console.error("Failed to update favorites", e);
      // Rollback if needed, but for now simple log
    }
  };


  const value = {
    user,
    setUser,
    theme,
    changeTheme,
    appearance,
    updateAppearance,
    toggleFavorite,
    addXP,
    loading,
    zenMode,
    setZenMode
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
