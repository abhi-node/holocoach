/**
 * @fileoverview Native Stockfish Adapter
 * @module chess/engine/NativeStockfishAdapter
 * 
 * Adapter that allows the renderer process to use native Stockfish
 * through IPC instead of the WASM version.
 * 
 * @requires window.holoCoach
 */

import { StockfishAnalysis, GameAnalysisProgress } from './StockfishService';
import { Chess } from 'chess.js';

/**
 * Native Stockfish adapter for renderer process
 */
export class NativeStockfishAdapter {
  private isInitialized = false;
  
  /**
   * Initializes the native Stockfish engine
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    
    console.log('Initializing native Stockfish through IPC...');
    const result = await window.holoCoach.stockfish.initialize();
    
    if (!result.success) {
      throw new Error(`Failed to initialize native Stockfish: ${result.error}`);
    }
    
    this.isInitialized = true;
    console.log('Native Stockfish initialized successfully');
  }
  
  /**
   * Analyzes a chess position
   */
  async analyze(fen: string, depth: number = 22): Promise<StockfishAnalysis> {
    if (!this.isInitialized) {
      throw new Error('Native Stockfish not initialized');
    }
    
    const analysis = await window.holoCoach.stockfish.analyze(fen, depth);
    
    if (!analysis) {
      throw new Error('Analysis failed');
    }
    
    // Convert UCI to SAN if needed
    if (analysis.bestMove && !analysis.bestMoveSan) {
      try {
        const chess = new Chess(fen);
        const from = analysis.bestMove.slice(0, 2);
        const to = analysis.bestMove.slice(2, 4);
        const promotion = analysis.bestMove.slice(4, 5);
        
        const move = chess.move({
          from: from as any,
          to: to as any,
          promotion: promotion || undefined,
        });
        
        if (move) {
          analysis.bestMoveSan = move.san;
        }
      } catch (error) {
        console.warn('Failed to convert UCI to SAN:', error);
      }
    }
    
    return analysis;
  }
  
  /**
   * Analyzes all positions in a game
   */
  async analyzeGame(
    game: { moves: Array<{ from: string; to: string; promotion?: string }> },
    onProgress?: GameAnalysisProgress
  ): Promise<Map<number, StockfishAnalysis>> {
    if (!this.isInitialized) {
      throw new Error('Native Stockfish not initialized');
    }
    
    // Set up progress listener
    if (onProgress) {
      window.holoCoach.stockfish.onProgress((progress) => {
        onProgress(progress.analyzed, progress.total);
      });
    }
    
    try {
      const result = await window.holoCoach.stockfish.analyzeGame(game);
      
      if (!result) {
        throw new Error('Game analysis failed');
      }
      
      // IPC serializes Map objects to plain objects, so we need to reconstruct
      const analysisMap = new Map<number, StockfishAnalysis>();
      
      // Handle both Map and plain object formats
      if (result instanceof Map) {
        return result;
      } else {
        // Reconstruct Map from serialized object
        Object.entries(result).forEach(([key, value]) => {
          analysisMap.set(parseInt(key), value as StockfishAnalysis);
        });
        return analysisMap;
      }
    } finally {
      // Clean up progress listener
      window.holoCoach.stockfish.offProgress();
    }
  }
  
  /**
   * Cancels any ongoing analysis
   */
  cancel(): void {
    // Native engine doesn't currently support cancellation
    // Analysis will complete on the main process
    console.log('Native Stockfish analysis cancellation requested (not implemented)');
  }
  
  /**
   * Waits for any ongoing analysis to complete
   */
  async waitForCurrentAnalysis(): Promise<void> {
    // Native engine handles this internally
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  /**
   * Destroys the service
   */
  destroy(): void {
    if (this.isInitialized) {
      window.holoCoach.stockfish.destroy();
      this.isInitialized = false;
    }
  }
  
  /**
   * Static methods for compatibility with StockfishService
   */
  static getActiveInstanceCount(): number {
    // Native engine manages its own instances
    return 0;
  }
  
  static canCreateInstance(): boolean {
    // Native engine manages its own instances
    return true;
  }
} 