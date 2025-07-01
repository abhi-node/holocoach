# HoloCoach UI Rules

## Design Principles
- **Justify Existence**: Every element must aid chess analysis
- **Progressive Disclosure**: Show advanced features only when needed
- **Content Over Chrome**: Game and analysis are primary focus
- **Quiet Interface**: UI fades into background during analysis

## Layout Structure
```scss
// 3-Panel Desktop Layout
.app-layout {
  display: grid;
  grid-template-columns: 
    minmax(240px, 1fr)     // Games list
    minmax(480px, 2.5fr)   // Game analyzer  
    minmax(320px, 1.2fr);  // AI chat
  gap: 16px;
}

// Responsive Breakpoints
$breakpoint-compact: 1200px;   // Stack panels
$breakpoint-standard: 1440px;  // Comfortable layout
$breakpoint-wide: 1920px;      // Spacious layout
```

## Component Rules

### Chess Board
- **Aspect Ratio**: Always 1:1
- **Size Range**: 400px min, 600px max (720px on wide screens)
- **Responsive**: `max-width: min(60vh, 600px)`

### Games List
- **Card Height**: 72px minimum
- **Hover**: Subtle background change only
- **Active**: Left border accent
- **Content**: Truncate with ellipsis

### Move List  
- **Layout**: Two columns for move pairs
- **Scroll**: Auto-scroll to current move
- **Highlight**: Current move with subtle background
- **Notation**: Figurine algebraic default

## Interaction Patterns
```typescript
// Keyboard Navigation
{
  'ArrowLeft/Right': 'Navigate moves',
  'ArrowUp/Down': 'Navigate variations', 
  'Home/End': 'Jump to start/end',
  'Space': 'Play/pause auto-play',
  'Cmd+1/2/3': 'Focus panels',
  'F': 'Flip board'
}
```

## Information Hierarchy
1. **Chess Board** - Largest visual element
2. **Current Move Explanation** - High contrast, prominent
3. **Move Quality Indicators** - Color-coded
4. **Navigation Controls** - Accessible but not dominant  
5. **Metadata** - Smallest text, muted colors

## Loading States
- **Skeleton Screens**: For layout stability  
- **Progress Bars**: For long operations (top of panel)
- **Empty States**: 
  - No games: "Sync your games to begin"
  - No analysis: Board with hint overlay
  - No chat: Suggested questions

## Performance Guidelines
- **Virtualize**: Long game lists
- **Memoize**: Chess board component
- **Lazy Load**: Chat/games panels on demand
- **Debounce**: Move navigation (100ms)

## Responsive Behavior
- **>1440px**: Full 3-panel layout
- **1200-1440px**: Reduce padding, smaller fonts
- **<1200px**: Stack panels priority order:
  1. Game Analyzer (full width)
  2. AI Chat (collapsible drawer) 
  3. Games List (collapsible sidebar)

## Error Handling
- **Inline**: Near affected component
- **Non-blocking**: Don't prevent other features
- **Actionable**: Always provide recovery path
- **Examples**:
  - Network: "Unable to sync. Check connection and retry."
  - Analysis: "Analysis unavailable. View raw engine output?"
  - Rate limit: "API limit reached. Next sync in X minutes."

## Accessibility
- **Tab Order**: Left-to-right, top-to-bottom
- **Focus Indicators**: 2px outline, 2px offset
- **Touch Targets**: 44x44px minimum
- **ARIA Labels**: Descriptive for chess moves
- **Skip Links**: Available for screen readers 