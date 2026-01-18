/**
 * INITIUM Professional Theme System
 * Modern, sophisticated color palettes for production-ready UI
 */

export const THEMES = {
  cosmic: {
    id: 'cosmic',
    label: "Cosmic Void",
    description: "L'élégance spatiale sombre et raffinée",
    preview: "bg-gradient-to-br from-[#0b0b14] to-[#1a0f2e]",
    colors: {
      // Base
      background: "230 15% 4%",
      foreground: "210 20% 98%",
      card: "230 15% 6%",
      'card-foreground': "210 20% 98%",

      // Interactive
      primary: "260 100% 65%",
      'primary-foreground': "210 20% 98%",
      secondary: "190 90% 50%",
      'secondary-foreground': "230 15% 4%",
      accent: "280 80% 60%",
      'accent-foreground': "210 20% 98%",

      // UI States
      muted: "230 15% 12%",
      'muted-foreground': "215 20% 65%",
      destructive: "0 85% 60%",
      'destructive-foreground': "210 20% 98%",
      border: "230 15% 12%",
      input: "230 15% 12%",
      ring: "260 100% 65%",

      // Semantic
      success: "142 70% 50%",
      warning: "45 90% 55%",
      info: "190 90% 55%",
      error: "0 85% 60%"
    }
  },

  professional: {
    id: 'professional',
    label: "Professional Dark",
    description: "Interface moderne pour productivité maximale",
    preview: "bg-gradient-to-br from-[#0f172a] to-[#1e293b]",
    colors: {
      background: "222 47% 11%",
      foreground: "210 40% 98%",
      card: "217 33% 17%",
      'card-foreground': "210 40% 98%",

      primary: "217 91% 60%",      // Modern blue
      'primary-foreground': "210 40% 98%",
      secondary: "215 20% 65%",
      'secondary-foreground': "222 47% 11%",
      accent: "217 91% 60%",
      'accent-foreground': "210 40% 98%",

      muted: "215 20% 25%",
      'muted-foreground': "215 16% 60%",
      destructive: "0 85% 60%",
      'destructive-foreground': "210 40% 98%",
      border: "215 20% 25%",
      input: "215 20% 25%",
      ring: "217 91% 60%",

      success: "142 71% 45%",
      warning: "38 92% 50%",
      info: "188 94% 47%",
      error: "0 85% 60%"
    }
  },

  minimal: {
    id: 'minimal',
    label: "Minimal Light",
    description: "Clarté et élégance avec espaces généreux",
    preview: "bg-gradient-to-br from-[#ffffff] to-[#f8fafc]",
    colors: {
      background: "0 0% 100%",
      foreground: "222 47% 11%",
      card: "0 0% 100%",
      'card-foreground': "222 47% 11%",

      primary: "222 47% 11%",      // Dark text as primary (minimalist)
      'primary-foreground': "210 40% 98%",
      secondary: "210 40% 96%",
      'secondary-foreground': "222 47% 11%",
      accent: "210 40% 96%",
      'accent-foreground': "222 47% 11%",

      muted: "210 40% 96%",
      'muted-foreground': "215 16% 47%",
      destructive: "0 85% 60%",
      'destructive-foreground': "210 40% 98%",
      border: "214 32% 91%",
      input: "214 32% 91%",
      ring: "222 47% 11%",

      success: "142 71% 45%",
      warning: "38 92% 50%",
      info: "188 94% 42%",
      error: "0 85% 60%"
    }
  },

  warm: {
    id: 'warm',
    label: "Warm Terra",
    description: "Tons chauds et naturels pour une ambiance accueillante",
    preview: "bg-gradient-to-br from-[#2a1810] to-[#3d2817]",
    colors: {
      background: "20 30% 8%",
      foreground: "30 40% 98%",
      card: "20 30% 12%",
      'card-foreground': "30 40% 98%",

      primary: "25 90% 60%",       // Warm orange
      'primary-foreground': "30 40% 98%",
      secondary: "45 90% 60%",     // Golden yellow
      'secondary-foreground': "20 30% 8%",
      accent: "35 80% 55%",
      'accent-foreground': "30 40% 98%",

      muted: "20 30% 16%",
      'muted-foreground': "30 20% 65%",
      destructive: "0 85% 60%",
      'destructive-foreground': "30 40% 98%",
      border: "20 30% 16%",
      input: "20 30% 16%",
      ring: "25 90% 60%",

      success: "142 71% 45%",
      warning: "45 90% 60%",
      info: "190 90% 50%",
      error: "0 85% 60%"
    }
  },

  ocean: {
    id: 'ocean',
    label: "Ocean Depths",
    description: "Profondeurs marines apaisantes et sereines",
    preview: "bg-gradient-to-br from-[#0f172a] to-[#0c4a6e]",
    colors: {
      background: "220 30% 10%",
      foreground: "210 40% 98%",
      card: "220 30% 15%",
      'card-foreground': "210 40% 98%",

      primary: "190 90% 60%",      // Bright cyan
      'primary-foreground': "220 30% 10%",
      secondary: "260 60% 70%",    // Soft purple
      'secondary-foreground': "220 30% 10%",
      accent: "190 90% 50%",
      'accent-foreground': "220 30% 10%",

      muted: "220 30% 20%",
      'muted-foreground': "215 20% 65%",
      destructive: "0 85% 60%",
      'destructive-foreground': "210 40% 98%",
      border: "220 30% 20%",
      input: "220 30% 20%",
      ring: "190 90% 60%",

      success: "142 71% 45%",
      warning: "45 90% 55%",
      info: "190 90% 60%",
      error: "0 85% 60%"
    }
  },

  neon: {
    id: 'neon',
    label: "Night City",
    description: "Néons électriques et cyberpunk vibrant",
    preview: "bg-gradient-to-br from-[#050505] to-[#1a0a1a]",
    colors: {
      background: "0 0% 2%",
      foreground: "0 0% 90%",
      card: "0 0% 8%",
      'card-foreground': "0 0% 90%",

      primary: "300 100% 50%",     // Magenta neon
      'primary-foreground': "0 0% 90%",
      secondary: "60 100% 50%",    // Yellow neon
      'secondary-foreground': "0 0% 2%",
      accent: "180 100% 50%",      // Cyan neon
      'accent-foreground': "0 0% 2%",

      muted: "0 0% 15%",
      'muted-foreground': "0 0% 60%",
      destructive: "0 100% 50%",
      'destructive-foreground': "0 0% 90%",
      border: "0 0% 15%",
      input: "0 0% 15%",
      ring: "300 100% 50%",

      success: "142 100% 50%",
      warning: "60 100% 50%",
      info: "180 100% 50%",
      error: "0 100% 50%"
    }
  }
};

/**
 * Apply a theme to the document root
 * @param {string} themeId - Theme identifier
 */
export const applyTheme = (themeId) => {
  const theme = THEMES[themeId] || THEMES['cosmic'];
  const root = document.documentElement;

  // Apply all color variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });

  // Handle light/dark mode class
  const lightThemes = ['minimal'];
  if (lightThemes.includes(themeId)) {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  } else {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  }

  // Persist preference
  localStorage.setItem('app-theme', themeId);
};

/**
 * Get currently active theme
 * @returns {string} Theme ID
 */
export const getCurrentTheme = () => {
  return localStorage.getItem('app-theme') || 'cosmic';
};

/**
 * Get theme object by ID
 * @param {string} themeId
 * @returns {Object} Theme configuration
 */
/**
 * Apply custom appearance settings
 * @param {Object} settings - { primaryColor, density, font }
 */
export const applyCustomAppearance = (settings) => {
  const root = document.documentElement;

  // 1. Apply Custom Primary Color
  if (settings.primaryColor) {
    // Convert hex to HSL if necessary, but for now assuming we might receive HSL or just handle exact hex overrides
    // Simpler: Just set the variable directly if it's a valid CSS value
    // If the user picks a hex color, we need to convert it to HSL for our tokens to work (since we use HSL values in tokens)
    // For simplicity in this iteration, we'll assume the color picker returns a hex and we update a specific override variable
    // OR we convert hex to HSL here.

    // Let's rely on a CSS variable override approach using style attribute or specific class
    root.style.setProperty('--primary', settings.primaryColor); // settings.primaryColor should be "H S L" format
    root.style.setProperty('--ring', settings.primaryColor);
  }

  // 2. Apply Density
  // We can toggle a class 'compact-mode'
  if (settings.density === 'compact') {
    root.classList.add('compact-mode');
  } else {
    root.classList.remove('compact-mode');
  }

  // 3. Apply Font
  if (settings.font === 'serif') {
    root.style.setProperty('--font-sans', 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif');
  } else if (settings.font === 'mono') {
    root.style.setProperty('--font-sans', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace');
  } else {
    root.style.removeProperty('--font-sans'); // Default sans
  }

  // Persist
  localStorage.setItem('app-appearance', JSON.stringify(settings));
};

export const getStoredAppearance = () => {
  try {
    return JSON.parse(localStorage.getItem('app-appearance')) || {};
  } catch {
    return {};
  }
};

/**
 * Helper to convert Hex to HSL (H S% L%) string
 */
export const hexToHSL = (H) => {
  // Convert hex to RGB first
  let r = 0, g = 0, b = 0;
  if (H.length == 4) {
    r = "0x" + H[1] + H[1];
    g = "0x" + H[2] + H[2];
    b = "0x" + H[3] + H[3];
  } else if (H.length == 7) {
    r = "0x" + H[1] + H[2];
    g = "0x" + H[3] + H[4];
    b = "0x" + H[5] + H[6];
  }
  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

  if (delta == 0)
    h = 0;
  else if (cmax == r)
    h = ((g - b) / delta) % 6;
  else if (cmax == g)
    h = (b - r) / delta + 2;
  else
    h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0)
    h += 360;

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return `${h} ${s}% ${l}%`;
}
