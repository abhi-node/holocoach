/**
 * @fileoverview Type declarations for window object and global interfaces
 * @module renderer/types/window
 * 
 * TypeScript declarations for Electron preload APIs and global window extensions.
 * Provides type safety for IPC communication between main and renderer processes.
 */

/// <reference types="vite/client" />

declare global {
  interface Window {
    // Electron preload APIs
    chessAPI: {
      // Game analysis
      analyzeGame: (pgn: string) => Promise<any>;
      analyzePosition: (fen: string) => Promise<any>;
      
      // Database operations  
      saveGame: (game: any) => Promise<void>;
      loadGames: () => Promise<any[]>;
      
      // External API calls
      syncChesscomGames: (username: string) => Promise<any>;
      syncLichessGames: (username: string) => Promise<any>;
      
      // Utility functions
      validatePGN: (pgn: string) => Promise<boolean>;
      
      // Settings
      getSettings: () => Promise<any>;
      saveSettings: (settings: any) => Promise<void>;
    };

    // Electron system APIs
    electronAPI: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      openExternal: (url: string) => void;
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