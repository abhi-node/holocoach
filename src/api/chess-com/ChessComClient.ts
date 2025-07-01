/**
 * @fileoverview Chess.com API Client
 * @module api/chess-com/ChessComClient
 * 
 * Implements Chess.com API integration with rate limiting
 * and game fetching functionality.
 * 
 * Rate limit: 30 requests per minute
 * API Docs: https://www.chess.com/news/view/published-data-api
 */

import { BaseAPIClient, APIResponse } from '../base/BaseAPIClient';

/**
 * Chess.com player profile
 */
export interface ChessComPlayer {
  username: string;
  player_id: number;
  status: string;
  name?: string;
  avatar?: string;
  country?: string;
  joined?: number;
  last_online?: number;
}

/**
 * Chess.com game data
 */
export interface ChessComGame {
  url: string;
  pgn: string;
  time_control: string;
  end_time: number;
  rated: boolean;
  tcn: string;
  uuid: string;
  initial_setup: string;
  fen: string;
  time_class: string;
  rules: string;
  white: {
    rating: number;
    result: string;
    username: string;
    uuid: string;
  };
  black: {
    rating: number;
    result: string;
    username: string;
    uuid: string;
  };
}

/**
 * Chess.com game archives response
 */
export interface ChessComArchives {
  archives: string[];
}

/**
 * Chess.com monthly games response
 */
export interface ChessComMonthlyGames {
  games: ChessComGame[];
}

/**
 * Chess.com API client
 */
export class ChessComClient extends BaseAPIClient {
  constructor() {
    super({
      baseURL: 'https://api.chess.com/pub',
      rateLimiter: {
        maxRequests: 30,
        timeWindow: 60000, // 1 minute
        name: 'Chess.com'
      },
      headers: {
        'User-Agent': 'HoloCoach/1.0'
      }
    });
  }
  
  /**
   * Validates username format
   */
  private validateUsername(username: string): string {
    // Chess.com usernames are case-insensitive and can contain letters, numbers, and underscores
    const cleaned = username.trim().toLowerCase();
    if (!/^[a-z0-9_-]+$/.test(cleaned)) {
      throw new Error('Invalid username format');
    }
    return cleaned;
  }
  
  /**
   * Gets player profile
   */
  async getPlayer(username: string): Promise<APIResponse<ChessComPlayer>> {
    const validUsername = this.validateUsername(username);
    return this.requestWithRetry<ChessComPlayer>(`/player/${validUsername}`);
  }
  
  /**
   * Gets player's game archives (list of months with games)
   */
  async getPlayerArchives(username: string): Promise<APIResponse<ChessComArchives>> {
    const validUsername = this.validateUsername(username);
    return this.requestWithRetry<ChessComArchives>(`/player/${validUsername}/games/archives`);
  }
  
  /**
   * Gets games from a specific month
   */
  async getMonthlyGames(archiveUrl: string): Promise<APIResponse<ChessComMonthlyGames>> {
    // Extract the path from the full URL
    const path = archiveUrl.replace('https://api.chess.com/pub', '');
    return this.requestWithRetry<ChessComMonthlyGames>(path);
  }
  
  /**
   * Gets the most recent games for a player
   */
  async getRecentGames(username: string, limit = 10): Promise<APIResponse<ChessComGame[]>> {
    try {
      // First get the list of archives
      const archivesResponse = await this.getPlayerArchives(username);
      
      if (!archivesResponse.success || !archivesResponse.data) {
        return {
          success: false,
          error: archivesResponse.error || 'Failed to fetch archives'
        };
      }
      
      const archives = archivesResponse.data.archives;
      
      if (archives.length === 0) {
        return {
          success: true,
          data: []
        };
      }
      
      // Get games from the most recent months
      const recentGames: ChessComGame[] = [];
      
      // Start from the most recent archive
      for (let i = archives.length - 1; i >= 0 && recentGames.length < limit; i--) {
        const monthlyResponse = await this.getMonthlyGames(archives[i]);
        
        if (monthlyResponse.success && monthlyResponse.data) {
          const games = monthlyResponse.data.games;
          
          // Sort games by end time (most recent first)
          games.sort((a, b) => b.end_time - a.end_time);
          
          // Add games up to the limit
          const remaining = limit - recentGames.length;
          recentGames.push(...games.slice(0, remaining));
        }
      }
      
      return {
        success: true,
        data: recentGames
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Validates if a username exists on Chess.com
   */
  async validateUser(username: string): Promise<boolean> {
    const response = await this.getPlayer(username);
    return response.success;
  }
} 