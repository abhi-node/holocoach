# Native Binaries

This directory contains native binaries for improved performance.

## Stockfish Engine

### macOS (Apple Silicon)
- Location: `mac/stockfish`
- Version: 17.1 (from Homebrew)
- Architecture: arm64

### Installation
1. Install via Homebrew: `brew install stockfish`
2. Copy to project: `cp /opt/homebrew/bin/stockfish src/main/binaries/mac/stockfish`
3. Make executable: `chmod +x src/main/binaries/mac/stockfish`

### Build Process
The native binaries are automatically included in the app bundle during build:
- Development: Loaded from `src/main/binaries/`
- Production: Packaged in `resources/stockfish/`

### Performance
Native Stockfish provides ~3x faster analysis compared to the WASM version:
- WASM: ~9.6 seconds per position at depth 12
- Native: ~3-4 seconds per position at depth 22

With native Stockfish, we can analyze at much higher depths (22 vs 12) while still being faster than WASM.

### Fallback
If native Stockfish fails to load, the app automatically falls back to the WASM version. 