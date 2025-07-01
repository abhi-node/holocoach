/**
 * @fileoverview Shared type definitions for HoloCoach
 * @module shared/types
 * 
 * Common type definitions used across main and renderer processes.
 * These types ensure type safety for IPC communication and data structures.
 */

/**
 * Chess game representation
 */
export interface Game {
  /** Unique identifier for the game */
  id: string;
  
  /** White player username */
  whitePlayer: string;
  
  /** Black player username */
  blackPlayer: string;
  
  /** Game result */
  result: '1-0' | '0-1' | '1/2-1/2' | '*';
  
  /** Date the game was played */
  datePlayed: Date;
  
  /** Raw PGN data */
  pgn: string;
  
  /** Platform where the game was played */
  platform: 'chess.com' | 'lichess';
  
  /** Whether the game has been analyzed */
  analyzed: boolean;
  
  /** Analysis timestamp if available */
  analyzedAt?: Date;
}

/**
 * Application settings
 */
export interface Settings {
  /** Theme preference */
  theme: 'light' | 'dark' | 'system';
  
  /** Stockfish analysis depth */
  stockfishDepth: number;
  
  /** Auto-sync games */
  autoSync: boolean;
  
  /** Chess.com username */
  chessComUsername?: string;
  
  /** Lichess username */
  lichessUsername?: string;
  
  /** Preferred chess platform */
  preferredPlatform: 'chess.com' | 'lichess';
}

/**
 * IPC Response wrapper
 */
export interface IPCResponse<T = any> {
  /** Whether the operation was successful */
  success: boolean;
  
  /** Response data if successful */
  data?: T;
  
  /** Error message if failed */
  error?: string;
  
  /** Error code for programmatic handling */
  code?: string;
}

/**
 * Available IPC channels
 */
export type IPCChannels = 
  | 'sync-games'
  | 'get-games' 
  | 'analyze-game'
  | 'get-analysis'
  | 'get-settings'
  | 'update-settings'
  | 'init-database';

/**
 * Theme types
 */
export type ThemeMode = 'light' | 'dark' | 'system'; 