/**
 * @fileoverview Comprehensive PGN Parser
 * @module chess/parser/PGNParser
 * 
 * Parses PGN (Portable Game Notation) files to extract game metadata,
 * moves, and analysis data. Handles multiple games and various PGN formats.
 * 
 * @requires chess.js
 */

import { Chess } from 'chess.js';
import { ChessGame, ChessMove, GameMetadata, MoveQuality } from '../../shared/types/chess';

/**
 * Raw PGN header tags
 */
interface PGNHeaders {
  [key: string]: string;
}

/**
 * Parsed PGN game data
 */
interface ParsedPGNGame {
  headers: PGNHeaders;
  moveText: string;
  comments: string[];
  annotations: string[];
}

/**
 * PGN parsing result
 */
export interface PGNParseResult {
  success: boolean;
  games: ChessGame[];
  errors: string[];
  warnings: string[];
}

/**
 * PGN Parser class for comprehensive game parsing
 */
export class PGNParser {
  private chess: Chess;
  private errors: string[] = [];
  private warnings: string[] = [];

  constructor() {
    this.chess = new Chess();
  }

  /**
   * Parses a PGN string containing one or more games
   */
  public parse(pgnString: string): PGNParseResult {
    this.errors = [];
    this.warnings = [];

    try {
      const rawGames = this.splitPGNGames(pgnString);
      const games: ChessGame[] = [];

      for (let i = 0; i < rawGames.length; i++) {
        try {
          const parsedGame = this.parseSingleGame(rawGames[i], i);
          if (parsedGame) {
            games.push(parsedGame);
          }
        } catch (error) {
          this.errors.push(`Game ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: this.errors.length === 0,
        games,
        errors: this.errors,
        warnings: this.warnings,
      };
    } catch (error) {
      this.errors.push(`PGN parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        games: [],
        errors: this.errors,
        warnings: this.warnings,
      };
    }
  }

  /**
   * Splits PGN string into individual games
   */
  private splitPGNGames(pgnString: string): string[] {
    // Remove extra whitespace and normalize line endings
    const normalized = pgnString.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Split on game boundaries (typically indicated by Event header)
    const games: string[] = [];
    const lines = normalized.split('\n');
    let currentGame: string[] = [];
    let inGame = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Start of new game (Event header)
      if (trimmed.startsWith('[Event ')) {
        if (inGame && currentGame.length > 0) {
          games.push(currentGame.join('\n'));
        }
        currentGame = [line];
        inGame = true;
      } else if (inGame) {
        currentGame.push(line);
      }
    }

    // Add the last game
    if (inGame && currentGame.length > 0) {
      games.push(currentGame.join('\n'));
    }

    return games.length > 0 ? games : [pgnString];
  }

  /**
   * Parses a single PGN game
   */
  private parseSingleGame(pgnString: string, gameIndex: number): ChessGame | null {
    try {
      // Parse headers and move text
      const parsed = this.parseGameStructure(pgnString);
      
      // Extract metadata from headers
      const metadata = this.extractMetadata(parsed.headers, gameIndex);
      
      // Parse moves using chess.js
      const moves = this.parseMoves(parsed.moveText, metadata.id);
      
      if (moves.length === 0) {
        this.warnings.push(`Game ${gameIndex + 1}: No valid moves found`);
        return null;
      }

      return {
        metadata,
        moves,
        pgn: pgnString.trim(),
        analyzed: false,
        startingFen: parsed.headers.FEN || undefined,
      };
    } catch (error) {
      throw new Error(`Failed to parse game: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parses PGN structure into headers and move text
   */
  private parseGameStructure(pgnString: string): ParsedPGNGame {
    const lines = pgnString.split('\n');
    const headers: PGNHeaders = {};
    const moveLines: string[] = [];
    const comments: string[] = [];
    const annotations: string[] = [];
    
    let inHeaders = true;
    let inMoves = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (!trimmed) {
        if (inHeaders) {
          inHeaders = false;
          inMoves = true;
        }
        continue;
      }

      // Parse header tags
      if (inHeaders && trimmed.startsWith('[') && trimmed.endsWith(']')) {
        const match = trimmed.match(/^\[(\w+)\s+"([^"]*)"\]$/);
        if (match) {
          headers[match[1]] = match[2];
        }
      } 
      // Parse move text
      else if (inMoves) {
        moveLines.push(trimmed);
      }
    }

    return {
      headers,
      moveText: moveLines.join(' '),
      comments,
      annotations,
    };
  }

  /**
   * Extracts game metadata from PGN headers
   */
  private extractMetadata(headers: PGNHeaders, gameIndex: number): GameMetadata {
    const id = headers.Site && headers.Round 
      ? `${headers.Site}-${headers.Round}`
      : `game-${gameIndex + 1}`;

    // Determine platform from Site header
    const site = headers.Site?.toLowerCase() || '';
    let platform: 'chess.com' | 'lichess' = 'chess.com';
    
    if (site.includes('lichess')) {
      platform = 'lichess';
    }

    // Parse date
    let date = new Date();
    if (headers.Date) {
      const dateMatch = headers.Date.match(/(\d{4})\.(\d{2})\.(\d{2})/);
      if (dateMatch) {
        date = new Date(parseInt(dateMatch[1]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[3]));
      }
    }

    // Parse ratings
    const whiteRating = headers.WhiteElo ? parseInt(headers.WhiteElo) : undefined;
    const blackRating = headers.BlackElo ? parseInt(headers.BlackElo) : undefined;

    // Validate result
    const result = this.parseResult(headers.Result);

    return {
      id,
      platform,
      white: headers.White || 'Unknown',
      black: headers.Black || 'Unknown',
      whiteRating,
      blackRating,
      result,
      timeControl: headers.TimeControl,
      date,
      opening: headers.Opening,
      eco: headers.ECO,
      url: headers.Link || headers.Site,
    };
  }

  /**
   * Parses game result
   */
  private parseResult(resultString?: string): '1-0' | '0-1' | '1/2-1/2' | '*' {
    if (!resultString) return '*';
    
    switch (resultString.trim()) {
      case '1-0': return '1-0';
      case '0-1': return '0-1';
      case '1/2-1/2': return '1/2-1/2';
      default: return '*';
    }
  }

  /**
   * Parses moves from move text using chess.js
   */
  private parseMoves(moveText: string, gameId: string): ChessMove[] {
    try {
      // Clean up move text
      const cleanMoveText = this.cleanMoveText(moveText);
      
      // Initialize chess.js
      this.chess.reset();
      
      // Parse moves manually instead of using loadPgn
      const moves: ChessMove[] = [];
      const moveTokens = this.extractMoveTokens(cleanMoveText);
      
      for (let i = 0; i < moveTokens.length; i++) {
        const moveToken = moveTokens[i];
        
        try {
          // Make the move
          const move = this.chess.move(moveToken);
          if (!move) {
            this.warnings.push(`${gameId}: Invalid move ${i + 1}: ${moveToken}`);
            continue;
          }

          // Create our move object
          const chessMove: ChessMove = {
            san: move.san,
            uci: `${move.from}${move.to}${move.promotion || ''}`,
            from: move.from,
            to: move.to,
            piece: move.piece,
            captured: move.captured,
            promotion: move.promotion,
            check: this.chess.inCheck(),
            checkmate: this.chess.isCheckmate(),
            fen: this.chess.fen(),
            moveNumber: Math.floor(i / 2) + 1,
            // Analysis data will be added later
            evaluation: undefined,
            bestMove: undefined,
            quality: this.inferMoveQuality(i, move.captured),
            annotation: undefined,
          };

          moves.push(chessMove);
        } catch (moveError) {
          this.warnings.push(`${gameId}: Failed to parse move ${i + 1}: ${moveToken}`);
          continue;
        }
      }

      return moves;
    } catch (error) {
      throw new Error(`Move parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Cleans move text for chess.js parsing
   */
  private cleanMoveText(moveText: string): string {
    return moveText
      // Remove comments in braces
      .replace(/\{[^}]*\}/g, '')
      // Remove annotations
      .replace(/\$\d+/g, '')
      // Remove variation parentheses (basic)
      .replace(/\([^)]*\)/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extracts individual move tokens from cleaned move text
   */
  private extractMoveTokens(moveText: string): string[] {
    const tokens: string[] = [];
    
    // Split by spaces and filter out move numbers and result
    const parts = moveText.split(/\s+/);
    
    for (const part of parts) {
      // Skip move numbers (1., 2., etc.)
      if (/^\d+\./.test(part)) {
        continue;
      }
      
      // Skip game result
      if (['1-0', '0-1', '1/2-1/2', '*'].includes(part)) {
        continue;
      }
      
      // Skip empty parts
      if (!part.trim()) {
        continue;
      }
      
      // This should be a move
      tokens.push(part.trim());
    }
    
    return tokens;
  }

  /**
   * Infers basic move quality (will be enhanced with engine analysis later)
   */
  private inferMoveQuality(moveIndex: number, captured?: string): MoveQuality | undefined {
    // Basic heuristics for now
    if (captured && ['q', 'r'].includes(captured)) {
      return 'excellent'; // Capturing major pieces
    }
    
    if (moveIndex < 10) {
      return undefined; // Opening moves are hard to judge
    }
    
    // Random quality for demonstration (will be replaced with real analysis)
    const rand = Math.random();
    if (rand < 0.1) return 'best';
    if (rand < 0.2) return 'excellent';
    if (rand < 0.4) return 'good';
    if (rand < 0.6) return undefined;
    if (rand < 0.8) return 'inaccuracy';
    if (rand < 0.95) return 'mistake';
    return 'blunder';
  }

  /**
   * Validates a PGN string before parsing
   */
  public static validate(pgnString: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!pgnString || pgnString.trim().length === 0) {
      errors.push('PGN string is empty');
      return { isValid: false, errors };
    }

    // Check for basic PGN structure
    if (!pgnString.includes('[Event ')) {
      errors.push('No Event header found');
    }

    // Check for move text
    const hasMovesPattern = /\d+\.\s*[a-hKQRBN]/;
    if (!hasMovesPattern.test(pgnString)) {
      errors.push('No valid chess moves found');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Convenience function to parse a single PGN string
 */
export function parsePGN(pgnString: string): PGNParseResult {
  const parser = new PGNParser();
  return parser.parse(pgnString);
}

/**
 * Convenience function to parse multiple PGN files
 */
export function parsePGNFile(fileContent: string): PGNParseResult {
  return parsePGN(fileContent);
} 