# HoloCoach Theme Rules - Minimalist Design System

> A comprehensive guide to colors, typography, spacing, and visual consistency for HoloCoach's minimalist theme.

---

## Theme Philosophy

### Minimalist Principles
1. **Reduction** - Remove all non-essential visual elements
2. **Clarity** - Every design decision enhances comprehension
3. **Consistency** - Predictable patterns reduce cognitive load
4. **Purpose** - Each visual element serves a functional need

---

## Color System

### Core Palette

```scss
// Primary Colors - Monochromatic base
$color-primary-900: #0F172A;    // Deep blue-black for maximum contrast
$color-primary-800: #1E293B;    // Headers in light mode
$color-primary-700: #334155;    // Primary text
$color-primary-600: #475569;    // Secondary text
$color-primary-500: #64748B;    // Muted text
$color-primary-400: #94A3B8;    // Disabled states
$color-primary-300: #CBD5E1;    // Borders
$color-primary-200: #E2E8F0;    // Dividers
$color-primary-100: #F1F5F9;    // Subtle backgrounds
$color-primary-50:  #F8FAFC;    // Hover states
$color-white:       #FFFFFF;    // Base background

// Chess Board - Traditional colors maintained
$color-board-light: #F0D9B5;    // Light squares
$color-board-dark:  #B58863;    // Dark squares
$color-board-highlight: rgba(255, 255, 0, 0.4);  // Last move
$color-board-selected: rgba(20, 85, 30, 0.5);    // Selected square

// Move Quality Indicators - Semantic colors
$color-move-best:       #059669;  // Emerald 600
$color-move-good:       #10B981;  // Emerald 500
$color-move-inaccurate: #F59E0B;  // Amber 500
$color-move-mistake:    #DC2626;  // Red 600
$color-move-blunder:    #991B1B;  // Red 800

// System Feedback
$color-success: #059669;  // Same as best move
$color-warning: #F59E0B;  // Same as inaccurate
$color-error:   #DC2626;  // Same as mistake
$color-info:    #3B82F6;  // Blue 500 - stands out intentionally

// Interactive States
$color-focus-ring: #3B82F6;      // High contrast for accessibility
$color-hover-bg: $color-primary-50;
$color-active-bg: $color-primary-100;
```

### Dark Mode Palette

```scss
// Dark mode - true black background for OLED
$dark-color-bg-base:    #000000;
$dark-color-bg-surface: #0A0A0A;
$dark-color-bg-panel:   #141414;
$dark-color-bg-hover:   #1F1F1F;

// Inverted text hierarchy
$dark-color-text-primary:   #F8FAFC;
$dark-color-text-secondary: #E2E8F0;
$dark-color-text-muted:     #94A3B8;
$dark-color-text-disabled:  #475569;

// Adjusted borders for dark mode
$dark-color-border-subtle: #1E293B;
$dark-color-border-default: #334155;
$dark-color-border-strong: #475569;

// Chess board remains consistent
// Move quality colors remain consistent (slightly adjusted for contrast)
```

### Color Usage Rules

```scss
// CSS Custom Properties for runtime switching
:root {
  // Backgrounds
  --bg-base: #{$color-white};
  --bg-surface: #{$color-primary-50};
  --bg-panel: #{$color-white};
  --bg-hover: #{$color-primary-50};
  --bg-active: #{$color-primary-100};
  
  // Text
  --text-primary: #{$color-primary-700};
  --text-secondary: #{$color-primary-600};
  --text-muted: #{$color-primary-500};
  --text-disabled: #{$color-primary-400};
  
  // Borders
  --border-subtle: #{$color-primary-200};
  --border-default: #{$color-primary-300};
  --border-strong: #{$color-primary-400};
  
  // Shadows (minimal)
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 4px 8px rgba(0, 0, 0, 0.05);
}

// Dark mode override
[data-theme="dark"] {
  --bg-base: #{$dark-color-bg-base};
  --bg-surface: #{$dark-color-bg-surface};
  --bg-panel: #{$dark-color-bg-panel};
  --bg-hover: #{$dark-color-bg-hover};
  
  --text-primary: #{$dark-color-text-primary};
  --text-secondary: #{$dark-color-text-secondary};
  --text-muted: #{$dark-color-text-muted};
  --text-disabled: #{$dark-color-text-disabled};
  
  --border-subtle: #{$dark-color-border-subtle};
  --border-default: #{$dark-color-border-default};
  --border-strong: #{$dark-color-border-strong};
  
  // Shadows are more subtle in dark mode
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 4px 8px rgba(0, 0, 0, 0.3);
}
```

---

## Typography System

### Font Stack

```scss
// System font stack for performance and native feel
$font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                   'Helvetica Neue', Arial, sans-serif;

// Monospace for chess notation and code
$font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono',
                   Consolas, 'Courier New', monospace;

// Optional: Chess piece figurines
$font-family-chess: 'Chess Alpha', 'FreeSerif', serif;
```

### Type Scale

```scss
// Minimalist type scale - limited variations
$font-size-xs:   0.75rem;   // 12px - Metadata only
$font-size-sm:   0.875rem;  // 14px - Secondary content
$font-size-base: 1rem;      // 16px - Body text
$font-size-lg:   1.125rem;  // 18px - Subheadings
$font-size-xl:   1.25rem;   // 20px - Panel headings
$font-size-2xl:  1.5rem;    // 24px - Main title only

// Line heights
$line-height-tight:  1.25;
$line-height-normal: 1.5;
$line-height-relaxed: 1.75;

// Font weights - only three levels
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;

// Letter spacing - subtle adjustments
$letter-spacing-tight: -0.025em;
$letter-spacing-normal: 0;
$letter-spacing-wide: 0.025em;
```

### Typography Components

```scss
// Headings
.heading-1 {
  font-size: $font-size-2xl;
  font-weight: $font-weight-semibold;
  line-height: $line-height-tight;
  letter-spacing: $letter-spacing-tight;
  color: var(--text-primary);
}

.heading-2 {
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  line-height: $line-height-tight;
  letter-spacing: $letter-spacing-tight;
  color: var(--text-primary);
}

.heading-3 {
  font-size: $font-size-lg;
  font-weight: $font-weight-medium;
  line-height: $line-height-normal;
  color: var(--text-primary);
}

// Body text variations
.text-body {
  font-size: $font-size-base;
  font-weight: $font-weight-normal;
  line-height: $line-height-normal;
  color: var(--text-primary);
}

.text-body-sm {
  font-size: $font-size-sm;
  line-height: $line-height-normal;
  color: var(--text-secondary);
}

.text-caption {
  font-size: $font-size-xs;
  line-height: $line-height-normal;
  color: var(--text-muted);
  letter-spacing: $letter-spacing-wide;
}

// Chess-specific typography
.chess-notation {
  font-family: $font-family-mono;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  letter-spacing: 0.05em;
  font-variant-numeric: tabular-nums;
}

.chess-evaluation {
  font-family: $font-family-mono;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  font-variant-numeric: tabular-nums;
}
```

---

## Spacing System

### Base Unit Scale

```scss
// 8px base unit for consistent rhythm
$space-0:   0;
$space-0-5: 0.125rem;  // 2px
$space-1:   0.25rem;   // 4px
$space-2:   0.5rem;    // 8px - Base unit
$space-3:   0.75rem;   // 12px
$space-4:   1rem;      // 16px
$space-5:   1.25rem;   // 20px
$space-6:   1.5rem;    // 24px
$space-8:   2rem;      // 32px
$space-10:  2.5rem;    // 40px
$space-12:  3rem;      // 48px
$space-16:  4rem;      // 64px

// Component-specific spacing
$panel-padding: $space-6;
$card-padding: $space-4;
$button-padding-x: $space-4;
$button-padding-y: $space-2;
$input-padding-x: $space-3;
$input-padding-y: $space-2;
```

### Spacing Rules

```scss
// Consistent spacing patterns
.panel {
  padding: $panel-padding;
  
  @media (max-width: $breakpoint-compact) {
    padding: $space-4; // Reduced on mobile
  }
}

.stack {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  
  &.stack-sm { gap: $space-2; }
  &.stack-lg { gap: $space-6; }
}

.inline {
  display: flex;
  align-items: center;
  gap: $space-2;
  
  &.inline-sm { gap: $space-1; }
  &.inline-lg { gap: $space-4; }
}
```

---

## Component Styling

### Buttons

```scss
.button {
  // Base styles
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: $button-padding-y $button-padding-x;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  line-height: 1;
  border-radius: 4px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 150ms ease-out;
  
  // Primary button - minimal style
  &.button-primary {
    background-color: var(--text-primary);
    color: var(--bg-base);
    
    &:hover {
      opacity: 0.9;
    }
    
    &:active {
      transform: translateY(1px);
    }
  }
  
  // Secondary button - ghost style
  &.button-secondary {
    background-color: transparent;
    color: var(--text-primary);
    border-color: var(--border-default);
    
    &:hover {
      background-color: var(--bg-hover);
    }
  }
  
  // Text button - no borders
  &.button-text {
    background-color: transparent;
    color: var(--text-secondary);
    padding: $space-1 $space-2;
    
    &:hover {
      color: var(--text-primary);
    }
  }
}
```

### Form Elements

```scss
.input {
  width: 100%;
  padding: $input-padding-y $input-padding-x;
  font-size: $font-size-base;
  line-height: $line-height-normal;
  color: var(--text-primary);
  background-color: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: 4px;
  transition: border-color 150ms ease-out;
  
  &:hover {
    border-color: var(--border-strong);
  }
  
  &:focus {
    outline: none;
    border-color: $color-focus-ring;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: var(--text-muted);
  }
}

.select {
  @extend .input;
  appearance: none;
  background-image: url("data:image/svg+xml,..."); // Minimal chevron
  background-position: right $space-2 center;
  background-repeat: no-repeat;
  padding-right: $space-8;
}
```

### Cards & Panels

```scss
.card {
  background-color: var(--bg-panel);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  padding: $card-padding;
  
  // Minimal shadow for depth
  box-shadow: var(--shadow-sm);
  
  // No hover effects on cards - too distracting
}

.panel {
  background-color: var(--bg-surface);
  border-right: 1px solid var(--border-subtle);
  height: 100%;
  overflow-y: auto;
  
  &:last-child {
    border-right: none;
  }
}
```

### Chess-Specific Components

```scss
// Move quality badges
.move-quality {
  display: inline-flex;
  align-items: center;
  padding: $space-0-5 $space-1;
  border-radius: 2px;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  
  &.quality-best {
    color: $color-move-best;
    background-color: rgba($color-move-best, 0.1);
  }
  
  &.quality-good {
    color: $color-move-good;
    background-color: rgba($color-move-good, 0.1);
  }
  
  &.quality-inaccurate {
    color: $color-move-inaccurate;
    background-color: rgba($color-move-inaccurate, 0.1);
  }
  
  &.quality-mistake {
    color: $color-move-mistake;
    background-color: rgba($color-move-mistake, 0.1);
  }
  
  &.quality-blunder {
    color: $color-move-blunder;
    background-color: rgba($color-move-blunder, 0.1);
  }
}

// Evaluation bar
.eval-bar {
  width: 20px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    var(--bg-base) 0%,
    var(--bg-base) var(--white-percentage),
    var(--text-primary) var(--white-percentage),
    var(--text-primary) 100%
  );
  border: 1px solid var(--border-default);
  border-radius: 2px;
}
```

---

## Animation & Transitions

### Timing Functions

```scss
// Minimal, functional animations only
$ease-out: cubic-bezier(0.0, 0, 0.2, 1);
$ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

// Duration scale
$duration-75: 75ms;
$duration-150: 150ms;
$duration-200: 200ms;
$duration-300: 300ms;
```

### Animation Rules

```scss
// Only animate when it aids understanding
.transition-colors {
  transition-property: background-color, border-color, color;
  transition-duration: $duration-150;
  transition-timing-function: $ease-out;
}

.transition-opacity {
  transition-property: opacity;
  transition-duration: $duration-200;
  transition-timing-function: $ease-in-out;
}

.transition-transform {
  transition-property: transform;
  transition-duration: $duration-150;
  transition-timing-function: $ease-out;
}

// Respect user preferences
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Iconography

### Icon Guidelines
- Use system icons when possible (SF Symbols on macOS)
- Stroke width: 1.5px for consistency
- Size: 16px (small), 20px (default), 24px (large)
- Color: Inherit from parent text color

### Essential Icons Only
```scss
// Minimal icon set
$icon-sync: "↻";
$icon-check: "✓";
$icon-close: "×";
$icon-chevron-down: "⌄";
$icon-chevron-right: "›";
$icon-info: "ⓘ";
$icon-warning: "⚠";
$icon-error: "⨯";
```

---

## Accessibility Considerations

### Color Contrast Requirements
- Normal text: 4.5:1 minimum (WCAG AA)
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum
- Focus indicators: 3:1 against adjacent colors

### Focus Styles
```scss
// High contrast focus ring
*:focus-visible {
  outline: 2px solid $color-focus-ring;
  outline-offset: 2px;
}

// Alternative for dark backgrounds
[data-theme="dark"] *:focus-visible {
  outline-color: $dark-color-text-primary;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
}
```

---

This theme system provides a cohesive, minimalist visual language that prioritizes clarity and functionality while maintaining the sophistication expected in a chess analysis tool. 