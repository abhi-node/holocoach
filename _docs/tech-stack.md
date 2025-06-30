# HoloCoach Tech Stack Guide

> Essential best practices, limitations, and conventions for the HoloCoach technology stack.

## Table of Contents
1. [Electron + React (TypeScript)](#1-electron--react-typescript)
2. [LangGraph Workflow Engine](#2-langgraph-workflow-engine)
3. [Stockfish Chess Engine](#3-stockfish-chess-engine)
4. [GPT-4o mini (OpenAI SDK)](#4-gpt-4o-mini-openai-sdk)
5. [SQLite Database](#5-sqlite-database)
6. [Chess Platform APIs](#6-chess-platform-apis)
7. [State Management](#7-state-management)

---

## 1. Electron + React (TypeScript)

### Security Best Practice
```typescript
// Always use context isolation and preload scripts
webPreferences: {
  contextIsolation: true,
  nodeIntegration: false,
  preload: path.join(__dirname, 'preload.js')
}

// preload.js - Expose limited APIs
contextBridge.exposeInMainWorld('chessAPI', {
  syncGames: () => ipcRenderer.invoke('sync-games'),
  analyzeGame: (pgn) => ipcRenderer.invoke('analyze-game', pgn),
});
```

### Key Limitations
- Memory overhead: ~100MB base
- Binary size: ~50MB compressed minimum
- Requires code signing for auto-updater

### Critical Pitfall: Memory Leaks
```typescript
useEffect(() => {
  const handleResult = (result) => setData(result);
  window.chessAPI.onAnalysisUpdate(handleResult);
  return () => window.chessAPI.removeAnalysisListener(handleResult); // Always cleanup!
}, []);
```

---

## 2. LangGraph Workflow Engine

### Graph Definition Pattern
```typescript
interface GameAnalysisState {
  gameId: string;
  pgn: string;
  analysis?: StockfishAnalysis;
  annotations?: GPTAnnotation[];
  error?: Error;
}

const gameAnalysisGraph = new StateGraph<GameAnalysisState>({
  channels: { gameId: null, pgn: null, analysis: null }
});

// Error handling with retry
const fetcherNode = async (state: GameAnalysisState) => {
  try {
    return { pgn: await fetchPGN(state.gameId) };
  } catch (error) {
    if (error.code === 'RATE_LIMIT') {
      await delay(Math.pow(2, state.retryCount) * 1000);
      return { error, retryCount: state.retryCount + 1 };
    }
    throw error;
  }
};
```

### Key Limitations
- No built-in persistence
- Single-threaded by default
- Memory-bound state

---

## 3. Stockfish Chess Engine

### WASM Integration
```typescript
let stockfishInstance: StockfishEngine | null = null;

export async function getStockfish(): Promise<StockfishEngine> {
  if (!stockfishInstance) {
    stockfishInstance = await Stockfish();
    await stockfishInstance.ready();
    stockfishInstance.postMessage('setoption name Threads value 4');
    stockfishInstance.postMessage('setoption name Hash value 128');
  }
  return stockfishInstance;
}

// Resource pooling for multiple analyses
class StockfishPool {
  private pool: StockfishEngine[] = [];
  private busy: Set<StockfishEngine> = new Set();
  
  async acquire(): Promise<StockfishEngine> {
    const available = this.pool.find(e => !this.busy.has(e));
    if (available) {
      this.busy.add(available);
      return available;
    }
    // Create new instance if under limit
    if (this.pool.length < 4) {
      const engine = await this.createEngine();
      this.pool.push(engine);
      this.busy.add(engine);
      return engine;
    }
    // Wait for available engine
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.acquire();
  }
}
```

### Key Limitations
- WASM ~50% slower than native
- ~50MB memory per instance
- No tablebase support

---

## 4. GPT-4o mini (OpenAI SDK)

### Prompt Engineering
```typescript
const SYSTEM_PROMPT = `You are an expert chess coach.
Rules:
- Keep explanations under 140 characters
- Use correct chess notation (Nf3, not Knight to f3)
- Be encouraging but honest about mistakes`;

// Cost optimization with caching
class GPTCostManager {
  private cache = new Map<string, string>();
  private dailyTokens = 0;
  private readonly MAX_DAILY_TOKENS = 100000;
  
  async getAnnotation(moveKey: string, prompt: string): Promise<string> {
    if (this.cache.has(moveKey)) {
      return this.cache.get(moveKey)!;
    }
    
    const estimatedTokens = Math.ceil(prompt.length / 4);
    if (this.dailyTokens + estimatedTokens > this.MAX_DAILY_TOKENS) {
      throw new Error('Daily token limit reached');
    }
    
    const response = await this.callGPT(prompt);
    this.cache.set(moveKey, response);
    this.dailyTokens += response.usage.total_tokens;
    return response.choices[0].message.content;
  }
}
```

### Key Limitations
- 60 requests/min rate limit
- $0.15/1M input, $0.60/1M output tokens
- Requires internet connection

---

## 5. SQLite Database

### Schema Design
```sql
CREATE TABLE games (
  id TEXT PRIMARY KEY,
  player_white TEXT NOT NULL,
  player_black TEXT NOT NULL,
  result TEXT CHECK(result IN ('1-0', '0-1', '1/2-1/2', '*')),
  date_played INTEGER NOT NULL,
  pgn TEXT NOT NULL,
  analyzed_at INTEGER,
  INDEX idx_date_played (date_played DESC)
);

CREATE TABLE move_analysis (
  game_id TEXT NOT NULL,
  move_number INTEGER NOT NULL,
  move_color TEXT CHECK(move_color IN ('white', 'black')),
  eval_before REAL,
  eval_after REAL,
  best_move TEXT,
  annotation TEXT,
  PRIMARY KEY (game_id, move_number, move_color),
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);
```

### Performance Configuration
```typescript
class DatabaseManager {
  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL'); // Better concurrency
    this.db.pragma('synchronous = NORMAL'); // Faster writes
    this.db.pragma('cache_size = -64000'); // 64MB cache
  }
  
  // Always use transactions for bulk operations
  importGames(games: Game[]) {
    const insert = this.db.prepare('INSERT INTO games VALUES (?, ...)');
    this.db.transaction(() => {
      games.forEach(game => insert.run(game));
    })();
  }
}
```

---

## 6. Chess Platform APIs

### Rate-Limited API Client
```typescript
class ChessComClient {
  private rateLimiter = new RateLimiter(30, 60000); // 30 req/min
  
  async getRecentGames(username: string): Promise<Game[]> {
    await this.rateLimiter.acquire();
    const archives = await this.fetch(`/player/${username}/games/archives`);
    const recentArchive = archives.archives[archives.archives.length - 1];
    const games = await this.fetch(recentArchive);
    return games.games.slice(-10).reverse();
  }
}

class RateLimiter {
  private tokens: number;
  private queue: (() => void)[] = [];
  
  constructor(private maxTokens: number, refillInterval: number) {
    this.tokens = maxTokens;
    setInterval(() => this.refill(), refillInterval);
  }
  
  async acquire(): Promise<void> {
    if (this.tokens > 0) {
      this.tokens--;
      return;
    }
    return new Promise(resolve => this.queue.push(resolve));
  }
  
  private refill() {
    this.tokens = this.maxTokens;
    while (this.tokens > 0 && this.queue.length > 0) {
      this.queue.shift()!();
      this.tokens--;
    }
  }
}
```

### API Limitations
- Chess.com: 30 req/min
- Lichess: 120 req/min
- No webhooks (must poll)

---

## 7. State Management

### Zustand Pattern (Recommended)
```typescript
interface GameStore {
  games: Game[];
  selectedGameId: string | null;
  analysis: Record<string, GameAnalysis>;
  
  addGames: (games: Game[]) => void;
  selectGame: (gameId: string) => void;
  updateAnalysis: (gameId: string, analysis: GameAnalysis) => void;
}

const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set) => ({
        games: [],
        selectedGameId: null,
        analysis: {},
        
        addGames: (newGames) => set((state) => ({
          games: [...state.games, ...newGames].slice(-50)
        })),
        
        selectGame: (gameId) => set({ selectedGameId: gameId }),
        
        updateAnalysis: (gameId, analysis) => set((state) => ({
          analysis: { ...state.analysis, [gameId]: analysis }
        })),
      }),
      { name: 'game-storage', partialize: (state) => ({ games: state.games }) }
    )
  )
);
```

---

## Critical Cross-Technology Considerations

### Performance Coordination
```typescript
class AnalysisCoordinator {
  async analyzeGame(game: Game) {
    // Parallel processing where possible
    const [engineResults, annotations] = await Promise.all([
      this.analyzeWithStockfish(game),
      this.batchAnnotate(await this.identifyCriticalMoves(game)),
    ]);
    
    // Write to database in transaction
    await this.dbWriter.transaction(async () => {
      await this.saveAnalysis(game.id, engineResults, annotations);
    });
  }
}
```

### Security Validation
```typescript
class SecurityValidator {
  static validatePGN(pgn: string): boolean {
    if (pgn.length > 100 * 1024) return false; // 100KB max
    return /^(\[.*\]\s*)*\s*\d+\./.test(pgn);
  }
  
  static sanitizeUsername(username: string): string {
    return username.replace(/[^a-zA-Z0-9_-]/g, '');
  }
}
```

### Build Configuration
```json
{
  "build": {
    "appId": "com.holocoach.app",
    "productName": "HoloCoach",
    "mac": { "category": "public.app-category.education", "hardenedRuntime": true },
    "win": { "target": "nsis" },
    "linux": { "target": "AppImage" }
  }
}
```

---

This condensed guide covers the essential patterns and pitfalls for each technology in the HoloCoach stack. 