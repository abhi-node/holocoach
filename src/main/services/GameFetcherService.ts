/**
 * @fileoverview Game Fetcher Service
 * @module main/services/GameFetcherService
 * 
 * Handles fetching games from Chess.com and Lichess APIs
 * in the main process for security and CORS avoidance.
 * 
 * @requires api/clients
 */

import { ChessComClient } from '../../api/chess-com/ChessComClient';
import { LichessClient } from '../../api/lichess/LichessClient';
import { GameFormatConverter } from '../../api/converters/GameFormatConverter';
import { PGNParser } from '../../chess/parser/PGNParser';
import { ChessGame } from '../../shared/types/chess';

/**
 * Game fetch progress event
 */
export interface GameFetchProgress {
  stage: 'validating' | 'fetching' | 'parsing' | 'complete' | 'error';
  message: string;
  current?: number;
  total?: number;
  games?: ChessGame[];
  error?: string;
}

/**
 * Game fetcher service for main process
 */
export class GameFetcherService {
  private chessComClient: ChessComClient;
  private lichessClient: LichessClient;
  private pgnParser: PGNParser;
  
  constructor() {
    this.chessComClient = new ChessComClient();
    this.lichessClient = new LichessClient();
    this.pgnParser = new PGNParser();
  }
  
  /**
   * Fetches recent games for a user from the specified platform
   */
  async fetchGames(
    username: string,
    platform: 'chess.com' | 'lichess',
    limit = 10,
    onProgress?: (progress: GameFetchProgress) => void
  ): Promise<ChessGame[]> {
    try {
      // Report validation stage
      onProgress?.({
        stage: 'validating',
        message: `Validating ${username} on ${platform}...`
      });
      
      // Validate user exists
      const isValid = platform === 'chess.com' 
        ? await this.chessComClient.validateUser(username)
        : await this.lichessClient.validateUser(username);
        
      if (!isValid) {
        throw new Error(`User "${username}" not found on ${platform}`);
      }
      
      // Report fetching stage
      onProgress?.({
        stage: 'fetching',
        message: `Fetching games from ${platform}...`,
        current: 0,
        total: limit
      });
      
      // Fetch games based on platform
      let games: ChessGame[] = [];
      
      if (platform === 'chess.com') {
        const response = await this.chessComClient.getRecentGames(username, limit);
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch games from Chess.com');
        }
        
        games = GameFormatConverter.fromChessComGames(response.data);
      } else {
        const response = await this.lichessClient.getRecentGames(username, limit);
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch games from Lichess');
        }
        
        games = GameFormatConverter.fromLichessGames(response.data);
      }
      
      // Report parsing stage
      onProgress?.({
        stage: 'parsing',
        message: 'Parsing game data...',
        current: 0,
        total: games.length
      });
      
      // Parse moves for each game
      const parsedGames: ChessGame[] = [];
      
      for (let i = 0; i < games.length; i++) {
        const game = games[i];
        
        // Parse the PGN to extract moves
        const parseResult = this.pgnParser.parse(game.pgn);
        
        if (parseResult.success && parseResult.games.length > 0) {
          const parsedGame = parseResult.games[0];
          // Merge the parsed moves with our game data
          game.moves = parsedGame.moves;
          parsedGames.push(game);
          
          onProgress?.({
            stage: 'parsing',
            message: 'Parsing game data...',
            current: i + 1,
            total: games.length
          });
        } else {
          console.warn(`Failed to parse game ${game.id}:`, parseResult.errors);
        }
      }
      
      // Remove duplicates
      const uniqueGames = GameFormatConverter.mergeDuplicates(parsedGames);
      
      // Report completion
      onProgress?.({
        stage: 'complete',
        message: `Successfully fetched ${uniqueGames.length} games`,
        games: uniqueGames
      });
      
      return uniqueGames;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      onProgress?.({
        stage: 'error',
        message: 'Failed to fetch games',
        error: errorMessage
      });
      
      throw error;
    }
  }
  
  /**
   * Gets rate limiter status for both platforms
   */
  getRateLimiterStatus() {
    return {
      chesscom: this.chessComClient.getRateLimiterStatus(),
      lichess: this.lichessClient.getRateLimiterStatus()
    };
  }
} 