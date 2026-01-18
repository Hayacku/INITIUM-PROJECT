/**
 * INITIUM Design System - Design Tokens
 * 
 * Professional design tokens inspired by modern UI references.
 * All values use HSL for easy theme manipulation.
 */

// ============= COLOR TOKENS =============

export const colors = {
    // Primary Brand Colors
    primary: {
        50: '260 100% 95%',
        100: '260 100% 90%',
        200: '260 100% 85%',
        300: '260 100% 75%',
        400: '260 100% 70%',
        500: '260 100% 65%',   // Main brand color
        600: '260 100% 55%',
        700: '260 90% 45%',
        800: '260 80% 35%',
        900: '260 70% 25%',
        DEFAULT: '260 100% 65%'
    },

    // Neutral Grays (Dark Theme Base)
    neutral: {
        50: '230 15% 98%',
        100: '230 15% 92%',
        200: '230 15% 80%',
        300: '230 15% 65%',
        400: '230 15% 50%',
        500: '230 15% 35%',
        600: '230 15% 20%',
        700: '230 15% 12%',
        800: '230 15% 6%',
        900: '230 15% 4%',     // Main background
        950: '230 15% 2%',
        DEFAULT: '230 15% 50%'
    },

    // Semantic Colors
    success: {
        light: '142 70% 55%',
        DEFAULT: '142 70% 45%',
        dark: '142 70% 35%'
    },

    warning: {
        light: '45 90% 65%',
        DEFAULT: '45 90% 55%',
        dark: '45 90% 45%'
    },

    error: {
        light: '0 85% 70%',
        DEFAULT: '0 85% 60%',
        dark: '0 85% 50%'
    },

    info: {
        light: '190 90% 65%',
        DEFAULT: '190 90% 50%',
        dark: '190 90% 40%'
    },

    // Accent Colors
    accent: {
        cyan: '190 90% 50%',
        purple: '280 80% 60%',
        pink: '330 80% 60%',
        gold: '45 90% 60%'
    }
};

// ============= TYPOGRAPHY TOKENS =============

export const typography = {
    fonts: {
        sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        mono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
        display: '"Inter", sans-serif'
    },

    sizes: {
        xs: '0.75rem',      // 12px
        sm: '0.875rem',     // 14px
        base: '1rem',       // 16px
        lg: '1.125rem',     // 18px
        xl: '1.25rem',      // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '1.875rem',  // 30px
        '4xl': '2.25rem',   // 36px
        '5xl': '3rem',      // 48px
        '6xl': '3.75rem',   // 60px
        '7xl': '4.5rem'     // 72px
    },

    weights: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800
    },

    lineHeights: {
        none: 1,
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2
    },

    letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em'
    }
};

// ============= SPACING TOKENS =============

export const spacing = {
    0: '0',
    px: '1px',
    0.5: '0.125rem',   // 2px
    1: '0.25rem',      // 4px
    1.5: '0.375rem',   // 6px
    2: '0.5rem',       // 8px
    2.5: '0.625rem',   // 10px
    3: '0.75rem',      // 12px
    3.5: '0.875rem',   // 14px
    4: '1rem',         // 16px
    5: '1.25rem',      // 20px
    6: '1.5rem',       // 24px
    7: '1.75rem',      // 28px
    8: '2rem',         // 32px
    9: '2.25rem',      // 36px
    10: '2.5rem',      // 40px
    11: '2.75rem',     // 44px
    12: '3rem',        // 48px
    14: '3.5rem',      // 56px
    16: '4rem',        // 64px
    20: '5rem',        // 80px
    24: '6rem',        // 96px
    28: '7rem',        // 112px
    32: '8rem',        // 128px
    36: '9rem',        // 144px
    40: '10rem',       // 160px
    44: '11rem',       // 176px
    48: '12rem',       // 192px
    52: '13rem',       // 208px
    56: '14rem',       // 224px
    60: '15rem',       // 240px
    64: '16rem',       // 256px
    72: '18rem',       // 288px
    80: '20rem',       // 320px
    96: '24rem'        // 384px
};

// ============= RADIUS TOKENS =============

export const radius = {
    none: '0',
    sm: '0.375rem',    // 6px
    DEFAULT: '0.5rem', // 8px
    md: '0.75rem',     // 12px
    lg: '1rem',        // 16px
    xl: '1.5rem',      // 24px
    '2xl': '2rem',     // 32px
    full: '9999px'
};

// ============= SHADOW TOKENS =============

export const shadows = {
    // Elevation system
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',

    // Glow effects
    glow: {
        primary: '0 0 20px hsl(var(--primary) / 0.5)',
        secondary: '0 0 20px hsl(var(--secondary) / 0.5)',
        accent: '0 0 20px hsl(var(--accent) / 0.5)'
    }
};

// ============= ANIMATION TOKENS =============

export const animation = {
    durations: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
        slower: '1000ms'
    },

    easings: {
        linear: 'linear',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)', // Smooth easing for premium feel
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
};

// ============= BREAKPOINTS =============

export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
};

// ============= Z-INDEX SCALE =============

export const zIndex = {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    notification: 1080
};

// ============= EXPORT ALL =============

export const tokens = {
    colors,
    typography,
    spacing,
    radius,
    shadows,
    animation,
    breakpoints,
    zIndex
};

export default tokens;
