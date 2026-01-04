export const THEMES = {
  cosmic: {
    id: 'cosmic',
    label: "Cosmic Void (Défaut)",
    description: "L'abîme spatial sombre et élégant.",
    preview: "bg-[#0b0b14]",
    colors: {
      background: "230 15% 4%",
      foreground: "210 20% 98%",
      card: "230 15% 6%",
      primary: "260 100% 65%",   // Violet Neon
      secondary: "190 90% 50%",  // Cyan
      accent: "280 80% 60%",
      muted: "230 15% 12%"
    }
  },
  zen: {
    id: 'zen',
    label: "Zen Garden",
    description: "Clarté, nature et sérénité.",
    preview: "bg-[#f2f7f2]",
    colors: {
      background: "140 10% 98%", // Off-white green
      foreground: "140 30% 15%", // Dark green
      card: "0 0% 100%",         // Pure white
      primary: "142 70% 45%",    // Green Leaf
      secondary: "35 80% 60%",   // Earth/Sand
      accent: "142 70% 45%",
      muted: "140 20% 94%"
    }
  },
  oceanic: {
    id: 'oceanic',
    label: "Deep Ocean",
    description: "Les profondeurs calmes du bleu.",
    preview: "bg-[#0f172a]",
    colors: {
      background: "220 30% 10%", // Dark Blue
      foreground: "210 40% 98%",
      card: "220 30% 15%",
      primary: "190 90% 60%",    // Cyan Light
      secondary: "260 60% 70%",  // Soft Purple
      accent: "190 90% 50%",
      muted: "220 30% 20%"
    }
  },
  sunset: {
    id: 'sunset',
    label: "Solar Flare",
    description: "L'énergie chaleureuse du crépuscule.",
    preview: "bg-[#2a1010]",
    colors: {
      background: "20 30% 8%",   // Deep Red/Brown
      foreground: "20 40% 98%",
      card: "20 30% 12%",
      primary: "16 90% 60%",     // Orange/Red
      secondary: "45 90% 60%",   // Yellow
      accent: "16 90% 60%",
      muted: "20 30% 16%"
    }
  },
  cyberpunk: {
    id: 'cyberpunk',
    label: "Night City",
    description: "Néons agressifs et contrastes forts.",
    preview: "bg-[#050505]",
    colors: {
      background: "0 0% 2%",     // Pitch Black
      foreground: "0 0% 90%",
      card: "0 0% 8%",
      primary: "300 100% 50%",   // Magenta Neon
      secondary: "60 100% 50%",  // Yellow Neon
      accent: "180 100% 50%",    // Cyan Neon
      muted: "0 0% 15%"
    }
  }
};

export const applyTheme = (themeId) => {
  const theme = THEMES[themeId] || THEMES['cosmic'];
  const root = document.documentElement;

  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });

  // Handle dark mode class for Tailwind if needed (Zen is light)
  if (themeId === 'zen') {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  } else {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  }

  localStorage.setItem('app-theme', themeId);
};

export const getCurrentTheme = () => {
  return localStorage.getItem('app-theme') || 'cosmic';
};
