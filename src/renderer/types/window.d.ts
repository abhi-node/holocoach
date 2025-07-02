/**
 * @fileoverview Window Type Definitions
 * @module renderer/types/window
 * 
 * Extends the Window interface to include APIs exposed by the preload script.
 * This provides TypeScript intellisense for the exposed APIs.
 */

/// <reference types="vite/client" />

import { HoloCoachAPI } from '../../preload';
import { ChessGame } from '../../shared/types/chess';
import { GameFetchProgress } from '../../main/services/GameFetcherService';
import { StockfishAnalysis } from '../../main/services/NativeStockfishService';

declare global {
  interface Window {
    /**
     * Chess-related APIs
     */
    chessAPI: {
      loadPGN: (pgn: string) => Promise<boolean>;
      getGameInfo: () => Promise<any>;
      syncGames: (username: string, platform: string) => Promise<any>;
      getGames: () => Promise<any>;
      analyzeGame: (gameId: string) => Promise<any>;
      getAnalysis: (gameId: string) => Promise<any>;
      getSettings: () => Promise<any>;
      updateSettings: (settings: any) => Promise<any>;
      initDatabase: () => Promise<any>;
    };
    
    /**
     * Electron utility APIs
     */
    electronAPI: {
      getVersion: () => string;
      getPlatform: () => string;
      platform: NodeJS.Platform;
      versions: {
        electron: string;
        chrome: string;
        node: string;
      };
    };
    
    /**
     * HoloCoach main API
     */
    holoCoach: {
      isDev: boolean;
      platform: NodeJS.Platform;
      
      database: {
        init: () => Promise<{ success: boolean; error?: string }>;
      };
      
      games: {
        fetchGames: (username: string, platform: 'chess.com' | 'lichess', limit?: number) => Promise<ChessGame[]>;
        validateUser: (username: string, platform: 'chess.com' | 'lichess') => Promise<boolean>;
        getRateLimiterStatus: () => Promise<any>;
        onFetchProgress: (callback: (progress: GameFetchProgress) => void) => void;
        offFetchProgress: () => void;
      };
      
      stockfish: {
        initialize: () => Promise<{ success: boolean; error?: string }>;
        analyze: (fen: string, depth: number) => Promise<StockfishAnalysis | null>;
        analyzeGame: (game: { moves: Array<{ from: string; to: string; promotion?: string }> }) => Promise<Record<string, StockfishAnalysis> | null>;
        destroy: () => Promise<void>;
        onProgress: (callback: (progress: { analyzed: number; total: number }) => void) => void;
        offProgress: () => void;
      };
    };
  }

  // Vite environment variables
  interface ImportMetaEnv {
    readonly DEV: boolean;
    readonly PROD: boolean;
    readonly MODE: string;
    readonly VITE_APP_TITLE: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {}; 