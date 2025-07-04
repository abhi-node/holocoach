/**
 * @fileoverview AI Chat shared types
 * @module shared/types/ai-chat
 * 
 * Shared type definitions for AI chat functionality
 * used by both main and renderer processes.
 */

/**
 * AI Chat request payload
 */
export interface AIChatRequest {
  pgn: string;
  fen: string;
  question: string;
}

/**
 * Chess move analysis line
 */
export interface AnalysisLine {
  line: number;
  evaluation: number;
  evaluationType: 'centipawns' | 'mate';
  depth: number | null;
  moves: string[];
  fullLine: string;
}

/**
 * Chess position evaluation
 */
export interface ChessEvaluation {
  score: number;
  type: 'centipawns' | 'mate';
}

/**
 * Stockfish analysis data
 */
export interface ChessAnalysis {
  bestmove: string | null;
  evaluation: ChessEvaluation | null;
  topLines: AnalysisLine[];
}

/**
 * AI Chat response
 */
export interface AIChatResponse {
  success: boolean;
  position: string;
  question: string;
  analysis: ChessAnalysis;
  aiResponse: string;
  timestamp: string;
} 