# HoloCoach

An interactive AI-powered chess coach that transforms post-game analysis from a tedious manual process into an instant, conversational learning experience.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![Electron](https://img.shields.io/badge/Electron-28+-teal)

## 🎯 Overview

HoloCoach is a desktop application that automatically syncs your chess games, analyzes every move with Stockfish, and provides AI-generated insights to accelerate your improvement. No more manual PGN downloads, no more deciphering engine lines—just click a game and get instant, understandable feedback.

### The Problem
After every online game, chess players typically spend 10-15 minutes:
- Downloading PGN files from chess platforms
- Running engine analysis
- Trying to understand cryptic computer variations
- Converting engine lines into actionable lessons

### The Solution
HoloCoach automates this entire workflow:
- 🤖 **Analyzes** positions locally with Stockfish
- 💬 **Explains** moves in plain English using GPT-4o mini
- 🎓 **Coaches** you through an interactive chat interface

## ✨ Features

### 🎮 Game Management
- **Multi-Platform Sync**: Retrieve games from Chess.com and Lichess automatically
- **One-Click Import**: Fetch your recent games with a single button click
- **Sample Games**: Built-in famous games for immediate analysis (Carlsen, Nakamura, etc.)

### 🔍 Advanced Analysis Engine
- **Native Stockfish Integration**: High-performance native Stockfish engine (depth 20+)
- **Real-time Evaluation**: Live position assessment with centipawn precision
- **Best Move Suggestions**: Engine-recommended moves with variations
- **Mate Detection**: Accurate mate-in-N calculations

### 📊 Move Classification & Accuracy
- **4-Tier Move Classification**:
  - ✓ **Best Move**: Engine's top recommendation (≤50cp loss)
  - ○ **Okay Move**: Solid choice (≤120cp loss)
  - ⚡ **Inaccuracy**: Suboptimal but playable (≤250cp loss)
  - ❌ **Blunder**: Significant mistake (>250cp loss)
- **Chess.com-style Accuracy**: Percentage-based accuracy calculation
- **ACPL (Average Centipawn Loss)**: Statistical performance metrics
- **Per-Player Statistics**: Separate accuracy tracking for White and Black
- **Visual Progress Bars**: Color-coded accuracy indicators

### 🎯 Interactive Analysis
- **Visual Evaluation Bar**: Real-time position assessment display
- **Move Navigation**: Navigate through games with full analysis retention
- **Position Highlighting**: Current move indication with quality symbols
- **Statistics Overview**: Game-wide performance metrics

### 🤖 AI Chess Coach
- **Conversational Analysis**: Ask questions about any position in natural language
- **Context-Aware Responses**: AI understands current game state and position
- **Humanized Explanations**: Complex engine analysis translated to plain English
- **Interactive Chat Interface**: Real-time Q&A about chess positions
- **Position-Specific Insights**: Tailored advice based on current game context

### 💻 User Interface
- **Three-Panel Layout**: Games list, game analyzer, and AI chat
- **Responsive Chess Board**: Interactive board with piece movement
- **Flip Board**: View from either player's perspective
- **Minimalist Design**: Clean, distraction-free interface focused on analysis
- **Dark/Light Themes**: Automatic theme switching with system preferences
- **Keyboard Navigation**: Full keyboard support for efficient analysis

### ⚙️ Technical Features
- **Docker Integration**: Automated AI service management with Docker Compose
- **Background Processing**: Non-blocking game analysis with progress tracking
- **Memory Management**: Efficient Stockfish instance pooling
- **Error Handling**: Robust error recovery and user feedback
- **Performance Optimization**: Lazy loading and virtualization for large datasets

## 🛠️ Tech Stack

### Core Technologies
- **Frontend**: React 18 + TypeScript
- **Desktop Framework**: Electron 28
- **State Management**: Zustand with persistence
- **Styling**: SCSS with CSS Custom Properties
- **Build System**: Vite + TypeScript

### Chess Engine
- **Native Engine**: Stockfish 16 (binary executable)
- **WASM Engine**: Stockfish.js (browser compatibility)
- **Engine Management**: Custom pooling and queue system
- **Analysis Depth**: Up to 22 levels for native engine

### AI Integration
- **LLM**: OpenAI GPT-4o mini
- **Workflow Engine**: n8n for AI request processing
- **Containerization**: Docker Compose for service management
- **API Integration**: RESTful webhooks for AI communication

### Data Management
- **Database**: SQLite with WAL mode
- **Chess Library**: Chess.js for move validation
- **PGN Parser**: Custom parser with metadata extraction
- **Game Storage**: Persistent game history and analysis

### External APIs
- **Chess.com API**: Game retrieval and player data
- **Lichess API**: Game sync and tournament data
- **Rate Limiting**: Custom rate limiter for API compliance

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** and npm/yarn
- **Docker Desktop** (for AI services)
- **Git**
- **OpenAI API key** (for AI features)
- **Chess.com or Lichess username**

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/holocoach.git
cd holocoach
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up AI services:**
```bash
cd chess-ai-agent
cp env.example .env
# Edit .env with your OpenAI API key
cd ..
```

4. **Start development (with automatic Docker management):**
```bash
npm run dev
```

This will automatically:
- Start Docker containers (n8n AI service)
- Build and launch the Electron application
- Stop Docker containers when you exit

### Manual Setup (Alternative)

If you prefer manual control:

1. **Start AI services:**
```bash
cd chess-ai-agent
docker-compose up -d
cd ..
```

2. **Build and run:**
```bash
npm run build:main
npm run dev:vite
npm run dev:electron
```

3. **Stop AI services:**
```bash
cd chess-ai-agent
docker-compose down
```

### Building for Production

```bash
# Build for current platform
npm run build

# Build for specific platform
npm run build:win
npm run build:mac
npm run build:linux
```

## 📖 Usage

### Getting Started
1. **Launch HoloCoach** - The app opens with three panels:
   - **Left Panel**: Games list and sync controls
   - **Center Panel**: Interactive chess board with analysis
   - **Right Panel**: AI chat interface

2. **Sync Your Games**:
   - Enter your Chess.com or Lichess username in the sync form
   - Click "Sync Games" to fetch your recent games
   - Or click "Load Sample Games" to explore with famous games

3. **Analyze Games**:
   - Click any game from the list to load it
   - The engine automatically analyzes all positions
   - View move-by-move accuracy and classifications

### Understanding Analysis
- **Move Symbols**: Each move is marked with quality indicators:
  - ✓ Best move (≤50cp loss)
  - ○ Okay move (≤120cp loss)  
  - ⚡ Inaccuracy (≤250cp loss)
  - ❌ Blunder (>250cp loss)

- **Accuracy Scores**: Each player gets a percentage-based accuracy score
- **Evaluation Bar**: Shows position strength throughout the game
- **Statistics**: View move quality breakdown for both players

### AI Chess Coach
- **Ask Questions**: Type natural language questions about any position
- **Context Awareness**: AI understands the current game state
- **Examples**:
  - "What's the best move here?"
  - "Why is this a blunder?"
  - "What should I have played instead?"
  - "Explain this opening"

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `←/→` | Navigate moves forward/backward |
| `Home/End` | Jump to start/end of game |
| `Space` | Auto-play through game |
| `F` | Flip board perspective |
| `Cmd/Ctrl+Enter` | Send chat message |

## 🏗️ Architecture

HoloCoach implements a sophisticated analysis pipeline with move classification:

```
Game Sync → PGN Parse → Stockfish Analysis → Move Classification → AI Chat → UI Update
```

### Analysis Pipeline
1. **Game Retrieval**: Fetch games from Chess.com/Lichess APIs
2. **PGN Processing**: Parse game metadata and moves
3. **Engine Analysis**: Stockfish evaluates every position (depth 20+)
4. **Move Classification**: 4-tier system with centipawn loss calculation
5. **Accuracy Calculation**: Chess.com-style accuracy scoring
6. **AI Integration**: Context-aware chat responses via n8n/OpenAI

### Application Architecture
- **Main Process**: File system, database, native Stockfish, and external APIs
- **Renderer Process**: React UI with strict security isolation via contextBridge
- **Preload Scripts**: Secure IPC bridge between main and renderer processes
- **Docker Services**: Containerized AI services (n8n + OpenAI integration)

### Move Classification Algorithm
The system uses a sophisticated centipawn-loss based classification:
- Evaluates position before move, after move, and after best move
- Accounts for mate positions and sign changes
- Provides both discrete categories and continuous accuracy scores

## 📝 Documentation

- [Project Overview](_docs/project-overview.md)
- [User Flow](_docs/user-flow.md)
- [Tech Stack Details](_docs/tech-stack.md)
- [UI Design Rules](_docs/ui-rules.md)
- [Theme System](_docs/theme-rules.md)
- [Development Phases](_docs/phases/)

## 🙏 Acknowledgments

- [Stockfish](https://stockfishchess.org/) - Open source chess engine powering our analysis
- [Chess.js](https://github.com/jhlywa/chess.js) - Chess move validation and game logic
- [OpenAI](https://openai.com/) - GPT-4o mini API for conversational chess coaching
- [n8n](https://n8n.io/) - Workflow automation for AI service integration
- [Chess.com](https://www.chess.com/) and [Lichess](https://lichess.org/) - Public APIs for game data
- [Electron](https://www.electronjs.org/) - Cross-platform desktop application framework
- [React](https://reactjs.org/) - UI library for building the interface

---

Built with ♟️ by chess players, for chess players. 