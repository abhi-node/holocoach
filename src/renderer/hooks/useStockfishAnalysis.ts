/**
 * @fileoverview Hook for accessing stored Stockfish analysis from the chess store
 * This hook provides access to pre-analyzed game data without performing live analysis
 */

import { useChessStore } from '../stores/useChessStore';

export interface UseStockfishAnalysisState {
  analysis: {
    evaluation: number;
    bestMove: string;
    bestMoveSan?: string;
    depth: number;
    mate?: number;
  } | null;
  isAnalyzing: boolean;
  isReady: boolean;
  error: string | null;
}

/**
 * Hook for accessing stored Stockfish analysis
 * @param currentPly - The current ply to get analysis for
 * @returns The stored analysis state for the current position
 */
export function useStockfishAnalysis(currentPly: number | null): UseStockfishAnalysisState {
  // Get stored analysis from chess store
  const gameAnalysis = useChessStore(state => state.gameAnalysis);
  const isAnalyzingGame = useChessStore(state => state.isAnalyzingGame);
  
  // Return empty state if no ply specified
  if (currentPly === null) {
    return {
      analysis: null,
      isAnalyzing: false,
      isReady: true,
      error: null,
    };
  }
  
  // Get analysis for current ply
  const analysis = gameAnalysis?.get(currentPly) || null;
  
  return {
    analysis,
    isAnalyzing: isAnalyzingGame,
    isReady: !isAnalyzingGame,
    error: null,
  };
} 