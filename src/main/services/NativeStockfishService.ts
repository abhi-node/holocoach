/**
 * @fileoverview Native Stockfish Service
 * @module main/services/NativeStockfishService
 * 
 * Manages native Stockfish engine process for faster analysis
 * on macOS. Uses child_process to communicate with the binary.
 * 
 * @requires child_process
 * @requires path
 */

import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import { app } from 'electron';
import { MoveQuality } from '../../shared/types/chess';

export interface StockfishAnalysis {
  evaluation: number;
  bestMove: string;
  bestMoveSan?: string;
  depth: number;
  mate?: number;
  quality?: MoveQuality;
}

/**
 * Native Stockfish service using system binary
 */
export class NativeStockfishService {
  private process: ChildProcess | null = null;
  private isReady = false;
  private currentAnalysis: Partial<StockfishAnalysis> = {};
  private resolvers: Map<string, (value: StockfishAnalysis) => void> = new Map();
  private rejecters: Map<string, (error: Error) => void> = new Map();
  private currentId = '';
  private analysisQueue: Array<() => Promise<void>> = [];
  private isAnalyzing = false;
  
  /**
   * Gets the path to the Stockfish binary
   */
  private getStockfishPath(): string {
    if (app.isPackaged) {
      // In production, binary is in resources folder
      return path.join(process.resourcesPath, 'stockfish', 'mac', 'stockfish');
    } else {
      // In development, use our local copy relative to the project root
      return path.join(app.getAppPath(), 'src', 'main', 'binaries', 'mac', 'stockfish');
    }
  }
  
  /**
   * Initializes the Stockfish engine
   */
  async initialize(): Promise<void> {
    const stockfishPath = this.getStockfishPath();
    console.log(`Initializing native Stockfish from: ${stockfishPath}`);
    console.log(`App path: ${app.getAppPath()}`);
    console.log(`Is packaged: ${app.isPackaged}`);
    
    // Check if file exists
    const fs = await import('fs');
    if (!fs.existsSync(stockfishPath)) {
      throw new Error(`Stockfish binary not found at: ${stockfishPath}`);
    }
    
    try {
      // Spawn Stockfish process
      this.process = spawn(stockfishPath, [], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      // Handle stdout (engine output)
      this.process.stdout?.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            this.handleEngineOutput(line.trim());
          }
        });
      });
      
      // Handle stderr (errors)
      this.process.stderr?.on('data', (data: Buffer) => {
        console.error('Stockfish error:', data.toString());
      });
      
      // Handle process exit
      this.process.on('exit', (code) => {
        console.log(`Stockfish process exited with code ${code}`);
        this.cleanup();
      });
      
      // Initialize UCI
      this.sendCommand('uci');
      
      // Wait for engine to be ready
      await this.waitForReady();
      
      // Configure engine options
      this.sendCommand('setoption name Hash value 256'); // More hash for native
      this.sendCommand('setoption name Threads value 4'); // Use multiple threads
      this.sendCommand('ucinewgame');
      
      console.log('Native Stockfish initialized successfully');
    } catch (error) {
      console.error('Failed to initialize native Stockfish:', error);
      this.cleanup();
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
      
      this.sendCommand('isready');
      checkReady();
    });
  }
  
  /**
   * Handles output from the engine
   */
  private handleEngineOutput(line: string): void {
    // console.log('Engine:', line); // Debug logging
    
    if (line === 'uciok' || line === 'readyok') {
      this.isReady = true;
      return;
    }
    
    if (line.startsWith('bestmove')) {
      const parts = line.split(' ');
      const bestMove = parts[1];
      
      if (bestMove && bestMove !== '(none)') {
        this.currentAnalysis.bestMove = bestMove;
      }
      
      // Resolve the current analysis
      const resolver = this.resolvers.get(this.currentId);
      if (resolver) {
        // Ensure we have at least basic analysis
        if (this.currentAnalysis.evaluation === undefined) {
          this.currentAnalysis.evaluation = 0;
        }
        if (!this.currentAnalysis.depth) {
          this.currentAnalysis.depth = 1;
        }
        
        resolver(this.currentAnalysis as StockfishAnalysis);
        this.resolvers.delete(this.currentId);
        this.rejecters.delete(this.currentId);
      }
      
      this.isAnalyzing = false;
      this.processQueue();
      return;
    }
    
    if (line.startsWith('info')) {
      this.parseInfo(line);
    }
  }
  
  /**
   * Parses info line from engine
   */
  private parseInfo(line: string): void {
    const parts = line.split(' ');
    
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      
      if (part === 'depth' && i + 1 < parts.length) {
        this.currentAnalysis.depth = parseInt(parts[i + 1]);
      } else if (part === 'score') {
        i++;
        if (parts[i] === 'cp' && i + 1 < parts.length) {
          this.currentAnalysis.evaluation = parseInt(parts[i + 1]);
          this.currentAnalysis.mate = undefined;
        } else if (parts[i] === 'mate' && i + 1 < parts.length) {
          const mateIn = parseInt(parts[i + 1]);
          this.currentAnalysis.mate = Math.abs(mateIn);
          this.currentAnalysis.evaluation = mateIn > 0 ? 10000 - mateIn : -10000 - Math.abs(mateIn);
        }
      } else if (part === 'pv' && i + 1 < parts.length) {
        this.currentAnalysis.bestMove = parts[i + 1];
        break;
      }
    }
  }
  
  /**
   * Sends a command to the engine
   */
  private sendCommand(command: string): void {
    if (this.process && this.process.stdin) {
      this.process.stdin.write(command + '\n');
    }
  }
  
  /**
   * Analyzes a position
   */
  async analyze(fen: string, depth: number = 22): Promise<StockfishAnalysis> {
    if (!this.process || !this.isReady) {
      throw new Error('Native Stockfish not initialized');
    }
    
    return new Promise((resolve, reject) => {
      const analyzeTask = async () => {
        const id = `analysis_${Date.now()}`;
        this.currentId = id;
        this.currentAnalysis = {};
        this.resolvers.set(id, resolve);
        this.rejecters.set(id, reject);
        
        // Stop any ongoing analysis
        this.sendCommand('stop');
        
        // Small delay to ensure stop is processed
        await new Promise(r => setTimeout(r, 50));
        
        // Set position and analyze
        this.sendCommand(`position fen ${fen}`);
        this.sendCommand(`go depth ${depth}`);
        
        // Store FEN to check whose turn it is
        const fenParts = fen.split(' ');
        const isBlackTurn = fenParts[1] === 'b';
        
        // Set timeout for native engine (much shorter than WASM)
        setTimeout(() => {
          if (this.resolvers.has(id)) {
            this.sendCommand('stop');
            reject(new Error('Analysis timeout'));
            this.resolvers.delete(id);
            this.rejecters.delete(id);
            this.isAnalyzing = false;
            this.processQueue();
          }
        }, 10000); // 10 second timeout for native
        
        // Override the resolver to normalize evaluation
        const originalResolver = this.resolvers.get(id);
        if (originalResolver) {
          this.resolvers.set(id, (analysis: StockfishAnalysis) => {
            // Normalize evaluation to always be from White's perspective
            if (isBlackTurn && analysis.evaluation !== undefined) {
              analysis.evaluation = -analysis.evaluation;
            }
            if (isBlackTurn && analysis.mate !== undefined) {
              // For mate, we need to flip the evaluation but not the mate count
              const mateIn = analysis.mate;
              analysis.evaluation = analysis.evaluation > 0 ? -10000 + mateIn : 10000 - mateIn;
            }
            originalResolver(analysis);
          });
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
      } catch (error) {
        console.error('Queue processing error:', error);
        this.isAnalyzing = false;
        this.processQueue();
      }
    }
  }
  
  /**
   * Cleans up resources
   */
  cleanup(): void {
    this.analysisQueue = [];
    this.resolvers.clear();
    this.rejecters.clear();
    
    if (this.process) {
      this.sendCommand('quit');
      setTimeout(() => {
        if (this.process) {
          this.process.kill();
          this.process = null;
        }
      }, 100);
    }
    
    this.isReady = false;
    this.isAnalyzing = false;
  }
  
  /**
   * Destroys the service
   */
  destroy(): void {
    this.cleanup();
  }
} 