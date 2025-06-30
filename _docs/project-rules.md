# HoloCoach Project Rules & Coding Standards

> Comprehensive guidelines for maintaining an AI-first, modular, and scalable codebase optimized for both human and AI comprehension.

---

## AI-First Development Principles

### Core Philosophy
1. **Self-Documenting Code** - Code should explain itself through clear naming and structure
2. **Context-Rich Files** - Each file must provide complete context without requiring extensive navigation
3. **Predictable Patterns** - Consistent patterns enable AI tools to understand and modify code efficiently
4. **Atomic Modules** - Single-responsibility modules that can be understood in isolation

### File Size Constraints
- **Maximum 500 lines per file** - Ensures AI tools can process entire file context
- **Target 200-300 lines** - Optimal for comprehension and modification
- **Split at logical boundaries** - Never split just to meet line limits

---

## Project Directory Structure

```
holocoach/
├── .github/                    # GitHub-specific configuration
│   └── workflows/             # CI/CD workflows
├── _docs/                     # Project documentation
│   ├── project-overview.md
│   ├── tech-stack.md
│   ├── user-flow.md
│   ├── ui-rules.md
│   ├── theme-rules.md
│   └── project-rules.md
├── src/
│   ├── main/                  # Electron main process
│   │   ├── index.ts          # Main process entry point
│   │   ├── ipc/             # IPC handlers
│   │   ├── services/        # Background services
│   │   └── utils/           # Main process utilities
│   ├── renderer/             # Electron renderer process (React app)
│   │   ├── index.tsx        # Renderer entry point
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page-level components
│   │   ├── stores/          # State management (Zustand)
│   │   ├── styles/          # Global styles and theme
│   │   └── utils/           # Renderer utilities
│   ├── shared/               # Shared between main/renderer
│   │   ├── types/           # TypeScript type definitions
│   │   ├── constants/       # Shared constants
│   │   └── utils/           # Shared utilities
│   ├── langgraph/           # LangGraph workflows
│   │   ├── graphs/          # Graph definitions
│   │   ├── nodes/           # Individual node implementations
│   │   ├── edges/           # Edge conditions and routing
│   │   └── state/           # State type definitions
│   ├── chess/               # Chess-specific logic
│   │   ├── engine/          # Stockfish integration
│   │   ├── parser/          # PGN parsing
│   │   ├── analysis/        # Move analysis logic
│   │   └── notation/        # Chess notation utilities
│   └── api/                 # External API integrations
│       ├── chess-com/       # Chess.com API client
│       ├── lichess/         # Lichess API client
│       └── openai/          # OpenAI integration
├── public/                   # Static assets
├── tests/                    # Test files
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/                # End-to-end tests
├── scripts/                  # Build and utility scripts
├── package.json
├── tsconfig.json
├── electron-builder.json
└── README.md
```

---

## File Naming Conventions

### General Rules
```typescript
// ✅ GOOD - Descriptive and specific
gameAnalysisWorkflow.ts
chessBoardComponent.tsx
stockfishEnginePool.ts
moveQualityAnalyzer.ts

// ❌ BAD - Too generic or unclear
workflow.ts
board.tsx
pool.ts
analyzer.ts
```

### Naming Patterns by Type

| File Type | Pattern | Example |
|-----------|---------|---------|
| React Component | PascalCase + Component | `ChessBoardComponent.tsx` |
| React Hook | camelCase + Hook | `useGameAnalysis.ts` |
| LangGraph Node | camelCase + Node | `gamePollerNode.ts` |
| Service/Manager | PascalCase + Service/Manager | `DatabaseManager.ts` |
| Utility | camelCase + Util/Helper | `pgnParserUtil.ts` |
| Type Definition | PascalCase + Types | `GameAnalysisTypes.ts` |
| Constants | UPPER_SNAKE + Constants | `CHESS_CONSTANTS.ts` |
| Test File | [filename].test.ts | `gameParser.test.ts` |

---

## Code Documentation Standards

### File Headers
Every file must start with a comprehensive header:

```typescript
/**
 * @fileoverview Chess board component that handles game visualization and user interactions
 * @module renderer/components/chess
 * 
 * This component:
 * - Renders an interactive chess board using the minimalist theme
 * - Handles piece movement and board interactions
 * - Integrates with Stockfish for move validation
 * - Provides accessibility features for screen readers
 * 
 * @requires react
 * @requires chess.js
 * @requires @/hooks/useGameState
 * @requires @/styles/chess-board.scss
 */
```

### Function Documentation
All exported functions must have JSDoc/TSDoc:

```typescript
/**
 * Analyzes a chess position using Stockfish engine
 * 
 * @param {string} fen - FEN string representing the position
 * @param {AnalysisOptions} options - Analysis configuration
 * @param {number} options.depth - Search depth (default: 12)
 * @param {number} options.multiPV - Number of variations (default: 1)
 * @param {number} options.timeLimit - Max analysis time in ms
 * 
 * @returns {Promise<AnalysisResult>} Analysis with evaluation and best moves
 * 
 * @throws {EngineError} If Stockfish initialization fails
 * @throws {InvalidPositionError} If FEN is invalid
 * 
 * @example
 * const result = await analyzePosition(
 *   'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
 *   { depth: 16, multiPV: 3 }
 * );
 */
export async function analyzePosition(
  fen: string,
  options: AnalysisOptions
): Promise<AnalysisResult> {
  // Implementation
}
```

### Interface/Type Documentation

```typescript
/**
 * Represents a complete game analysis state in the LangGraph workflow
 * 
 * @interface GameAnalysisState
 * @since 1.0.0
 */
export interface GameAnalysisState {
  /** Unique identifier for the game */
  gameId: string;
  
  /** Raw PGN data from chess platform */
  pgn: string;
  
  /** Stockfish analysis results indexed by move number */
  engineAnalysis?: Record<number, MoveAnalysis>;
  
  /** GPT-generated annotations for critical moves */
  annotations?: GPTAnnotation[];
  
  /** Current processing status */
  status: 'pending' | 'analyzing' | 'complete' | 'error';
  
  /** Error details if analysis failed */
  error?: AnalysisError;
}
```

---

## Component Organization Rules

### React Component Structure
```typescript
/**
 * @fileoverview [Component description]
 */

// 1. Imports - grouped and ordered
import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import type { ChessPosition } from '@/shared/types';

// 2. Constants
const BOARD_SIZE = 8;
const PIECE_TRANSITION_MS = 150;

// 3. Types/Interfaces (if component-specific)
interface ChessBoardProps {
  position: ChessPosition;
  onMove: (move: ChessMove) => void;
  disabled?: boolean;
}

// 4. Component definition
export const ChessBoard: React.FC<ChessBoardProps> = ({
  position,
  onMove,
  disabled = false
}) => {
  // 5. State declarations
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  
  // 6. Hooks
  const { currentGame, updatePosition } = useGameStore();
  
  // 7. Effects
  useEffect(() => {
    // Effect logic
  }, [position]);
  
  // 8. Handlers
  const handleSquareClick = (square: string) => {
    // Handler logic
  };
  
  // 9. Render helpers
  const renderSquare = (row: number, col: number) => {
    // Render logic
  };
  
  // 10. Main render
  return (
    <div className="chess-board">
      {/* JSX */}
    </div>
  );
};

// 11. Default export (if needed)
export default ChessBoard;
```

### Service/Manager Class Structure
```typescript
/**
 * @fileoverview [Service description]
 */

// 1. Imports
import { Database } from 'better-sqlite3';

// 2. Types
interface DatabaseConfig {
  path: string;
  readonly?: boolean;
}

// 3. Class definition
/**
 * Manages all database operations for HoloCoach
 * 
 * @class DatabaseManager
 * @singleton
 */
export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: Database;
  
  // 4. Constructor (private for singleton)
  private constructor(config: DatabaseConfig) {
    this.db = new Database(config.path);
    this.initialize();
  }
  
  // 5. Singleton getter
  public static getInstance(config?: DatabaseConfig): DatabaseManager {
    if (!DatabaseManager.instance) {
      if (!config) throw new Error('Config required for first initialization');
      DatabaseManager.instance = new DatabaseManager(config);
    }
    return DatabaseManager.instance;
  }
  
  // 6. Public methods
  public async saveGame(game: GameData): Promise<void> {
    // Implementation
  }
  
  // 7. Private methods
  private initialize(): void {
    // Implementation
  }
}
```

---

## Module Boundaries

### Clear Separation of Concerns
```typescript
// ✅ GOOD - Single responsibility
// File: moveQualityClassifier.ts
export function classifyMoveQuality(
  evalBefore: number,
  evalAfter: number
): MoveQuality {
  const evalDrop = evalBefore - evalAfter;
  
  if (evalDrop < 0.1) return 'best';
  if (evalDrop < 0.3) return 'good';
  if (evalDrop < 0.5) return 'inaccurate';
  if (evalDrop < 1.0) return 'mistake';
  return 'blunder';
}

// ❌ BAD - Multiple responsibilities in one file
// File: chessUtils.ts
export function parseGame() { /* ... */ }
export function analyzePosition() { /* ... */ }
export function renderBoard() { /* ... */ }
export function saveToDatabase() { /* ... */ }
```

### Import/Export Rules
```typescript
// ✅ GOOD - Named exports for clarity
export { GameAnalyzer } from './GameAnalyzer';
export type { AnalysisResult } from './types';

// ✅ GOOD - Barrel exports for public API
// File: chess/index.ts
export * from './engine';
export * from './parser';
export * from './types';

// ❌ BAD - Default exports for utilities
export default function analyzeGame() { } // Use named export instead
```

---

## State Management Patterns

### Zustand Store Organization
```typescript
/**
 * @fileoverview Game state management store
 * @module renderer/stores/gameStore
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Game, GameAnalysis } from '@/shared/types';

interface GameState {
  // State
  games: Game[];
  selectedGameId: string | null;
  analysis: Record<string, GameAnalysis>;
  
  // Actions - grouped by feature
  // Game management
  addGames: (games: Game[]) => void;
  removeGame: (gameId: string) => void;
  
  // Selection
  selectGame: (gameId: string) => void;
  clearSelection: () => void;
  
  // Analysis
  updateAnalysis: (gameId: string, analysis: GameAnalysis) => void;
  clearAnalysis: (gameId: string) => void;
}

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set, get) => ({
        // State initialization
        games: [],
        selectedGameId: null,
        analysis: {},
        
        // Action implementations
        addGames: (games) => set((state) => ({
          games: [...state.games, ...games].slice(-50)
        })),
        
        // ... other actions
      }),
      {
        name: 'game-storage',
        partialize: (state) => ({ games: state.games })
      }
    )
  )
);
```

---

## Error Handling Standards

### Consistent Error Types
```typescript
/**
 * @fileoverview Application-wide error definitions
 * @module shared/errors
 */

export class HoloCoachError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'HoloCoachError';
  }
}

export class EngineError extends HoloCoachError {
  constructor(message: string) {
    super(message, 'ENGINE_ERROR', false);
  }
}

export class APIError extends HoloCoachError {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string
  ) {
    super(message, 'API_ERROR', true);
  }
}
```

### Error Handling Pattern
```typescript
/**
 * Wraps async operations with consistent error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string
): Promise<Result<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    console.error(`Error in ${context}:`, error);
    
    if (error instanceof HoloCoachError) {
      return { 
        success: false, 
        error: error.message,
        code: error.code,
        recoverable: error.recoverable
      };
    }
    
    return { 
      success: false, 
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      recoverable: false
    };
  }
}
```

---

## Testing Conventions

### Test File Structure
```typescript
/**
 * @fileoverview Tests for game analysis workflow
 * @module tests/unit/gameAnalysis
 */

import { describe, test, expect, beforeEach, mock } from 'vitest';
import { analyzeGame } from '@/chess/analysis';
import { mockGame, mockAnalysis } from '../fixtures';

describe('GameAnalysis', () => {
  // Setup
  beforeEach(() => {
    mock.clearAll();
  });
  
  // Group related tests
  describe('analyzeGame', () => {
    test('should analyze a standard game', async () => {
      // Arrange
      const game = mockGame();
      
      // Act
      const result = await analyzeGame(game);
      
      // Assert
      expect(result).toMatchObject({
        gameId: game.id,
        status: 'complete'
      });
    });
    
    test('should handle engine errors gracefully', async () => {
      // Test implementation
    });
  });
});
```

---

## Performance Optimization Rules

### Memoization Guidelines
```typescript
// ✅ GOOD - Memoize expensive computations
const ChessBoard = React.memo(({ position, onMove }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.position.fen === nextProps.position.fen;
});

// ✅ GOOD - Memoize complex calculations
const moveQuality = useMemo(() => {
  return calculateMoveQuality(move, analysis);
}, [move.id, analysis.version]);
```

### Lazy Loading
```typescript
// ✅ GOOD - Lazy load heavy components
const ChessAnalysisPanel = lazy(() => 
  import('./components/ChessAnalysisPanel')
);

// ✅ GOOD - Code split at route level
const AnalysisPage = lazy(() => 
  import('./pages/AnalysisPage')
);
```

---

## Git Workflow Rules

### Branch Naming
```
feature/add-chess-board-component
fix/stockfish-memory-leak
refactor/langgraph-state-management
docs/update-api-documentation
```

### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)

Examples:
feat(chess): add move validation to board component
fix(api): handle rate limit errors from chess.com
docs(readme): update installation instructions
refactor(store): simplify game state management
```

---

## Build and Deployment

### Environment Variables
```typescript
// .env.example
VITE_OPENAI_API_KEY=your_api_key_here
VITE_CHESS_COM_USER_AGENT=HoloCoach/1.0
VITE_STOCKFISH_DEPTH=12
VITE_MAX_GAMES_SYNC=10
```

### Build Output Structure
```
dist/
├── main/           # Compiled main process
├── renderer/       # Compiled renderer process
├── preload/        # Compiled preload scripts
└── assets/         # Static assets
```

---

This document ensures HoloCoach maintains a clean, scalable, and AI-friendly codebase that facilitates both human and AI comprehension and modification. 