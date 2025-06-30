# HoloCoach Desktop – Comprehensive Project Overview

> An interactive agentic AI chess coach that transforms post-game analysis from a chore into a one-click, conversational lesson.

---

## 1. Problem Statement

After every online game you currently:
1. Open Chess.com/Lichess
2. Download the PGN
3. Run Stockfish
4. Skim dozens of engine lines
5. Try to convert them into actionable lessons

That 10-15 minute ritual breaks study flow and often gets skipped—slowing improvement.

---

## 2. Solution Vision

HoloCoach Desktop is a cross-platform (Win/macOS/Linux) desktop assistant that:
- **Auto-syncs** your 10 most-recent games from Chess.com or Lichess
- **Analyzes** every move locally with Stockfish the moment you click a game
- **Annotates** each ply in plain English ("This move allowed a fork; better was …") via GPT-4o mini
- **Chats** with you in a side panel, answering context-aware questions ("Why is 17…Nf6 bad?")
- **Runs in the background**—tray daemon polls for new games, pushes a toast when analysis is ready

Built around LangGraph for deterministic, on-device AI workflows, the app fits FlowGenius' mandate to create a personal productivity tool that leverages desktop-only capabilities.

---

## 3. Feature Set (MVP)

| Area | Detail |
|------|--------|
| **Game Fetcher** | One-click pull of last 10 games (Chess.com & Lichess public APIs) |
| **Local Engine Eval** | Bundled Stockfish 16 WASM/native at depth 12 (configurable) |
| **Move-by-Move Commentary** | GPT-4o transforms PVs + score swings into ≤140-char tips |
| **Tutor Chat** | Conversational Q&A using full chat history + engine context |
| **Tray & Notifications** | Daemon polls every X min; toast summary on new game analysis |
| **Persistent History** | SQLite caches PGNs, evals, and chat transcripts for offline review |

**Stretch goals:** spaced-repetition flashcards from blunders, opening heat-maps, shareable PNG summaries.

---

## 4. Architecture at a Glance

```
┌──────────── Desktop UI (Electron/React) ──────────────┐
│  Games List │ PGN Viewer │ Tutor Chat │ Settings │    │
└───────────────┬───────────────────────────────────────┘
                │ Redux/Zustand store updates
┌───────────────▼───────────────────────────────────────┐
│          LangGraph Workflow (TypeScript SDK)          │
│ 1. GamePoller  ──▶ 2. GameFetcher ──▶ 3. GameParser   │
│             │                       │                 │
│             ▼                       ▼                 │
│ 9. HistoryWriter ◀─ 8. UI/Notifier ◀─ 7. GPTResponder │
│                                  ▲                   │
│ 4. StockfishEval ─▶ 5. MoveAnalyzer ─▶ 6. ContextAsm  │
└────────────────────────────────────────────────────────┘
                │
           SQLite (bundled)
```

---

## 5. LangGraph Node Responsibilities

| # | Node | Trigger | Key Outputs | Purpose |
|---|------|---------|-------------|---------|
| 1 | **GamePoller** | Cron / manual sync | New archive URLs | Detect new games since last check |
| 2 | **GameFetcher** | After 1 | Raw PGNs | Download PGNs |
| 3 | **GameParser** | After 2 | Move list + FENs | Structure game data |
| 4 | **StockfishEval** | Game click / pre-cache | PVs + centipawn scores | Evaluate every ply locally |
| 5 | **MoveAnalyzer** | After 4 | Severity tags + motifs | Turn score deltas into labels (blunder, inaccuracy…) |
| 6 | **ContextAssembler** | User query / auto-comment | Chat history + eval snippets | Gather prompt context for GPT |
| 7 | **GPTResponder** | After 6 | Natural-language answer | Explain moves or answer questions |
| 8 | **UI/Notifier** | New analysis / GPT reply | State mutation + OS toast | Update UI & notify user |
| 9 | **HistoryWriter** | End of cycle | DB rows | Persist games, evals, chat |

---

## 6. Technical Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Desktop shell** | Electron + React (TypeScript) | Rapid dev, familiar web stack |
| **Workflow** | LangGraph | Declarative, stateful AI orchestration |
| **Engine** | Stockfish 16 WASM/native | Fast, open-source, local |
| **LLM** | GPT-4o mini via OpenAI SDK | Concise explanations & chat |
| **Data** | SQLite | Zero-config, ACID, bundled |
| **APIs** | Chess.com, Lichess public endpoints | Simple REST, no OAuth needed |

---

## 7. Development Timeline (4-Day FlowGenius Sprint)

| Day | Goals | Checkpoints |
|-----|-------|-------------|
| **Mon – Discovery & Setup** | Decide Electron/Tauri, scaffold repo, prototype archive fetch | `langgraph.config.ts` drafted; can list archive URLs |
| **Tue – Core Loop** (Early submission 8 PM CT) | Implement Poller → Fetcher → Parser → Engine; basic UI list with accuracy % | Early deliverable tag v0.1 |
| **Wed – UX & Tutor** | Add GPT summaries per move, Tutor chat panel, notifications | Short demo video showing click-to-annotate + first chat answer |
| **Thu – Polish & Docs** (Final submission 8 PM CT) | Preferences, dark mode, error handling, README, 5-min demo, social post | Release v1.0 |

---

## 8. Success Criteria

- Move annotations appear in **< 30 s** from click
- GPT responses respect prior chat context **100%** of test prompts
- **No external calls** after PGN download—proof of offline engine use
- README clearly articulates problem, solution, setup steps, and architecture

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **WASM engine slow on older CPUs** | UX lag | Depth slider; pre-cache idle analysis |
| **API rate limits** | Missed games | Cache archives; poll ≤ 12×/hr |
| **GPT cost blow-up** | Budget issues | Cache summaries; optional "analyze on demand" |
| **Electron bloat** | Large installer | Investigate Tauri build post-deadline |

---

## 10. Deliverables

1. **GitHub repo** – public, MIT-licensed, full source + docs
2. **Deployed binary** – signed installer / DMG / AppImage
3. **5-min demo video** – end-to-end flow incl. tutor chat
4. **BrainLift doc** – learning log & AI prompts
5. **Social post** – X or LinkedIn thread on lessons learned

---

## 🎯 Outcome

HoloCoach Desktop converts post-game analysis from a chore into a one-click, conversational lesson—meeting every FlowGenius criterion while scratching a very personal itch to learn faster from your own games. 