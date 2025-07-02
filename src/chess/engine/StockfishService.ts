/**
 * @fileoverview Stockfish Engine Service
 * @module chess/engine/StockfishService
 * 
 * Provides chess position analysis using Stockfish.js
 * 
 * @requires chess.js
 */

import { Chess } from 'chess.js';

/**
 * Stockfish analysis result
 */
export interface StockfishAnalysis {
  /** Evaluation in centipawns (positive = white advantage) */
  evaluation: number;
  /** Best move in UCI format (e.g. "e2e4") */
  bestMove: string;
  /** Best move in SAN format (e.g. "e4") */
  bestMoveSan?: string;
  /** Depth of analysis */
  depth: number;
  /** Mate in X moves (if applicable) */
  mate?: number;
}

/**
 * Progress callback for game analysis
 */
export type GameAnalysisProgress = (ply: number, totalPlies: number) => void;

/**
 * Stockfish service using Web Worker
 */
export class StockfishService {
  private static activeInstances = 0;
  private static readonly MAX_INSTANCES = 1;
  
  /**
   * Gets the current number of active instances
   */
  static getActiveInstanceCount(): number {
    return StockfishService.activeInstances;
  }
  
  /**
   * Checks if we can create a new instance
   */
  static canCreateInstance(): boolean {
    return StockfishService.activeInstances < StockfishService.MAX_INSTANCES;
  }
  
  private worker: Worker | null = null;
  private isReady = false;
  private currentAnalysis: Partial<StockfishAnalysis> = {};
  private resolvers: Map<string, (value: StockfishAnalysis) => void> = new Map();
  private currentFen = '';
  private targetDepth = 12;
  private isAnalyzing = false;
  private analysisQueue: Array<() => Promise<void>> = [];
  private lastInfo = Date.now();
  private analysisStartTime = Date.now();
  private watchdogTimer: NodeJS.Timeout | null = null;
  
  /**
   * Initializes the Stockfish engine
   */
  async initialize(): Promise<void> {
    // Check if we're at the instance limit
    if (StockfishService.activeInstances >= StockfishService.MAX_INSTANCES) {
      throw new Error(`Maximum Stockfish instances (${StockfishService.MAX_INSTANCES}) already active`);
    }
    
    try {
      // Create worker from stockfish.js file
      this.worker = new Worker('/stockfish.js');
      StockfishService.activeInstances++;
      console.log(`Stockfish instance created. Active instances: ${StockfishService.activeInstances}`);
      
      // Set up message handler
      this.worker.onmessage = this.handleMessage.bind(this);
      
      // Initialize UCI
      this.sendCommand('uci');
      
      // Wait for the engine to be ready
      await this.waitForReady();
      
      // Configure engine options
      this.sendCommand('setoption name Hash value 128');
      this.sendCommand('setoption name Threads value 1');
      this.sendCommand('setoption name Skill Level value 20');
      
      // Send new game command
      this.sendCommand('ucinewgame');
      
      // Warm up the engine with a quick analysis
      await this.warmUpEngine();
      
      console.log('Stockfish engine initialized and warmed up');
    } catch (error) {
      console.error('Failed to initialize Stockfish:', error);
      // Clean up on failure
      if (this.worker) {
        this.worker.terminate();
        this.worker = null;
        StockfishService.activeInstances--;
        console.log(`Stockfish instance cleaned up after failure. Active instances: ${StockfishService.activeInstances}`);
      }
      throw error;
    }
  }
  
  /**
   * Waits for engine to be ready
   */
  private waitForReady(): Promise<void> {
    return new Promise((resolve) => {
      const checkReady = () => {
        if (this.isReady) {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      
      // Send isready command
      this.sendCommand('isready');
      checkReady();
    });
  }
  
  /**
   * Handles messages from Stockfish
   */
  private handleMessage(event: MessageEvent): void {
    const line = event.data;
    
    if (typeof line !== 'string') return;
    
    // Engine is ready
    if (line === 'uciok' || line === 'readyok') {
      this.isReady = true;
      return;
    }
    
    // Best move found
    if (line.startsWith('bestmove')) {
      const parts = line.split(' ');
      const bestMove = parts[1];
      
      if (bestMove && bestMove !== '(none)') {
        this.currentAnalysis.bestMove = bestMove;
      }
      
      // Clear watchdog timer
      if (this.watchdogTimer) {
        clearInterval(this.watchdogTimer);
        this.watchdogTimer = null;
      }
      
      // Always resolve when we get bestmove, even if no evaluation
      const resolver = this.resolvers.get('current');
      if (resolver) {
        // Ensure we have at least basic analysis
        if (this.currentAnalysis.evaluation === undefined) {
          this.currentAnalysis.evaluation = 0;
        }
        if (!this.currentAnalysis.depth) {
          this.currentAnalysis.depth = 1;
        }
        
        resolver(this.convertAnalysis(this.currentFen));
        this.resolvers.delete('current');
      }
      return;
    }
    
    // Analysis info
    if (line.startsWith('info')) {
      this.parseInfo(line);
    }
  }
  
  /**
   * Parses info line from engine
   */
  private parseInfo(line: string): void {
    // Update last info timestamp
    this.lastInfo = Date.now();
    
    const parts = line.split(' ');
    
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      
      if (part === 'depth' && i + 1 < parts.length) {
        const depth = parseInt(parts[i + 1]);
        this.currentAnalysis.depth = depth;
      } else if (part === 'score') {
        i++;
        if (parts[i] === 'cp' && i + 1 < parts.length) {
          this.currentAnalysis.evaluation = parseInt(parts[i + 1]);
          this.currentAnalysis.mate = undefined;
        } else if (parts[i] === 'mate' && i + 1 < parts.length) {
          const mateIn = parseInt(parts[i + 1]);
          this.currentAnalysis.mate = Math.abs(mateIn);
          // Convert mate score to centipawns (positive = white wins)
          this.currentAnalysis.evaluation = mateIn > 0 ? 10000 - mateIn : -10000 - Math.abs(mateIn);
        }
      } else if (part === 'pv' && i + 1 < parts.length) {
        // First move in PV is the best move
        this.currentAnalysis.bestMove = parts[i + 1];
        break;
      }
    }
  }
  
  /**
   * Analyzes a chess position
   */
  async analyze(fen: string, depth: number = 12): Promise<StockfishAnalysis> {
    if (!this.worker || !this.isReady) {
      throw new Error('Stockfish not initialized');
    }
    
    // Validate FEN
    if (!this.isValidFEN(fen)) {
      throw new Error('Invalid FEN position');
    }
    
    // Queue the analysis to ensure only one runs at a time
    return new Promise((resolve, reject) => {
      const analyzeTask = async () => {
        try {
          const result = await this.performAnalysis(fen, depth);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      this.analysisQueue.push(analyzeTask);
      this.processQueue();
    });
  }
  
  /**
   * Processes the analysis queue
   */
  private async processQueue(): Promise<void> {
    if (this.isAnalyzing || this.analysisQueue.length === 0) {
      return;
    }
    
    const task = this.analysisQueue.shift();
    if (task) {
      this.isAnalyzing = true;
      try {
        await task();
      } finally {
        this.isAnalyzing = false;
        // Process next item in queue
        this.processQueue();
      }
    }
  }
  
  /**
   * Performs the actual analysis
   */
  private async performAnalysis(fen: string, depth: number, movetime?: number): Promise<StockfishAnalysis> {
    return new Promise((resolve, reject) => {
      // Reset current analysis
      this.currentAnalysis = {};
      this.currentFen = fen;
      this.targetDepth = depth;
      this.lastInfo = Date.now();
      this.analysisStartTime = Date.now();
      
      // Check whose turn it is for evaluation normalization
      const fenParts = fen.split(' ');
      const isBlackTurn = fenParts[1] === 'b';
      
      // Clear any existing resolver
      this.resolvers.delete('current');
      
      // Store resolver with normalization
      this.resolvers.set('current', (analysis: StockfishAnalysis) => {
        // Normalize evaluation to always be from White's perspective
        if (isBlackTurn && analysis.evaluation !== undefined) {
          analysis.evaluation = -analysis.evaluation;
        }
        if (isBlackTurn && analysis.mate !== undefined) {
          // For mate, we need to flip the evaluation but not the mate count
          const mateIn = analysis.mate;
          analysis.evaluation = analysis.evaluation > 0 ? -10000 + mateIn : 10000 - mateIn;
        }
        resolve(analysis);
      });
      
      // Stop any ongoing analysis and wait for it to finish
      this.sendCommand('stop');
      
      // Wait a bit for stop to be processed
      setTimeout(() => {
        // Set position
        this.sendCommand(`position fen ${fen}`);
        
        // Use movetime if specified, otherwise depth
        if (movetime) {
          this.sendCommand(`go movetime ${movetime}`);
        } else {
          // For depth-based search, calculate reasonable movetime
          // Depth 12 needs less time than depth 20
          const estimatedTime = depth <= 10 ? depth * 500 : depth * 800;
          this.sendCommand(`go movetime ${estimatedTime}`);
        }
        
        // Set up watchdog timer
        const idleLimit = 4000; // Abort if no info for 4 seconds
        const hardLimit = 30000; // Absolute ceiling of 30 seconds
        
        this.watchdogTimer = setInterval(() => {
          const now = Date.now();
          const idle = now - this.lastInfo;
          const total = now - this.analysisStartTime;
          
          if (idle > idleLimit || total > hardLimit) {
            clearInterval(this.watchdogTimer!);
            this.watchdogTimer = null;
            this.sendCommand('stop');
            
            // If we have something, use it
            if (this.currentAnalysis.bestMove && this.currentAnalysis.evaluation !== undefined) {
              console.warn(`Analysis stopped after ${total}ms (idle: ${idle}ms), using partial results`);
              const resolver = this.resolvers.get('current');
              if (resolver) {
                resolver(this.convertAnalysis(this.currentFen));
                this.resolvers.delete('current');
              }
            }
          }
        }, 500);
      }, 100); // Give stop command time to process
    });
  }
  
  /**
   * Validates a FEN string
   */
  private isValidFEN(fen: string): boolean {
    const parts = fen.split(' ');
    
    // Basic FEN structure check
    if (parts.length !== 6) {
      return false;
    }
    
    // Check board position
    const rows = parts[0].split('/');
    if (rows.length !== 8) {
      return false;
    }
    
    // Check for kings
    const position = parts[0];
    if (!position.includes('K') || !position.includes('k')) {
      return false;
    }
    
    // Check turn
    if (parts[1] !== 'w' && parts[1] !== 'b') {
      return false;
    }
    
    return true;
  }
  
  /**
   * Converts analysis to final format with SAN notation
   */
  private convertAnalysis(fen: string): StockfishAnalysis {
    const analysis: StockfishAnalysis = {
      evaluation: this.currentAnalysis.evaluation || 0,
      bestMove: this.currentAnalysis.bestMove || '',
      depth: this.currentAnalysis.depth || 1,
      mate: this.currentAnalysis.mate,
    };
    
    // Convert UCI to SAN
    if (analysis.bestMove) {
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
   * Sends a command to the engine
   */
  private sendCommand(command: string): void {
    if (this.worker) {
      this.worker.postMessage(command);
    }
  }
  
  /**
   * Analyzes all positions in a game
   */
  async analyzeGame(
    game: { moves: Array<{ from: string; to: string; promotion?: string }> },
    onProgress?: GameAnalysisProgress
  ): Promise<Map<number, StockfishAnalysis>> {
    if (!this.worker || !this.isReady) {
      throw new Error('Stockfish not initialized');
    }
    
    const chess = new Chess();
    const results = new Map<number, StockfishAnalysis>();
    
    try {
      // Get all moves
      const totalPlies = game.moves.length;
      const totalPositions = totalPlies + 1; // +1 for starting position
      let analyzedPositions = 0;
      
      console.log(`Starting game analysis: ${totalPositions} positions at depth 12`);
      console.log(`Estimated time: ${Math.round((totalPositions * 9.6) / 60)} minutes`);
      
      // Analyze starting position
      try {
        console.log(`Analyzing position 0/${totalPlies} (starting position)...`);
        const startAnalysis = await this.analyze(chess.fen(), 12); // depth 12
        results.set(0, startAnalysis);
        analyzedPositions++;
        if (onProgress) {
          onProgress(analyzedPositions, totalPositions);
        }
      } catch (error) {
        console.error('Failed to analyze starting position:', error);
      }
      
      // Analyze each position after each move
      for (let i = 0; i < game.moves.length; i++) {
        const move = game.moves[i];
        
        try {
          // Make the move
          const moveResult = chess.move({ 
            from: move.from, 
            to: move.to, 
            promotion: move.promotion 
          });
          
          if (!moveResult) {
            console.error(`Move ${i + 1} failed validation:`, {
              from: move.from,
              to: move.to,
              promotion: move.promotion,
              currentFen: chess.fen()
            });
            // Skip this move and continue
            continue;
          }
          
          // Small delay between analyses to prevent overwhelming the engine
          if (i > 0 && i % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          // Analyze current position - use depth 12 for all positions
          try {
            console.log(`Analyzing position ${i + 1}/${totalPlies} after ${moveResult.san}...`);
            const analysis = await this.analyze(chess.fen(), 12);
            results.set(i + 1, analysis);
            analyzedPositions++;
            
            // Report progress
            if (onProgress) {
              onProgress(analyzedPositions, totalPositions);
            }
          } catch (analysisError) {
            console.error(`Failed to analyze position after move ${i + 1}:`, analysisError);
            // Add a placeholder result to keep the analysis going
            results.set(i + 1, {
              evaluation: 0,
              bestMove: '',
              depth: 0,
              mate: undefined
            });
            analyzedPositions++;
            
            // Still report progress even on error
            if (onProgress) {
              onProgress(analyzedPositions, totalPositions);
            }
          }
        } catch (moveError) {
          console.error(`Failed to apply move ${i + 1}:`, {
            move,
            error: moveError,
            currentFen: chess.fen()
          });
          // Skip this move and continue
          continue;
        }
      }
      
      console.log(`Game analysis complete: ${analyzedPositions}/${totalPositions} positions analyzed`);
      return results;
    } catch (error) {
      console.error('Failed to analyze game:', error);
      throw error;
    }
  }

  /**
   * Waits for any ongoing analysis to complete
   */
  async waitForCurrentAnalysis(): Promise<void> {
    // Wait for queue to be empty
    while (this.analysisQueue.length > 0 || this.isAnalyzing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Destroys the service
   */
  destroy(): void {
    // Clear analysis queue
    this.analysisQueue = [];
    
    // Clear watchdog timer if running
    if (this.watchdogTimer) {
      clearInterval(this.watchdogTimer);
      this.watchdogTimer = null;
    }
    
    // Reject any pending resolvers
    this.resolvers.forEach((resolver, key) => {
      this.resolvers.delete(key);
    });
    
    if (this.worker) {
      this.sendCommand('stop');
      this.sendCommand('quit');
      
      // Give quit command time to process before terminating
      setTimeout(() => {
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
          StockfishService.activeInstances--;
          console.log(`Stockfish instance destroyed. Active instances: ${StockfishService.activeInstances}`);
        }
      }, 100);
    } else if (this.isReady) {
      // Was initialized but worker already gone
      StockfishService.activeInstances--;
      console.log(`Stockfish instance count corrected. Active instances: ${StockfishService.activeInstances}`);
    }
    
    this.isReady = false;
    this.isAnalyzing = false;
  }

  /**
   * Warms up the engine with a dummy analysis
   */
  private async warmUpEngine(): Promise<void> {
    try {
      // Quick depth 4 analysis of starting position
      const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      await this.performAnalysis(startFen, 4, 1000);
      console.log('Engine warm-up complete');
    } catch (error) {
      console.warn('Engine warm-up failed:', error);
      // Non-critical, continue anyway
    }
  }
}