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
- 🔄 **Auto-syncs** your recent games from Chess.com or Lichess
- 🤖 **Analyzes** positions locally with Stockfish
- 💬 **Explains** moves in plain English using GPT-4o mini
- 🎓 **Coaches** you through an interactive chat interface
- 📊 **Tracks** your progress and patterns over time

## ✨ Features

### Core Functionality
- **Automatic Game Sync**: Fetches your last 10 games with one click
- **Local Engine Analysis**: Bundled Stockfish 16 provides instant position evaluation
- **AI Annotations**: GPT-4o mini explains critical moves in <140 characters
- **Interactive Chat**: Ask questions about any position and get context-aware answers
- **Persistent History**: SQLite database stores all games, analysis, and conversations

### User Interface
- **Three-Panel Layout**: Games list, interactive board, and AI chat
- **Responsive Design**: Adapts from 1200px to 4K displays
- **Minimalist Theme**: Clean, distraction-free interface
- **Dark Mode**: Easy on the eyes during long study sessions

### Advanced Features (Enhancement Phase)
- System tray integration with background sync
- Desktop notifications for completed analysis
- Pattern recognition across your games
- Opening repertoire analysis
- Study mode with spaced repetition

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Desktop Framework**: Electron 28
- **Chess Engine**: Stockfish 16 (WASM)
- **AI/LLM**: OpenAI GPT-4o mini
- **Workflow Engine**: LangGraph
- **State Management**: Zustand
- **Database**: SQLite (better-sqlite3)
- **Styling**: SCSS with CSS Custom Properties

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Git
- OpenAI API key (for AI features)
- Chess.com or Lichess username

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/holocoach.git
cd holocoach
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Add your configuration to `.env`:
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_CHESS_COM_USERNAME=your_username
VITE_STOCKFISH_DEPTH=12
```

5. Start development server:
```bash
npm run dev
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

1. **Launch HoloCoach** - The app opens with three panels
2. **Enter your chess platform username** - In Settings
3. **Click "Sync Games"** - Fetches your recent games
4. **Select a game** - Click any game to load and analyze
5. **Navigate moves** - Use arrow keys or click notation
6. **Ask questions** - Type in the chat panel for AI insights

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `←/→` | Navigate moves |
| `↑/↓` | Jump to mistakes |
| `Space` | Play through game |
| `Cmd/Ctrl+K` | Focus chat |
| `F` | Flip board |

## 🏗️ Architecture

HoloCoach uses a LangGraph workflow engine to orchestrate the analysis pipeline:

```
Game Sync → Parse PGN → Stockfish Analysis → GPT Annotations → UI Update
```

The application follows a three-layer architecture:
- **Main Process**: Handles file system, database, and external APIs
- **Renderer Process**: React UI with strict security isolation
- **Preload Scripts**: Secure bridge between main and renderer

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](_docs/CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the coding standards in [`_docs/project-rules.md`](_docs/project-rules.md)
4. Commit your changes (`git commit -m 'feat(scope): add amazing feature'`)
5. Push to your fork (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Code Style
- TypeScript with strict mode
- Functional React components
- Maximum 500 lines per file
- Comprehensive JSDoc comments

## 📝 Documentation

- [Project Overview](_docs/project-overview.md)
- [User Flow](_docs/user-flow.md)
- [Tech Stack Details](_docs/tech-stack.md)
- [UI Design Rules](_docs/ui-rules.md)
- [Theme System](_docs/theme-rules.md)
- [Development Phases](_docs/phases/)

## 🐛 Troubleshooting

### Common Issues

**Stockfish not loading**
```bash
# Ensure SharedArrayBuffer headers are enabled
npm run dev -- --enable-features=SharedArrayBuffer
```

**Database locked error**
- Close any other instances of HoloCoach
- Delete `holocoach.db-wal` and `holocoach.db-shm` files

**High memory usage**
- Reduce analysis depth in Settings
- Enable low-memory mode

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Stockfish](https://stockfishchess.org/) - Open source chess engine
- [Chess.js](https://github.com/jhlywa/chess.js) - Chess move validation
- [OpenAI](https://openai.com/) - GPT-4o mini API
- Chess.com and Lichess for their public APIs

---

Built with ♟️ by chess players, for chess players. 