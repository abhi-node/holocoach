/**
 * @fileoverview Lichess API Client
 * @module api/lichess/LichessClient
 * 
 * Implements Lichess API integration with rate limiting
 * and game fetching functionality.
 * 
 * Rate limit: 120 requests per minute
 * API Docs: https://lichess.org/api
 */

import { BaseAPIClient, APIResponse } from '../base/BaseAPIClient';

/**
 * Lichess user profile
 */
export interface LichessUser {
  id: string;
  username: string;
  perfs: {
    blitz?: { games: number; rating: number; rd: number; prog: number };
    bullet?: { games: number; rating: number; rd: number; prog: number };
    rapid?: { games: number; rating: number; rd: number; prog: number };
    classical?: { games: number; rating: number; rd: number; prog: number };
    correspondence?: { games: number; rating: number; rd: number; prog: number };
  };
  createdAt: number;
  disabled?: boolean;
  tosViolation?: boolean;
  profile?: {
    country?: string;
    location?: string;
    bio?: string;
    firstName?: string;
    lastName?: string;
    links?: string;
  };
  seenAt?: number;
  patron?: boolean;
  verified?: boolean;
  playTime?: {
    total: number;
    tv: number;
  };
  title?: string;
}

/**
 * Lichess game data (from export endpoint)
 */
export interface LichessGame {
  id: string;
  rated: boolean;
  variant: string;
  speed: string;
  perf: string;
  createdAt: number;
  lastMoveAt: number;
  status: string;
  players: {
    white: {
      user?: {
        name: string;
        id: string;
      };
      rating?: number;
      ratingDiff?: number;
    };
    black: {
      user?: {
        name: string;
        id: string;
      };
      rating?: number;
      ratingDiff?: number;
    };
  };
  winner?: string;
  opening?: {
    eco: string;
    name: string;
    ply: number;
  };
  moves?: string;
  pgn?: string;
  clock?: {
    initial: number;
    increment: number;
    totalTime: number;
  };
}

/**
 * Options for fetching games
 */
export interface LichessGameOptions {
  max?: number;
  since?: number;
  until?: number;
  perfType?: string;
  color?: string;
  rated?: boolean;
  analysed?: boolean;
  moves?: boolean;
  pgnInJson?: boolean;
  tags?: boolean;
  clocks?: boolean;
  evals?: boolean;
  opening?: boolean;
}

/**
 * Lichess API client
 */
export class LichessClient extends BaseAPIClient {
  constructor() {
    super({
      baseURL: 'https://lichess.org/api',
      rateLimiter: {
        maxRequests: 120,
        timeWindow: 60000, // 1 minute
        name: 'Lichess'
      },
      headers: {
        'Accept': 'application/json'
      }
    });
  }
  
  /**
   * Validates username format
   */
  private validateUsername(username: string): string {
    // Lichess usernames can contain letters, numbers, and underscores
    const cleaned = username.trim();
    if (!/^[a-zA-Z0-9_-]+$/.test(cleaned)) {
      throw new Error('Invalid username format');
    }
    return cleaned;
  }
  
  /**
   * Gets user profile
   */
  async getUser(username: string): Promise<APIResponse<LichessUser>> {
    const validUsername = this.validateUsername(username);
    return this.requestWithRetry<LichessUser>(`/user/${validUsername}`);
  }
  
  /**
   * Gets user's games
   * Note: This endpoint returns NDJSON, so we need special handling
   */
  async getUserGames(
    username: string,
    options: LichessGameOptions = {}
  ): Promise<APIResponse<LichessGame[]>> {
    const validUsername = this.validateUsername(username);
    
    // Build query parameters
    const params = new URLSearchParams();
    if (options.max) params.set('max', options.max.toString());
    if (options.since) params.set('since', options.since.toString());
    if (options.until) params.set('until', options.until.toString());
    if (options.perfType) params.set('perfType', options.perfType);
    if (options.color) params.set('color', options.color);
    if (options.rated !== undefined) params.set('rated', options.rated.toString());
    if (options.analysed !== undefined) params.set('analysed', options.analysed.toString());
    if (options.moves !== undefined) params.set('moves', options.moves.toString());
    if (options.pgnInJson !== undefined) params.set('pgnInJson', options.pgnInJson.toString());
    if (options.tags !== undefined) params.set('tags', options.tags.toString());
    if (options.clocks !== undefined) params.set('clocks', options.clocks.toString());
    if (options.evals !== undefined) params.set('evals', options.evals.toString());
    if (options.opening !== undefined) params.set('opening', options.opening.toString());
    
    const endpoint = `/games/user/${validUsername}?${params.toString()}`;
    
    // Special handling for NDJSON response
    await this.rateLimiter.acquire();
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          ...this.headers,
          'Accept': 'application/x-ndjson'
        }
      });
      
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status
        };
      }
      
      const text = await response.text();
      const lines = text.trim().split('\n').filter(line => line);
      const games: LichessGame[] = [];
      
      for (const line of lines) {
        try {
          const game = JSON.parse(line);
          games.push(game);
        } catch (e) {
          console.error('Failed to parse game JSON:', e);
        }
      }
      
      return {
        success: true,
        data: games
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Gets the most recent games for a player
   */
  async getRecentGames(username: string, limit = 10): Promise<APIResponse<LichessGame[]>> {
    return this.getUserGames(username, {
      max: limit,
      moves: true,
      pgnInJson: true,
      opening: true,
      tags: true,
      clocks: true
    });
  }
  
  /**
   * Validates if a username exists on Lichess
   */
  async validateUser(username: string): Promise<boolean> {
    const response = await this.getUser(username);
    return response.success;
  }
  
  /**
   * Exports a single game by ID
   */
  async getGame(gameId: string, includePGN = true): Promise<APIResponse<LichessGame>> {
    const params = new URLSearchParams();
    if (includePGN) {
      params.set('pgnInJson', 'true');
      params.set('tags', 'true');
      params.set('clocks', 'true');
      params.set('opening', 'true');
    }
    
    return this.requestWithRetry<LichessGame>(`/game/export/${gameId}?${params.toString()}`);
  }
} 