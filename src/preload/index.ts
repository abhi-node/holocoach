/**
 * @fileoverview Preload script for secure IPC communication
 * @module preload/index
 * 
 * Exposes limited, secure APIs to the renderer process via contextBridge.
 * This is the only way for renderer to communicate with main process.
 * 
 * @requires electron
 */

import { contextBridge, ipcRenderer } from 'electron';
import { ChessGame } from '../shared/types/chess';
import { GameFetchProgress } from '../main/services/GameFetcherService';
import { StockfishAnalysis } from '../main/services/NativeStockfishService';

/**
 * Chess API exposed to renderer process
 * 
 * All methods are asynchronous and return promises that resolve
 * with the result from the main process IPC handlers.
 */
const chessAPI = {
  // Game management
  syncGames: (username: string, platform: string) => 
    ipcRenderer.invoke('sync-games', username, platform),
  
  getGames: () => 
    ipcRenderer.invoke('get-games'),
  
  // Analysis
  analyzeGame: (gameId: string) => 
    ipcRenderer.invoke('analyze-game', gameId),
  
  getAnalysis: (gameId: string) => 
    ipcRenderer.invoke('get-analysis', gameId),
  
  // Settings
  getSettings: () => 
    ipcRenderer.invoke('get-settings'),
  
  updateSettings: (settings: any) => 
    ipcRenderer.invoke('update-settings', settings),
  
  // Database
  initDatabase: () => 
    ipcRenderer.invoke('init-database'),
};

/**
 * Electron API exposed to renderer process
 * 
 * Provides access to basic Electron functionality that's safe
 * for the renderer to use.
 */
const electronAPI = {
  // Platform information
  platform: process.platform,
  
  // Version information
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
};

/**
 * Expose secure APIs to renderer process
 * 
 * These APIs will be available on window.chessAPI and window.electronAPI
 * in the renderer process.
 */
contextBridge.exposeInMainWorld('chessAPI', chessAPI);
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Define the shape of the exposed API
export interface HoloCoachAPI {
  // Environment
  isDev: boolean;
  platform: NodeJS.Platform;
  
  // Database operations
  database: {
    init: () => Promise<{ success: boolean; error?: string }>;
  };
  
  // Game fetching operations
  games: {
    fetchGames: (username: string, platform: 'chess.com' | 'lichess', limit?: number) => Promise<ChessGame[]>;
    validateUser: (username: string, platform: 'chess.com' | 'lichess') => Promise<boolean>;
    getRateLimiterStatus: () => Promise<any>;
    onFetchProgress: (callback: (progress: GameFetchProgress) => void) => void;
    offFetchProgress: () => void;
  };
  
  // Native Stockfish operations
  stockfish: {
    initialize: () => Promise<{ success: boolean; error?: string }>;
    analyze: (fen: string, depth: number) => Promise<StockfishAnalysis | null>;
    analyzeGame: (game: { moves: Array<{ from: string; to: string; promotion?: string }> }) => Promise<Record<string, StockfishAnalysis> | null>;
    destroy: () => Promise<void>;
    onProgress: (callback: (progress: { analyzed: number; total: number }) => void) => void;
    offProgress: () => void;
  };
}

// Create the API object
const holoCoachAPI: HoloCoachAPI = {
  isDev: process.env.NODE_ENV === 'development',
  platform: process.platform,
  
  database: {
    init: () => ipcRenderer.invoke('init-database')
  },
  
  games: {
    fetchGames: (username: string, platform: 'chess.com' | 'lichess', limit?: number) => 
      ipcRenderer.invoke('fetch-games', username, platform, limit),
      
    validateUser: (username: string, platform: 'chess.com' | 'lichess') =>
      ipcRenderer.invoke('validate-user', username, platform),
      
    getRateLimiterStatus: () =>
      ipcRenderer.invoke('get-rate-limiter-status'),
      
    onFetchProgress: (callback: (progress: GameFetchProgress) => void) => {
      ipcRenderer.on('fetch-games-progress', (_event, progress) => callback(progress));
    },
    
    offFetchProgress: () => {
      ipcRenderer.removeAllListeners('fetch-games-progress');
    }
  },
  
  stockfish: {
    initialize: () => ipcRenderer.invoke('stockfish-initialize'),
    
    analyze: (fen: string, depth: number) => 
      ipcRenderer.invoke('stockfish-analyze', fen, depth),
      
    analyzeGame: (game: { moves: Array<{ from: string; to: string; promotion?: string }> }) =>
      ipcRenderer.invoke('stockfish-analyze-game', game),
      
    destroy: () => ipcRenderer.invoke('stockfish-destroy'),
    
    onProgress: (callback: (progress: { analyzed: number; total: number }) => void) => {
      ipcRenderer.on('stockfish-progress', (_event, progress) => callback(progress));
    },
    
    offProgress: () => {
      ipcRenderer.removeAllListeners('stockfish-progress');
    }
  }
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('holoCoach', holoCoachAPI);

// Log successful preload initialization
console.log('[Preload] APIs exposed successfully'); 