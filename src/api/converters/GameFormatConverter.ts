/**
 * @fileoverview Game Format Converter
 * @module api/converters/GameFormatConverter
 * 
 * Converts games from Chess.com and Lichess formats to our
 * unified ChessGame format for consistent handling.
 * 
 * @requires chess.js
 */

import { ChessGame, GameMetadata, GameSource } from '../../shared/types/chess';
import { ChessComGame } from '../chess-com/ChessComClient';
import { LichessGame } from '../lichess/LichessClient';

/**
 * Converts games from various sources to unified format
 */
export class GameFormatConverter {
  /**
   * Converts a Chess.com game to our unified format
   */
  static fromChessComGame(game: ChessComGame): ChessGame {
    // Extract date from end_time (Unix timestamp in seconds)
    const endDate = new Date(game.end_time * 1000);
    
    // Determine result
    let result: '1-0' | '0-1' | '1/2-1/2' | '*' = '*';
    if (game.white.result === 'win') result = '1-0';
    else if (game.black.result === 'win') result = '0-1';
    else if (game.white.result === 'agreed' || game.white.result === 'repetition' || 
             game.white.result === 'stalemate' || game.white.result === 'insufficient' ||
             game.white.result === '50move' || game.white.result === 'timevsinsufficient') {
      result = '1/2-1/2';
    }
    
    // Extract opening and ECO from PGN if available
    let opening = '';
    let eco = '';
    const ecoMatch = game.pgn.match(/\[ECO "([^"]+)"\]/);
    const openingMatch = game.pgn.match(/\[Opening "([^"]+)"\]/);
    
    if (ecoMatch) eco = ecoMatch[1];
    if (openingMatch) opening = openingMatch[1];
    
    const metadata: GameMetadata = {
      event: game.time_class,
      site: game.url,
      date: endDate.toISOString().split('T')[0],
      round: '',
      white: {
        name: game.white.username,
        rating: game.white.rating
      },
      black: {
        name: game.black.username,
        rating: game.black.rating
      },
      result,
      eco,
      opening,
      timeControl: game.time_control,
      source: 'chess.com' as GameSource,
      sourceId: game.uuid,
      sourceUrl: game.url
    };
    
    return {
      id: `chess.com_${game.uuid}`,
      pgn: game.pgn,
      metadata,
      moves: [], // Will be parsed later
      analysis: {
        engineEvaluations: [],
        moveQualities: [],
        annotations: []
      }
    };
  }
  
  /**
   * Converts a Lichess game to our unified format
   */
  static fromLichessGame(game: LichessGame): ChessGame {
    // Extract date from createdAt (Unix timestamp in milliseconds)
    const createdDate = new Date(game.createdAt);
    
    // Determine result
    let result: '1-0' | '0-1' | '1/2-1/2' | '*' = '*';
    if (game.winner === 'white') result = '1-0';
    else if (game.winner === 'black') result = '0-1';
    else if (game.status === 'draw' || game.status === 'stalemate') result = '1/2-1/2';
    
    // Format time control
    let timeControl = '';
    if (game.clock) {
      const initial = game.clock.initial / 60; // Convert to minutes
      const increment = game.clock.increment;
      timeControl = `${initial}+${increment}`;
    }
    
    const metadata: GameMetadata = {
      event: `Lichess ${game.speed}`,
      site: `https://lichess.org/${game.id}`,
      date: createdDate.toISOString().split('T')[0],
      round: '',
      white: {
        name: game.players.white.user?.name || 'Anonymous',
        rating: game.players.white.rating
      },
      black: {
        name: game.players.black.user?.name || 'Anonymous',
        rating: game.players.black.rating
      },
      result,
      eco: game.opening?.eco || '',
      opening: game.opening?.name || '',
      timeControl,
      source: 'lichess' as GameSource,
      sourceId: game.id,
      sourceUrl: `https://lichess.org/${game.id}`
    };
    
    // Lichess provides PGN in the pgn field
    const pgn = game.pgn || this.buildPGNFromLichessGame(game, metadata);
    
    return {
      id: `lichess_${game.id}`,
      pgn,
      metadata,
      moves: [], // Will be parsed later
      analysis: {
        engineEvaluations: [],
        moveQualities: [],
        annotations: []
      }
    };
  }
  
  /**
   * Builds PGN from Lichess game data if not provided
   */
  private static buildPGNFromLichessGame(game: LichessGame, metadata: GameMetadata): string {
    const headers = [
      `[Event "${metadata.event}"]`,
      `[Site "${metadata.site}"]`,
      `[Date "${metadata.date}"]`,
      `[Round "${metadata.round}"]`,
      `[White "${metadata.white.name}"]`,
      `[Black "${metadata.black.name}"]`,
      `[Result "${metadata.result}"]`,
      metadata.eco ? `[ECO "${metadata.eco}"]` : '',
      metadata.opening ? `[Opening "${metadata.opening}"]` : '',
      metadata.white.rating ? `[WhiteElo "${metadata.white.rating}"]` : '',
      metadata.black.rating ? `[BlackElo "${metadata.black.rating}"]` : '',
      metadata.timeControl ? `[TimeControl "${metadata.timeControl}"]` : '',
      `[Variant "${game.variant}"]`
    ].filter(Boolean);
    
    const moves = game.moves || '';
    
    return `${headers.join('\n')}\n\n${moves} ${metadata.result}`;
  }
  
  /**
   * Batch converts Chess.com games
   */
  static fromChessComGames(games: ChessComGame[]): ChessGame[] {
    return games.map(game => this.fromChessComGame(game));
  }
  
  /**
   * Batch converts Lichess games
   */
  static fromLichessGames(games: LichessGame[]): ChessGame[] {
    return games.map(game => this.fromLichessGame(game));
  }
  
  /**
   * Detects duplicate games based on moves and players
   */
  static findDuplicates(games: ChessGame[]): Map<string, ChessGame[]> {
    const duplicateGroups = new Map<string, ChessGame[]>();
    
    games.forEach(game => {
      // Create a unique key based on players, date, and first 10 moves
      const movesPrefix = game.pgn.split('\n\n')[1]?.substring(0, 50) || '';
      const key = `${game.metadata.white.name}_${game.metadata.black.name}_${game.metadata.date}_${movesPrefix}`;
      
      if (!duplicateGroups.has(key)) {
        duplicateGroups.set(key, []);
      }
      duplicateGroups.get(key)!.push(game);
    });
    
    // Filter out non-duplicate groups
    const actualDuplicates = new Map<string, ChessGame[]>();
    duplicateGroups.forEach((group, key) => {
      if (group.length > 1) {
        actualDuplicates.set(key, group);
      }
    });
    
    return actualDuplicates;
  }
  
  /**
   * Merges duplicate games, preferring the one with more data
   */
  static mergeDuplicates(games: ChessGame[]): ChessGame[] {
    const duplicates = this.findDuplicates(games);
    const processed = new Set<string>();
    const result: ChessGame[] = [];
    
    games.forEach(game => {
      if (processed.has(game.id)) return;
      
      // Check if this game is part of a duplicate group
      let isDuplicate = false;
      duplicates.forEach(group => {
        if (group.some(g => g.id === game.id)) {
          isDuplicate = true;
          // Use the game with the most complete data
          const best = group.reduce((prev, curr) => {
            const prevScore = (prev.metadata.eco ? 1 : 0) + 
                            (prev.metadata.opening ? 1 : 0) +
                            (prev.analysis.engineEvaluations.length > 0 ? 1 : 0);
            const currScore = (curr.metadata.eco ? 1 : 0) + 
                            (curr.metadata.opening ? 1 : 0) +
                            (curr.analysis.engineEvaluations.length > 0 ? 1 : 0);
            return currScore > prevScore ? curr : prev;
          });
          
          if (best.id === game.id) {
            result.push(best);
          }
          
          group.forEach(g => processed.add(g.id));
        }
      });
      
      if (!isDuplicate) {
        result.push(game);
        processed.add(game.id);
      }
    });
    
    return result;
  }
} 