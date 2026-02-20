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
  const [compactMode, setCompactMode] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null); // { oldLevel, newLevel, rewards }
  const [activeTitle, setActiveTitle] = useState('Initié');
  const [activeEffect, setActiveEffect] = useState('none');

  useEffect(() => {
    (async () => {
      try {
        await initializeData();

        // Load Theme
        const storedTheme = localStorage.getItem('app-theme') || 'basique';
        setTheme(storedTheme);
        applyTheme(storedTheme);

        // Load Compact Mode
        const isCompact = localStorage.getItem('app-compact') === 'true';
        setCompactMode(isCompact);
        if (isCompact) {
          document.documentElement.classList.add('compact-mode');
        }

        // Load Appearance (Local Storage mostly for UI prefs)
        const storedAppearance = getStoredAppearance();
        setAppearance(storedAppearance);
        applyCustomAppearance(storedAppearance);

        // Charger l'utilisateur local par défaut
        let localUser = await db.users.toCollection().first();

        // Migration Patch for terminology
        if (localUser && (localUser.username === 'Explorateur' || localUser.activeTitle === 'Explorateur')) {
          const updatedUser = {
            ...localUser,
            username: localUser.username === 'Explorateur' ? 'Initié' : localUser.username,
            activeTitle: localUser.activeTitle === 'Explorateur' ? 'Initié' : localUser.activeTitle
          };
          await db.users.update(localUser.id, updatedUser);
          localUser = updatedUser;
        }

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

  const toggleCompactMode = async () => {
    const newValue = !compactMode;
    setCompactMode(newValue);
    if (newValue) {
      document.documentElement.classList.add('compact-mode');
    } else {
      document.documentElement.classList.remove('compact-mode');
    }
    localStorage.setItem('app-compact', newValue.toString());
  };

  const calculateMasteryMultiplier = (level) => {
    // +2% XP for every 5 levels
    const bonuses = Math.floor(level / 5);
    return 1 + (bonuses * 0.02);
  };

  const addXP = async (amount, source = 'general') => {
    if (!user) return;

    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
      console.error('Invalid XP amount:', amount);
      return;
    }

    const multiplier = calculateMasteryMultiplier(user.level || 1);
    const finalAmount = Math.round(amount * multiplier);

    let newXP = user.xp + finalAmount;
    let newLevel = user.level || 1;
    let xpToNextLevel = user.xpToNextLevel || 100;
    let leveledUp = false;

    // Non-linear leveling formula: 100 * level^1.5
    while (newXP >= xpToNextLevel) {
      leveledUp = true;
      newXP -= xpToNextLevel;
      newLevel += 1;
      xpToNextLevel = Math.floor(100 * Math.pow(newLevel, 1.5));
    }

    const updatedUser = {
      ...user,
      xp: newXP,
      totalXP: (user.totalXP || 0) + finalAmount,
      level: newLevel,
      xpToNextLevel
    };

    if (leveledUp) {
      setLevelUpData({
        oldLevel: user.level,
        newLevel: newLevel,
        rewards: [] // Could be populated based on level
      });
    }

    await db.users.update(user.id, updatedUser);
    setUser(updatedUser);

    // Analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAnalytics = await db.analytics
      .where('date')
      .between(today, new Date(today.getTime() + 86400000))
      .first();

    if (existingAnalytics) {
      await db.analytics.update(existingAnalytics.id, {
        xpEarned: (existingAnalytics.xpEarned || 0) + amount
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

    return { leveledUp, newLevel };
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
    setZenMode,
    compactMode,
    toggleCompactMode,
    levelUpData,
    setLevelUpData,
    activeTitle,
    setActiveTitle,
    activeEffect,
    setActiveEffect
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
