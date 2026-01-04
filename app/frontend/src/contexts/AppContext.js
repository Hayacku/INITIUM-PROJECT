import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, initializeData } from '../lib/db';
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
  const [loading, setLoading] = useState(true);
  const [zenMode, setZenMode] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await initializeData();
        const themeSetting = await db.settings.get('theme');
        if (themeSetting) {
          setTheme(themeSetting.value);
          applyTheme(themeSetting.value);
        }
        // Charger l'utilisateur local par défaut
        const localUser = await db.users.toCollection().first();
        setUser(localUser);
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const applyTheme = (themeName) => {
    const root = document.documentElement;
    const themes = {
      violet: {
        primary: '266 100% 60%',
        secondary: '280 90% 70%',
        accent: '270 80% 65%',
        background: '0 0% 7%',
        foreground: '0 0% 98%'
      },
      bleu: {
        primary: '210 100% 55%',
        secondary: '200 90% 65%',
        accent: '220 80% 60%',
        background: '220 15% 10%',
        foreground: '0 0% 98%'
      },
      noir: {
        primary: '0 0% 90%',
        secondary: '0 0% 70%',
        accent: '0 0% 80%',
        background: '0 0% 5%',
        foreground: '0 0% 95%'
      },
      blanc: {
        primary: '220 100% 50%',
        secondary: '210 90% 60%',
        accent: '200 80% 55%',
        background: '0 0% 98%',
        foreground: '0 0% 10%'
      },
      vert: {
        primary: '142 76% 45%',
        secondary: '152 70% 55%',
        accent: '135 80% 50%',
        background: '140 20% 8%',
        foreground: '0 0% 98%'
      },
      rouge: {
        primary: '0 72% 55%',
        secondary: '10 80% 60%',
        accent: '355 75% 58%',
        background: '0 10% 9%',
        foreground: '0 0% 98%'
      },
      jaune: {
        primary: '45 93% 55%',
        secondary: '40 90% 60%',
        accent: '50 85% 50%',
        background: '40 20% 10%',
        foreground: '0 0% 98%'
      }
    };

    const selectedTheme = themes[themeName] || themes.violet;
    root.style.setProperty('--primary', selectedTheme.primary);
    root.style.setProperty('--secondary', selectedTheme.secondary);
    root.style.setProperty('--accent', selectedTheme.accent);
    root.style.setProperty('--background', selectedTheme.background);
    root.style.setProperty('--foreground', selectedTheme.foreground);
  };

  const changeTheme = async (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    await db.settings.put({ id: 'theme', key: 'theme', value: newTheme });
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

  const value = {
    user,
    setUser,
    theme,
    changeTheme,
    addXP,
    loading,
    zenMode,
    setZenMode
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
