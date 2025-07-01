/**
 * @fileoverview Window Type Definitions
 * @module renderer/types/window
 * 
 * Extends the Window interface to include APIs exposed by the preload script.
 * This provides TypeScript intellisense for the exposed APIs.
 */

/// <reference types="vite/client" />

import { HoloCoachAPI } from '../../preload';

declare global {
  interface Window {
    /**
     * Chess-related APIs
     */
    chessAPI: {
      loadPGN: (pgn: string) => Promise<boolean>;
      getGameInfo: () => Promise<any>;
    };
    
    /**
     * Electron utility APIs
     */
    electronAPI: {
      getVersion: () => string;
      getPlatform: () => string;
    };
    
    /**
     * HoloCoach main API
     */
    holoCoach: HoloCoachAPI;
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