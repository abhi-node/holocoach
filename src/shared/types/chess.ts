/**
 * @fileoverview Chess-specific types and interfaces
 * @module shared/types/chess
 * 
 * Defines TypeScript interfaces for chess games, moves, positions,
 * and analysis data used throughout the application.
 * 
 * @requires chess.js
 */

import { Chess, Square, PieceSymbol, Color } from 'chess.js';

/**
 * Chess piece representation
 */
export interface ChessPiece {
  type: PieceSymbol;
  color: Color;
}

/**
 * Chess move with metadata
 */
export interface ChessMove {
  /** Standard algebraic notation */
  san: string;
  /** UCI notation (e.g., 'e2e4') */
  uci: string;
  /** Source square */
  from: Square;
  /** Destination square */
  to: Square;
  /** Piece being moved */
  piece: PieceSymbol;
  /** Captured piece (if any) */
  captured?: PieceSymbol;
  /** Promotion piece (if any) */
  promotion?: PieceSymbol;
  /** Whether move is check */
  check: boolean;
  /** Whether move is checkmate */
  checkmate: boolean;
  /** FEN position after move */
  fen: string;
  /** Move number */
  moveNumber: number;
  /** Analysis evaluation (centipawns) */
  evaluation?: number;
  /** Best move according to engine */
  bestMove?: string;
  /** Move quality classification */
  quality?: MoveQuality;
  /** AI annotation for this move */
  annotation?: string;
}

/**
 * Move quality classifications
 */
export type MoveQuality = 
  | 'best'        // Engine's top choice
  | 'excellent'   // Within 25cp of best
  | 'good'        // Within 50cp of best  
  | 'inaccuracy'  // 50-100cp worse
  | 'mistake'     // 100-200cp worse
  | 'blunder';    // 200cp+ worse

/**
 * Chess game metadata
 */
export interface GameMetadata {
  /** Game ID from platform */
  id: string;
  /** Platform (chess.com, lichess) */
  platform: 'chess.com' | 'lichess';
  /** White player name */
  white: string;
  /** Black player name */
  black: string;
  /** White player rating */
  whiteRating?: number;
  /** Black player rating */
  blackRating?: number;
  /** Game result */
  result: '1-0' | '0-1' | '1/2-1/2' | '*';
  /** Time control */
  timeControl?: string;
  /** Game date */
  date: Date;
  /** Opening name */
  opening?: string;
  /** ECO code */
  eco?: string;
  /** Game URL */
  url?: string;
}

/**
 * Complete chess game representation
 */
export interface ChessGame {
  /** Game metadata */
  metadata: GameMetadata;
  /** Game moves */
  moves: ChessMove[];
  /** Original PGN */
  pgn: string;
  /** Starting FEN (if not standard) */
  startingFen?: string;
  /** Whether game has been analyzed */
  analyzed: boolean;
  /** Analysis completion timestamp */
  analyzedAt?: Date;
}

/**
 * Current game state for UI
 */
export interface GameState {
  /** Chess.js instance */
  chess: Chess;
  /** Current game */
  currentGame: ChessGame | null;
  /** Currently selected move index */
  currentMoveIndex: number;
  /** Whether board is flipped */
  boardFlipped: boolean;
  /** Selected square for highlighting */
  selectedSquare: Square | null;
  /** Possible moves from selected square */
  possibleMoves: Square[];
  /** Last move for highlighting */
  lastMove: { from: Square; to: Square } | null;
  /** Whether game is loading */
  isLoading: boolean;
}

/**
 * Board orientation
 */
export type BoardOrientation = 'white' | 'black';

/**
 * Square coordinates for rendering
 */
export interface SquareCoordinates {
  file: string;
  rank: string;
  square: Square;
  isLight: boolean;
  piece: ChessPiece | null;
  isHighlighted: boolean;
  isSelected: boolean;
  isPossibleMove: boolean;
  isLastMove: boolean;
}

/**
 * Drag and drop state
 */
export interface DragState {
  isDragging: boolean;
  draggedPiece: ChessPiece | null;
  sourceSquare: Square | null;
  targetSquare: Square | null;
} 