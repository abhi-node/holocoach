/**
 * @fileoverview Main Electron process entry point
 * @module main/index
 * 
 * Handles application lifecycle, window management, and secure IPC setup.
 * Follows security best practices with context isolation and disabled node integration.
 * 
 * @requires electron
 * @requires path
 */

import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { isDev } from './utils/environment';
import { setupIpcHandlers } from './ipc/handlers';

/**
 * Main application window instance
 */
let mainWindow: BrowserWindow | null = null;

/**
 * Creates the main application window with security configurations
 * 
 * @returns {BrowserWindow} The created main window
 */
function createMainWindow(): BrowserWindow {
  // Create the browser window with security settings
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      // Security: Enable context isolation and disable node integration
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      preload: join(__dirname, '../preload/index.js'),
    },
    // macOS specific settings
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false, // Don't show until ready-to-show
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

/**
 * App event handlers
 */

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Set up IPC handlers
  setupIpcHandlers();
  
  // Create main window
  createMainWindow();

  // macOS: Re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (_, contents) => {
  contents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
});

// Security: Prevent navigation to external URLs
app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (navigationEvent, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:3000' && !isDev) {
      navigationEvent.preventDefault();
    }
  });
});

/**
 * Export main window getter for IPC handlers
 */
export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
} 