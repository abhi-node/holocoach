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
  | 'okay'        // Not the best, but doesn't worsen the position
  | 'inaccuracy'  // Slightly worsens the position or loses part of an advantage
  | 'blunder';    // Significantly worse or completely loses an advantage

/**
 * Game source platform
 */
export type GameSource = 'chess.com' | 'lichess' | 'local';

/**
 * Player information
 */
export interface PlayerInfo {
  name: string;
  rating?: number;
}

/**
 * Chess game metadata
 */
export interface GameMetadata {
  /** Event name */
  event: string;
  /** Site/URL where game was played */
  site: string;
  /** Game date (YYYY-MM-DD format) */
  date: string;
  /** Round (for tournaments) */
  round: string;
  /** White player info */
  white: PlayerInfo;
  /** Black player info */
  black: PlayerInfo;
  /** Game result */
  result: '1-0' | '0-1' | '1/2-1/2' | '*';
  /** ECO opening code */
  eco?: string;
  /** Opening name */
  opening?: string;
  /** Time control */
  timeControl?: string;
  /** Source platform */
  source: GameSource;
  /** ID from source platform */
  sourceId: string;
  /** URL to view game on source platform */
  sourceUrl?: string;
}

/**
 * Game analysis data
 */
export interface GameAnalysis {
  /** Engine evaluations for each position */
  engineEvaluations: number[];
  /** Move quality classifications */
  moveQualities: MoveQuality[];
  /** AI annotations for moves */
  annotations: string[];
}

/**
 * Complete chess game representation
 */
export interface ChessGame {
  /** Unique game ID */
  id: string;
  /** Game metadata */
  metadata: GameMetadata;
  /** Game moves */
  moves: ChessMove[];
  /** Original PGN */
  pgn: string;
  /** Starting FEN (if not standard) */
  startingFen?: string;
  /** Analysis data */
  analysis: GameAnalysis;
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