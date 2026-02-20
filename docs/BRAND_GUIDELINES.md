# INITIUM Brand Guidelines — Developer Documentation

> Technical implementation guide for integrating INITIUM's visual identity into the codebase.

---

## 🎨 Color System Implementation

### Using HSL Color Tokens

All colors in INITIUM use the HSL (Hue, Saturation, Lightness) format for maximum flexibility:

```css
/* ✅ CORRECT: Using CSS variables */
background-color: hsl(var(--primary));
color: hsl(var(--primary-foreground));

/* ✅ With opacity */
background-color: hsl(var(--primary) / 0.5);
border: 1px solid hsl(var(--border) / 0.2);

/* ❌ WRONG: Hardcoding colors */
background-color: #8B5CF6; /* Never do this */
```

### Available Color Tokens

All tokens are defined in [index.css](file:///c:/INITIUM/app/frontend/src/index.css) and [themes.js](file:///c:/INITIUM/app/frontend/src/lib/themes.js):

#### Base Colors
- `--background` — Main app background
- `--foreground` — Primary text color
- `--card` — Card backgrounds
- `--card-foreground` — Text on cards

#### Interactive Colors
- `--primary` — Brand color (purple #8B5CF6)
- `--primary-foreground` — Text on primary color
- `--secondary` — Complementary color (cyan)
- `--accent` — Accent highlights
- `--muted` — Disabled/subtle elements
- `--destructive` — Danger/delete actions

#### Semantic Colors
- `--success` — Success states (green)
- `--warning` — Warning states (yellow)
- `--error` — Error states (red)
- `--info` — Info states (blue)

#### UI Elements
- `--border` — Border color
- `--input` — Input backgrounds
- `--ring` — Focus ring color

---

## 🖌️ Tailwind CSS Classes

### Pre-built Utility Classes

INITIUM includes custom Tailwind utilities for common patterns:

#### Glass Effect
```jsx
<div className="glass-card">
  {/* Your content */}
</div>
```

Equivalent to:
```css
.glass-card {
  background: rgba(15, 17, 26, 0.8);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 30px hsl(var(--primary) / 0.15);
  border-radius: 1rem;
  transition: all 300ms ease-out;
}

.glass-card:hover {
  background: rgba(19, 22, 32, 1);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 30px hsl(var(--primary) / 0.15);
}
```

#### Modern Input
```jsx
<input className="input-modern" />
```

#### Text Glow
```jsx
<h1 className="text-glow">Epic Title</h1>
<p className="text-glow-secondary">Secondary glow</p>
```

#### Animations
```jsx
<div className="animate-fade-in">Fades in smoothly</div>
<div className="animate-scale-in">Scales in</div>
<div className="animate-blob animation-delay-2000">Organic blob motion</div>
```

---

## 🎭 Component Patterns

### Cards

**Standard Card**:
```jsx
<div className="glass-card p-6 hover:scale-[1.02] transition-transform">
  <h3 className="text-xl font-semibold mb-2">Quest Title</h3>
  <p className="text-muted-foreground">Description</p>
</div>
```

**Interactive Card** (clickable):
```jsx
<button className="glass-card p-6 w-full text-left hover:scale-[1.02] transition-all duration-300">
  {/* Content */}
</button>
```

### Buttons

**Primary Button**:
```jsx
<button className="
  bg-primary text-primary-foreground 
  px-6 py-2.5 rounded-xl 
  font-medium 
  hover:bg-primary/90 
  active:scale-98 
  transition-all duration-150
  shadow-lg shadow-primary/20
">
  Start Quest
</button>
```

**Secondary Button**:
```jsx
<button className="
  bg-secondary/10 text-secondary 
  border border-secondary/20 
  px-6 py-2.5 rounded-xl 
  font-medium 
  hover:bg-secondary/20 
  hover:border-secondary/30
  transition-all duration-150
">
  Cancel
</button>
```

**Ghost Button**:
```jsx
<button className="
  text-foreground 
  px-4 py-2 rounded-lg 
  hover:bg-white/5 
  transition-colors
">
  View Details
</button>
```

### Badges

```jsx
{/* Status badge */}
<span className="
  inline-flex items-center gap-1.5 
  px-3 py-1 rounded-full 
  text-xs font-medium 
  bg-success/10 text-success 
  border border-success/20
">
  <CheckIcon className="w-3 h-3" />
  Completed
</span>

{/* Level badge */}
<span className="
  inline-flex items-center 
  px-2.5 py-0.5 rounded-md 
  text-xs font-bold 
  bg-primary/20 text-primary
">
  LVL 12
</span>
```

---

## 📱 Logo Implementation

### React Component

Create `Logo.jsx` component:

```jsx
import React from 'react';

export const Logo = ({ 
  variant = 'cosmic',  // cosmic | premium | neon | gradient
  size = 'md',          // sm | md | lg
  iconOnly = false 
}) => {
  const sizes = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16'
  };

  const logos = {
    cosmic: '/assets/logo-cosmic-purple.png',
    premium: '/assets/logo-premium-blue.png',
    neon: '/assets/logo-neon-future.png',
    gradient: '/assets/logo-gradient-elegant.png',
    light: '/assets/logo-light-background.png',
    icon: '/assets/logo-icon-only.png'
  };

  const src = iconOnly ? logos.icon : logos[variant];

  return (
    <img 
      src={src} 
      alt="INITIUM" 
      className={`${sizes[size]} w-auto`}
    />
  );
};
```

Usage:
```jsx
<Logo variant="cosmic" size="lg" />
<Logo iconOnly size="sm" />
```

### Favicon Setup

Update `public/index.html`:

```html
<head>
  <!-- Standard favicon -->
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  
  <!-- Apple Touch Icon -->
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  
  <!-- Android Chrome -->
  <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
  <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">
</head>
```

Update `public/manifest.json`:

```json
{
  "name": "INITIUM — Productivity Gamified",
  "short_name": "INITIUM",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "theme_color": "#8B5CF6",
  "background_color": "#0A0A14",
  "display": "standalone"
}
```

---

## 🎨 Theme Switching

### Using the Theme Context

```jsx
import { useApp } from '../contexts/AppContext';

function ThemeSelector() {
  const { theme, changeTheme } = useApp();

  return (
    <select 
      value={theme} 
      onChange={(e) => changeTheme(e.target.value)}
    >
      <option value="cosmic">Cosmic Void</option>
      <option value="professional">Professional Dark</option>
      <option value="minimal">Minimal Light</option>
      <option value="warm">Warm Terra</option>
      <option value="ocean">Ocean Depths</option>
      <option value="neon">Night City</option>
    </select>
  );
}
```

### Programmatic Theme Application

```javascript
import { applyTheme } from '../lib/themes';

// Apply a theme
applyTheme('cosmic');

// Get current theme
const currentTheme = localStorage.getItem('app-theme') || 'cosmic';
```

---

## ✨ Animation Best Practices

### Hover States

```jsx
// Subtle scale for cards
className="transition-transform duration-300 hover:scale-[1.02]"

// Glow on hover
className="transition-shadow hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]"

// Combined
className="transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(139,92,246,0.2)]"
```

### Loading States

```jsx
// Pulse animation
<div className="animate-pulse bg-muted h-20 rounded-xl" />

// Spinner
<div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
```

### Page Transitions

```jsx
// Fade in on mount
<div className="animate-fade-in">
  {/* Page content */}
</div>

// Stagger children animations
{items.map((item, i) => (
  <div 
    key={item.id}
    className="animate-fade-in"
    style={{ animationDelay: `${i * 50}ms` }}
  >
    {item.content}
  </div>
))}
```

---

## 📐 Spacing & Layout

### Standard Padding/Margin Scale

Use Tailwind's spacing scale (4px base):

```jsx
p-1   // 4px
p-2   // 8px
p-3   // 12px
p-4   // 16px
p-6   // 24px — Most common for cards
p-8   // 32px
p-12  // 48px
```

### Consistent Gaps

```jsx
// Stack (vertical)
<div className="flex flex-col gap-4">
  {/* Items with 16px gap */}
</div>

// Grid
<div className="grid grid-cols-3 gap-6">
  {/* Cards with 24px gap */}
</div>
```

### Max Width Container

```jsx
<div className="max-w-7xl mx-auto px-6">
  {/* Centered content, max 1280px */}
</div>
```

---

## 🔍 Accessibility Checklist

### Color Contrast

```javascript
// ✅ Good: High contrast
<p className="text-foreground">Primary text</p>

// ⚠️ Caution: Lower contrast, use for secondary only
<p className="text-muted-foreground">Secondary text</p>

// ❌ Bad: Insufficient contrast
<p className="text-white/30">Too light!</p>
```

### Focus States

Always include visible focus rings:

```jsx
<button className="
  focus:outline-none 
  focus:ring-2 
  focus:ring-primary 
  focus:ring-offset-2 
  focus:ring-offset-background
">
  Accessible Button
</button>
```

### ARIA Labels

```jsx
<button aria-label="Complete quest">
  <CheckIcon />
</button>

<input 
  type="text" 
  aria-label="Quest title"
  placeholder="Enter quest name"
/>
```

---

## 🧪 Testing Visual Consistency

### Checklist for New Components

- [ ] Uses CSS variables for colors (`hsl(var(--primary))`)
- [ ] Respects spacing scale (multiples of 4px)
- [ ] Includes hover states with transitions
- [ ] Has visible focus indicators
- [ ] Tested in both dark and light themes (if applicable)
- [ ] Maintains consistent border radius (`.rounded-xl`, `.rounded-2xl`)
- [ ] Uses shadow tokens (`shadow-lg`, custom glow shadows)
- [ ] Typography follows size/weight hierarchy
- [ ] Works on mobile (responsive breakpoints)

---

## 📦 Exporting Assets

### For Developers

Logo files located in artifacts directory:
- `logo_cosmic_purple.png` — Default brand logo
- `logo_icon_only.png` — For favicons
- `logo_light_background.png` — Light theme variant

Copy to `app/frontend/public/assets/`:

```powershell
# From project root
Copy-Item "C:\Users\venan\.gemini\antigravity\brain\69d9aeb9-3ebd-4b5b-9f00-f9d67e6a4c35\logo_*.png" -Destination "app\frontend\public\assets\"
```

### For Designers

Original concepts and design system tokens:
- [visual_identity_guide.md](file:///C:/Users/venan/.gemini/antigravity/brain/69d9aeb9-3ebd-4b5b-9f00-f9d67e6a4c35/visual_identity_guide.md)
- [tokens.js](file:///c:/INITIUM/app/frontend/src/design-system/tokens.js)

---

## 🚀 Quick Start Example

Create a new feature following brand guidelines:

```jsx
import React from 'react';
import { Rocket, Trophy, Zap } from 'lucide-react';

export const QuestCard = ({ quest }) => {
  return (
    <div className="glass-card p-6 hover:scale-[1.02] transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Rocket className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {quest.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {quest.category}
            </p>
          </div>
        </div>
        
        {/* XP Badge */}
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
          <Zap className="w-3 h-3" />
          {quest.xp} XP
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-foreground/80 mb-4">
        {quest.description}
      </p>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{quest.progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${quest.progress}%` }}
          />
        </div>
      </div>

      {/* Action Button */}
      <button className="
        w-full mt-4
        bg-primary text-primary-foreground 
        px-4 py-2.5 rounded-xl 
        font-medium 
        hover:bg-primary/90 
        active:scale-98 
        transition-all duration-150
        shadow-lg shadow-primary/20
      ">
        Start Quest
      </button>
    </div>
  );
};
```

---

**Maintenu par**: Équipe INITIUM  
**Dernière mise à jour**: 2026-01-25

*Questions? Consultez le [Visual Identity Guide](file:///C:/Users/venan/.gemini/antigravity/brain/69d9aeb9-3ebd-4b5b-9f00-f9d67e6a4c35/visual_identity_guide.md)*
