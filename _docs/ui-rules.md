# HoloCoach UI Rules & Design Principles

> Comprehensive guidelines for creating a responsive, intuitive, and efficient user interface for chess analysis.

---

## Core Design Philosophy

### Minimalist Functionality
- **Every element must justify its existence** - if it doesn't aid chess analysis, remove it
- **Progressive disclosure** - show advanced features only when needed
- **Content over chrome** - the chess game and analysis are the stars
- **Quiet interface** - the UI should fade into the background during analysis

---

## Responsive Design Principles

### Desktop-First Responsive Strategy
```scss
// Breakpoints for panel management
$breakpoint-compact: 1200px;  // Stack panels vertically
$breakpoint-standard: 1440px; // Comfortable 3-panel layout
$breakpoint-wide: 1920px;     // Spacious layout with larger board
$breakpoint-ultra: 2560px;    // Scale up for 4K displays
```

### Panel Behavior Rules
1. **Above 1440px**: Full 3-panel horizontal layout
2. **1200px - 1440px**: Reduce panel padding, shrink fonts slightly
3. **Below 1200px**: Stack panels with priority:
   - Game Analyzer (full width)
   - AI Tutor Chat (collapsible drawer)
   - Games List (collapsible sidebar)

### Flexible Grid System
```scss
// Base unit for consistent scaling
$base-unit: 8px;

// Panel width ratios
.app-layout {
  display: grid;
  grid-template-columns: 
    minmax(240px, 1fr)    // Games list
    minmax(480px, 2.5fr)  // Game analyzer
    minmax(320px, 1.2fr); // AI chat
  gap: $base-unit * 2;
  
  @media (max-width: $breakpoint-compact) {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
}
```

---

## Component Design Patterns

### 1. Games List Panel
```typescript
interface GameCardRules {
  minHeight: '72px';
  padding: '12px 16px';
  hoverState: 'subtle background change only';
  activeState: 'left border accent';
  truncation: 'single line with ellipsis';
}
```

**Responsive Behavior:**
- Collapse to icon + result at narrow widths
- Show full details at standard widths
- Add opening ECO codes at wide widths

### 2. Chess Board Component
```typescript
interface ChessBoardRules {
  aspectRatio: '1:1';
  minSize: '400px';
  maxSize: '600px';
  coordMargins: '24px';
  pieceScaling: 'proportional to square size';
}
```

**Responsive Scaling:**
```scss
.chess-board {
  width: 100%;
  max-width: min(600px, 60vh);
  aspect-ratio: 1;
  
  @media (min-width: $breakpoint-wide) {
    max-width: min(720px, 70vh);
  }
}
```

### 3. Move List Component
```typescript
interface MoveListRules {
  layout: 'two-column for move pairs';
  scrollBehavior: 'auto-scroll to current move';
  highlighting: 'current move with subtle background';
  notation: 'figurine algebraic by default';
}
```

### 4. Analysis Cards
```typescript
interface AnalysisCardRules {
  maxWidth: '100%';
  padding: '16px';
  borderRadius: '4px';
  shadow: 'minimal - 0 1px 3px rgba(0,0,0,0.1)';
  animation: 'none - appear instantly';
}
```

---

## Interaction Patterns

### Click Behaviors
- **Single click**: Select/navigate
- **Double click**: Open detailed view
- **Right click**: Context menu (sparingly)
- **Drag**: Only for moving pieces during analysis

### Keyboard Navigation
```typescript
const keyboardShortcuts = {
  // Game navigation
  'ArrowLeft': 'Previous move',
  'ArrowRight': 'Next move',
  'ArrowUp': 'Previous variation',
  'ArrowDown': 'Next variation',
  'Home': 'Go to start',
  'End': 'Go to end',
  
  // Panel management
  'Cmd/Ctrl+1': 'Focus games panel',
  'Cmd/Ctrl+2': 'Focus board',
  'Cmd/Ctrl+3': 'Focus chat',
  'Cmd/Ctrl+\\': 'Toggle panel',
  
  // Analysis
  'Space': 'Play/pause auto-play',
  'A': 'Request analysis',
  'F': 'Flip board',
};
```

### Focus Management
- **Tab order**: Logical left-to-right, top-to-bottom
- **Focus indicators**: Visible but subtle (2px outline)
- **Skip links**: Hidden but available for screen readers
- **Focus trap**: In modals and dialogs only

---

## Information Hierarchy

### Visual Weight Order
1. **Chess board** - Largest visual element
2. **Current move explanation** - High contrast, prominent position
3. **Move quality indicators** - Color-coded, consistent
4. **Navigation controls** - Accessible but not dominant
5. **Metadata** - Smallest text, muted colors

### Typography Hierarchy
```scss
.heading-primary {    // Panel titles
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.heading-secondary {  // Section headers
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.body-text {         // General content
  font-size: 0.875rem;
  line-height: 1.5;
}

.notation {          // Chess moves
  font-family: monospace;
  font-size: 0.875rem;
  font-weight: 500;
}

.metadata {          // Timestamps, ratings
  font-size: 0.75rem;
  color: var(--text-muted);
}
```

---

## Loading & Empty States

### Loading Patterns
```typescript
interface LoadingRules {
  // Use skeleton screens for layout stability
  skeleton: {
    animation: 'subtle pulse';
    color: 'slightly darker than background';
    timing: '1.5s ease-in-out';
  };
  
  // Progress indicators for long operations
  progress: {
    style: 'linear bar';
    position: 'top of relevant panel';
    color: 'primary accent';
  };
}
```

### Empty States
- **No games**: "Sync your games to begin" with action button
- **No analysis**: Board in starting position with hint overlay
- **No chat history**: Suggested questions based on current position

---

## Performance Guidelines

### Render Optimization
1. **Virtualize long lists** - Only render visible games
2. **Memoize chess board** - Prevent unnecessary re-renders
3. **Lazy load panels** - Load chat/games on demand
4. **Debounce updates** - 100ms for move navigation

### Animation Rules
```scss
// Minimize animations for performance and focus
$transition-fast: 150ms ease-out;
$transition-normal: 250ms ease-out;

// Only animate these properties
.animatable {
  transition-property: opacity, transform, background-color;
  transition-duration: $transition-fast;
}

// Respect user preferences
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Accessibility Standards

### WCAG Compliance
- **Contrast ratios**: AA minimum (4.5:1), AAA preferred (7:1)
- **Touch targets**: Minimum 44x44px
- **Keyboard access**: All interactive elements reachable
- **Screen reader**: Proper ARIA labels and live regions

### Chess-Specific Accessibility
```html
<!-- Accessible move notation -->
<button 
  class="move-notation"
  aria-label="Move 15, Knight captures on f6, check"
  aria-describedby="move-15-analysis"
>
  15.Nxf6+
</button>

<!-- Board square accessibility -->
<div 
  class="square"
  role="button"
  aria-label="e4 square, white pawn"
  tabindex="0"
>
```

---

## Error Handling UI

### Error Display Rules
1. **Inline errors**: Near the affected component
2. **Non-blocking**: Don't prevent other features from working
3. **Actionable**: Always provide a recovery path
4. **Persistent but dismissible**: For important errors

### Error Message Patterns
```typescript
interface ErrorUI {
  // Network errors
  network: "Unable to sync games. Check your connection and try again.";
  
  // Analysis errors
  analysis: "Analysis temporarily unavailable. View raw engine output?";
  
  // API limits
  rateLimit: "API limit reached. Next sync available in X minutes.";
}
```

---

## Platform-Specific Considerations

### macOS
- Respect native traffic light positions
- Use SF Pro Display for system consistency
- Support trackpad gestures for navigation

### Windows
- Account for custom scaling (100-200%)
- Use Segoe UI for native feel
- Ensure proper high-DPI support

### Linux
- Test with both GTK and Qt themes
- Provide fallback system fonts
- Consider Wayland vs X11 differences

---

## Component State Guidelines

### Interactive States
```scss
// Base state
.interactive-element {
  cursor: pointer;
  transition: all $transition-fast;
}

// Hover - subtle indication
.interactive-element:hover {
  background-color: var(--surface-hover);
}

// Active - clear feedback
.interactive-element:active {
  transform: translateY(1px);
}

// Focus - accessible outline
.interactive-element:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

// Disabled - clearly inactive
.interactive-element:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## Testing Requirements

### Responsive Testing Matrix
- **Widths**: 1024px, 1200px, 1440px, 1920px, 2560px
- **Heights**: Consider 16:9, 16:10, 4:3 ratios
- **Zoom levels**: 75%, 100%, 125%, 150%
- **Font sizes**: Small, Medium, Large system settings

### Interaction Testing
- Keyboard-only navigation
- Screen reader compatibility
- Mouse, trackpad, and touch (if applicable)
- High contrast mode support

---

This UI rules document ensures HoloCoach provides a consistent, responsive, and accessible experience across all desktop environments while maintaining focus on efficient chess analysis. 