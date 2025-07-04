/**
 * @fileoverview IPC handlers for secure main-renderer communication
 * @module main/ipc/handlers
 * 
 * Sets up secure IPC channels for game syncing, analysis requests,
 * and other application functionality between main and renderer processes.
 * 
 * @requires electron
 */

import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { GameFetcherService, GameFetchProgress } from '../services/GameFetcherService';
import { ChessGame } from '../../shared/types/chess';
import { NativeStockfishService, StockfishAnalysis } from '../services/NativeStockfishService';
import { AIChatService } from '../services/AIChatService';
import { AIChatResponse } from '../../shared/types/ai-chat';

// Service instances
const gameFetcherService = new GameFetcherService();
const aiChatService = new AIChatService();
let nativeStockfish: NativeStockfishService | null = null;

/**
 * Sets up all IPC handlers for the application
 * 
 * This function registers all IPC handlers that the renderer can invoke.
 * Each handler is responsible for a specific application function.
 */
export function setupIpcHandlers(): void {
  // Game sync handlers
  ipcMain.handle('sync-games', handleSyncGames);
  ipcMain.handle('get-games', handleGetGames);
  
  // Analysis handlers
  ipcMain.handle('analyze-game', handleAnalyzeGame);
  ipcMain.handle('get-analysis', handleGetAnalysis);
  
  // Native Stockfish handlers
  ipcMain.handle('stockfish-initialize', handleStockfishInitialize);
  ipcMain.handle('stockfish-analyze', handleStockfishAnalyze);
  ipcMain.handle('stockfish-analyze-game', handleStockfishAnalyzeGame);
  ipcMain.handle('stockfish-destroy', handleStockfishDestroy);
  
  // AI Chat handlers
  ipcMain.handle('ai-chat-analyze', handleAIChatAnalyze);
  
  // Settings handlers
  ipcMain.handle('get-settings', handleGetSettings);
  ipcMain.handle('update-settings', handleUpdateSettings);
  
  // Database handlers
  ipcMain.handle('init-database', handleInitDatabase);
  
  // Game fetching handlers
  registerGameFetchHandlers();
  
  console.log('[IPC] All handlers registered');
}

/**
 * Handles game synchronization from chess platforms
 * 
 * @param {Electron.IpcMainInvokeEvent} event - The IPC event
 * @param {string} username - Chess platform username
 * @param {string} platform - Platform name ('chess.com' or 'lichess')
 * @returns {Promise<any>} Sync result
 */
async function handleSyncGames(
  _event: Electron.IpcMainInvokeEvent,
  username: string,
  platform: string
): Promise<any> {
  try {
    console.log(`[IPC] Syncing games for ${username} on ${platform}`);
    
    // TODO: Implement actual game syncing logic
    // This will be connected to the LangGraph workflow
    
    return {
      success: true,
      message: 'Games synced successfully',
      gameCount: 0
    };
  } catch (error) {
    console.error('[IPC] Error syncing games:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Handles retrieving stored games from database
 * 
 * @param {Electron.IpcMainInvokeEvent} event - The IPC event
 * @returns {Promise<any>} Games list
 */
async function handleGetGames(_event: Electron.IpcMainInvokeEvent): Promise<any> {
  try {
    console.log('[IPC] Getting games from database');
    
    // TODO: Implement database query
    
    return {
      success: true,
      games: []
    };
  } catch (error) {
    console.error('[IPC] Error getting games:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Handles game analysis requests
 * 
 * @param {Electron.IpcMainInvokeEvent} event - The IPC event
 * @param {string} gameId - Game identifier
 * @returns {Promise<any>} Analysis result
 */
async function handleAnalyzeGame(
  _event: Electron.IpcMainInvokeEvent,
  gameId: string
): Promise<any> {
  try {
    console.log(`[IPC] Analyzing game ${gameId}`);
    
    // TODO: Implement Stockfish analysis via LangGraph
    
    return {
      success: true,
      analysis: null
    };
  } catch (error) {
    console.error('[IPC] Error analyzing game:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Handles retrieving analysis from database
 * 
 * @param {Electron.IpcMainInvokeEvent} event - The IPC event
 * @param {string} gameId - Game identifier
 * @returns {Promise<any>} Analysis data
 */
async function handleGetAnalysis(
  _event: Electron.IpcMainInvokeEvent,
  gameId: string
): Promise<any> {
  try {
    console.log(`[IPC] Getting analysis for game ${gameId}`);
    
    // TODO: Implement database query
    
    return {
      success: true,
      analysis: null
    };
  } catch (error) {
    console.error('[IPC] Error getting analysis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Handles settings retrieval
 * 
 * @param {Electron.IpcMainInvokeEvent} event - The IPC event
 * @returns {Promise<any>} Settings object
 */
async function handleGetSettings(_event: Electron.IpcMainInvokeEvent): Promise<any> {
  try {
    console.log('[IPC] Getting settings');
    
    // TODO: Implement settings storage
    
    return {
      success: true,
      settings: {
        stockfishDepth: 12,
        theme: 'light',
        autoSync: false
      }
    };
  } catch (error) {
    console.error('[IPC] Error getting settings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Handles settings updates
 * 
 * @param {Electron.IpcMainInvokeEvent} event - The IPC event
 * @param {any} settings - Settings object to update
 * @returns {Promise<any>} Update result
 */
async function handleUpdateSettings(
  _event: Electron.IpcMainInvokeEvent,
  settings: any
): Promise<any> {
  try {
    console.log('[IPC] Updating settings:', settings);
    
    // TODO: Implement settings persistence
    
    return {
      success: true,
      message: 'Settings updated successfully'
    };
  } catch (error) {
    console.error('[IPC] Error updating settings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Handles database initialization
 * 
 * @param {Electron.IpcMainInvokeEvent} event - The IPC event
 * @returns {Promise<any>} Initialization result
 */
async function handleInitDatabase(_event: Electron.IpcMainInvokeEvent): Promise<any> {
  try {
    console.log('[IPC] Initializing database');
    
    // TODO: Implement database initialization
    
    return {
      success: true,
      message: 'Database initialized successfully'
    };
  } catch (error) {
    console.error('[IPC] Error initializing database:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Registers game fetching related IPC handlers
 */
function registerGameFetchHandlers(): void {
  /**
   * Fetches games from chess platforms
   */
  ipcMain.handle('fetch-games', async (
    event: IpcMainInvokeEvent,
    username: string,
    platform: 'chess.com' | 'lichess',
    limit = 10
  ): Promise<ChessGame[]> => {
    try {
      // Send progress updates to the renderer
      const games = await gameFetcherService.fetchGames(
        username,
        platform,
        limit,
        (progress: GameFetchProgress) => {
          // Send progress updates via a separate channel
          event.sender.send('fetch-games-progress', progress);
        }
      );
      
      return games;
    } catch (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
  });
  
  /**
   * Validates a username on a platform
   */
  ipcMain.handle('validate-user', async (
    _event: IpcMainInvokeEvent,
    username: string,
    platform: 'chess.com' | 'lichess'
  ): Promise<boolean> => {
    try {
      const chessComClient = new (await import('../../api/chess-com/ChessComClient')).ChessComClient();
      const lichessClient = new (await import('../../api/lichess/LichessClient')).LichessClient();
      
      if (platform === 'chess.com') {
        return await chessComClient.validateUser(username);
      } else {
        return await lichessClient.validateUser(username);
      }
    } catch (error) {
      console.error('Error validating user:', error);
      return false;
    }
  });
  
  /**
   * Gets rate limiter status
   */
  ipcMain.handle('get-rate-limiter-status', async (): Promise<any> => {
    return gameFetcherService.getRateLimiterStatus();
  });
}

/**
 * Initializes native Stockfish engine
 */
async function handleStockfishInitialize(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!nativeStockfish) {
      nativeStockfish = new NativeStockfishService();
      await nativeStockfish.initialize();
    }
    return { success: true };
  } catch (error) {
    console.error('[IPC] Error initializing native Stockfish:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Analyzes a single position with native Stockfish
 */
async function handleStockfishAnalyze(
  _event: IpcMainInvokeEvent,
  fen: string,
  depth: number
): Promise<StockfishAnalysis | null> {
  try {
    if (!nativeStockfish) {
      throw new Error('Native Stockfish not initialized');
    }
    return await nativeStockfish.analyze(fen, depth);
  } catch (error) {
    console.error('[IPC] Error analyzing position:', error);
    return null;
  }
}

/**
 * Analyzes complete game with native Stockfish
 */
async function handleStockfishAnalyzeGame(
  event: IpcMainInvokeEvent,
  game: { moves: Array<{ from: string; to: string; promotion?: string }> }
): Promise<Record<string, StockfishAnalysis> | null> {
  try {
    if (!nativeStockfish) {
      throw new Error('Native Stockfish not initialized');
    }
    
    // Import required modules
    const { Chess } = await import('chess.js');
    const { MoveClassifier } = await import('../../chess/analysis/MoveClassifier');
    const chess = new Chess();
    const results: Record<string, StockfishAnalysis> = {};
    
    const totalPositions = game.moves.length + 1;
    let analyzedPositions = 0;
    
    console.log(`[Native] Starting game analysis: ${totalPositions} positions at depth 20`);
    
    // Analyze starting position
    try {
      const startAnalysis = await nativeStockfish.analyze(chess.fen(), 20);
      
      // Skip SAN conversion during analysis - will do it later
      
      results['0'] = startAnalysis;
      analyzedPositions++;
      event.sender.send('stockfish-progress', {
        analyzed: analyzedPositions,
        total: totalPositions
      });
    } catch (error) {
      console.error('[Native] Failed to analyze starting position:', error);
    }
    
    // Analyze each position
    for (let i = 0; i < game.moves.length; i++) {
      const move = game.moves[i];
      
              try {
          const moveResult = chess.move({
            from: move.from,
            to: move.to,
            promotion: move.promotion
          });
        
        if (!moveResult) {
          console.error(`[Native] Move ${i + 1} failed validation`);
          continue;
        }
        
        console.log(`[Native] Analyzing position ${i + 1}/${game.moves.length} after ${moveResult.san}...`);
        const analysis = await nativeStockfish.analyze(chess.fen(), 20);
        
                 // Add move classification if we have analysis for the previous position
         const previousAnalysis = results[String(i)];
         if (previousAnalysis && previousAnalysis.bestMove) {
           try {
             // Create a temporary chess instance to play the best move  
             const tempChess = new Chess();
             // Reset to the position before this move
             for (let j = 0; j < i; j++) {
               tempChess.move({
                 from: game.moves[j].from,
                 to: game.moves[j].to,
                 promotion: game.moves[j].promotion
               });
             }
             
             const bestMoveUci = previousAnalysis.bestMove;
             
             // Parse and play the best move
             const from = bestMoveUci.slice(0, 2);
             const to = bestMoveUci.slice(2, 4);
             const promotion = bestMoveUci.slice(4, 5);
             
             const bestMoveResult = tempChess.move({
               from: from as any,
               to: to as any,
               promotion: promotion || undefined
             });
             
             if (bestMoveResult) {
               // Analyze position after best move (lower depth for classification)
               const bestMoveAnalysis = await nativeStockfish.analyze(tempChess.fen(), 15);
               
               // Now we have all three evaluations needed for classification
               const evaluationBefore = previousAnalysis.evaluation;  // Before move
               const evaluationAfter = analysis.evaluation;           // After actual move  
               const evaluationBest = bestMoveAnalysis.evaluation;    // After best move
               
               // All evaluations should be from White's perspective
               const moveQuality = MoveClassifier.classifyMove(
                 evaluationBefore,
                 evaluationAfter,
                 evaluationBest
               );
               
               // Add quality classification to the analysis
               analysis.quality = moveQuality;
             } else {
               console.warn(`[Native] Failed to play best move ${bestMoveUci} for classification`);
             }
           } catch (error) {
             console.warn(`[Native] Error analyzing best move for classification:`, error);
           }
         }
        
        // Skip SAN conversion during analysis - will do it later
        
        results[String(i + 1)] = analysis;
        analyzedPositions++;
        
        // Send progress update
        event.sender.send('stockfish-progress', {
          analyzed: analyzedPositions,
          total: totalPositions
        });
      } catch (error) {
        console.error(`[Native] Failed to analyze position after move ${i + 1}:`, error);
      }
    }
    
    console.log(`[Native] Game analysis complete: ${analyzedPositions}/${totalPositions} positions analyzed`);
    
    // Convert UCI to SAN for all best moves after analysis is complete
    console.log('[Native] Converting UCI moves to SAN notation...');
    const chessReplay = new Chess();
    
    // Convert starting position best move
    if (results['0']?.bestMove && !results['0'].bestMoveSan) {
      try {
        const tempChess = new Chess(chessReplay.fen());
        const from = results['0'].bestMove.slice(0, 2);
        const to = results['0'].bestMove.slice(2, 4);
        const promotion = results['0'].bestMove.slice(4, 5);
        
        const bestMoveResult = tempChess.move({
          from: from as any,
          to: to as any,
          promotion: promotion || undefined
        });
        
        if (bestMoveResult) {
          results['0'].bestMoveSan = bestMoveResult.san;
        }
      } catch (error) {
        console.warn('Failed to convert UCI to SAN for starting position:', error);
      }
    }
    
    // Convert best moves for each position
    for (let i = 0; i < game.moves.length; i++) {
      const move = game.moves[i];
      
      try {
        // Play the actual move
        chessReplay.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion
        });
        
        const positionKey = String(i + 1);
        const analysis = results[positionKey];
        
        if (analysis?.bestMove && !analysis.bestMoveSan) {
          try {
            const tempChess = new Chess(chessReplay.fen());
            const from = analysis.bestMove.slice(0, 2);
            const to = analysis.bestMove.slice(2, 4);
            const promotion = analysis.bestMove.slice(4, 5);
            
            const bestMoveResult = tempChess.move({
              from: from as any,
              to: to as any,
              promotion: promotion || undefined
            });
            
            if (bestMoveResult) {
              analysis.bestMoveSan = bestMoveResult.san;
            }
          } catch (error) {
            console.warn(`Failed to convert UCI to SAN for move ${i + 1}:`, error);
          }
        }
      } catch (error) {
        console.warn(`Failed to replay move ${i + 1} for SAN conversion:`, error);
      }
    }
    
    return results;
  } catch (error) {
    console.error('[IPC] Error analyzing game:', error);
    return null;
  }
}

/**
 * Destroys native Stockfish engine
 */
async function handleStockfishDestroy(): Promise<void> {
  if (nativeStockfish) {
    nativeStockfish.destroy();
    nativeStockfish = null;
  }
}

/**
 * Handles AI chat analysis requests
 */
async function handleAIChatAnalyze(
  _event: IpcMainInvokeEvent,
  pgn: string,
  fen: string,
  question: string
): Promise<AIChatResponse> {
  try {
    console.log(`[IPC] AI Chat analyzing position: ${question}`);
    return await aiChatService.analyzePosition(pgn, fen, question);
  } catch (error) {
    console.error('[IPC] Error in AI chat analysis:', error);
    throw error;
  }
} 