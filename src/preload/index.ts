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

// Log successful preload initialization
console.log('[Preload] APIs exposed successfully'); 