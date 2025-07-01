# Phase 2: MVP - Core Chess Analysis Features

> Build the minimum viable product with functioning game sync, analysis, and basic AI assistance.

**Duration**: 5-6 days  
**Goal**: Deliver a usable chess analysis tool that can fetch games, analyze positions, and provide basic insights.

---

## Success Criteria
- [ ] Can fetch last 10 games from Chess.com or Lichess
- [ ] Chess board displays games with move navigation
- [ ] Stockfish analyzes positions and shows evaluation
- [ ] GPT provides basic move explanations
- [ ] Simple chat interface for asking questions
- [ ] Games persist in local database

---

## 1. Chess Foundation

### 1.1 Chess Board Component
**Steps**:
1. Integrate chess.js for game logic and move validation
2. Create interactive board with drag-and-drop pieces
3. Implement move highlighting and last move indicator
4. Add coordinate labels and flip board functionality
5. Connect board state to Zustand store

### 1.2 PGN Parser & Game Model
**Steps**:
1. Implement PGN parsing using chess.js
2. Create comprehensive Game and Move interfaces
3. Build move list component with notation display
4. Add FEN position tracking for each move
5. Implement game metadata extraction

### 1.3 Move Navigation
**Steps**:
1. Create move navigation controls (prev/next/start/end)
2. Implement keyboard shortcuts (arrow keys)
3. Add click-to-jump in move list
4. Sync board position with selected move
5. Add move animation transitions

---

## 2. External API Integration

### 2.1 Chess Platform Clients
**Steps**:
1. Create Chess.com API client with rate limiting
2. Create Lichess API client with rate limiting
3. Implement game fetching with error handling
4. Add field above sync games to enter username, and lichess/chess.com button
5. Create unified game format converter

### 2.2 Game Synchronization
**Steps**:
1. Build GameFetcher service in main process
2. Implement "Sync Games" button functionality - sync 10 latest games
3. Add progress indicators during sync
4. Handle duplicate game detection

### 2.3 API Error Handling
**Steps**:
1. Implement rate limit detection and backoff
2. Create user-friendly error messages
3. Add retry logic for failed requests
4. Cache successful API responses
5. Show sync status in UI

---

## 3. Chess Engine Integration

### 3.1 Stockfish WASM Setup
**Steps**:
1. Bundle Stockfish WASM with application
2. Create StockfishService wrapper class
3. Implement UCI protocol communication
4. Configure engine with optimal settings
5. Test engine initialization and commands

### 3.2 Position Analysis
**Steps**:
1. Create analysis queue for positions
2. Implement depth-based analysis (default: 12)
3. Extract best moves and evaluations
4. Calculate move quality classifications
5. Store analysis results in database

### 3.3 Analysis UI Integration
**Steps**:
1. Add evaluation bar to chess board
2. Display centipawn scores for each move
3. Show best move suggestions with arrows
4. Create move quality badges (best/good/mistake)
5. Add analysis progress indicator

---

## 4. AI Annotation System

### 4.1 OpenAI Integration
**Steps**:
1. Create OpenAI client with API key management
2. Implement secure key storage in main process
3. Build prompt templates for move explanations
4. Add request queuing and rate limiting
5. Create cost tracking mechanism

### 4.2 Move Annotation Generation
**Steps**:
1. Identify critical moves (blunders, brilliancies)
2. Generate concise explanations (<140 chars)
3. Cache annotations to minimize API calls
4. Display annotations above chess board
5. Handle API failures gracefully

### 4.3 Basic Chat Interface
**Steps**:
1. Create simple chat UI in right panel
2. Implement message history display
3. Add basic question templates
4. Connect chat to current board position
5. Store chat history in database

---

## 5. LangGraph Workflow Implementation

### 5.1 Basic Workflow Setup
**Steps**:
1. Create LangGraph configuration
2. Implement GameAnalysisWorkflow graph
3. Define state interfaces for workflow
4. Create basic node implementations
5. Add workflow execution triggers

### 5.2 Core Analysis Nodes
**Steps**:
1. GameFetcherNode - retrieves games from API
2. GameParserNode - processes PGN data
3. StockfishAnalysisNode - runs engine analysis
4. AnnotationNode - generates GPT explanations
5. PersistenceNode - saves to database

### 5.3 Workflow Orchestration
**Steps**:
1. Connect nodes with proper dependencies
2. Implement error handling between nodes
3. Add workflow status tracking
4. Create UI updates from workflow events
5. Test complete analysis pipeline

---

## 6. Data Persistence

### 6.1 Database Schema Enhancement
**Steps**:
1. Expand schema for games, moves, analysis
2. Add indexes for common queries
3. Implement database migrations
4. Create data access layer methods
5. Add database backup functionality

### 6.2 State Persistence
**Steps**:
1. Save selected game and move position
2. Persist UI preferences (panel sizes, theme)
3. Cache analysis results permanently
4. Store user's chess platform credentials
5. Implement data export functionality

---

## Deliverables

### Functional Features
- ✅ Fetch and display games from Chess.com/Lichess
- ✅ Interactive chess board with full game navigation
- ✅ Stockfish analysis with evaluation display
- ✅ AI-generated move explanations
- ✅ Basic chat for position questions
- ✅ Local storage of games and analysis

### Enhanced UI Components
```
Games Panel (Left):
- Synced games list with metadata
- Sync button with progress
- Game selection highlights

Analysis Panel (Center):
- Interactive chess board
- Move explanations area
- Move list with quality indicators
- Evaluation bar
- Navigation controls

Chat Panel (Right):
- Message history
- Input field
- Suggested questions
- Loading states
```

### Core Workflows
```typescript
// Simplified game analysis flow
User clicks "Sync" → 
  Fetch games from API → 
    Parse PGN → 
      Analyze with Stockfish → 
        Generate annotations → 
          Save to database → 
            Update UI
```

---

## Known Limitations (To Address in Enhancement)
- No background sync
- No system tray integration
- Basic error recovery
- Limited chat capabilities
- No advanced preferences
- Simple UI without polish

---

## Testing Requirements
- Manual testing of game sync from both platforms
- Verify Stockfish analysis accuracy
- Test GPT annotation quality
- Ensure data persistence works correctly
- Check error handling for API failures

---

## Migration from Phase 1
1. Preserve all Phase 1 infrastructure
2. Extend type definitions for chess concepts
3. Enhance IPC channels for new features
4. Expand database schema
5. Build on existing UI components

---

This MVP phase delivers the core value proposition: automated chess game analysis with AI-powered insights in a desktop application. 