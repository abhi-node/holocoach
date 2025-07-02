/**
 * @fileoverview Game Analyzer Panel component
 * @module renderer/components/layout/GameAnalyzerPanel
 * 
 * Central panel component that displays the chess board, move list,
 * and game analysis controls with Stockfish evaluation.
 * 
 * @requires react
 */

import { ChessBoardComponent } from '../chess/ChessBoardComponent';
import { useChessStore } from '../../stores/useChessStore';
import { MoveNavigationComponent } from '../chess/MoveNavigationComponent';
import { EvalBar } from '../chess/EvalBar';
import { useStockfishAnalysis } from '../../hooks/useStockfishAnalysis';

/**
 * Game Analyzer Panel component
 */
export function GameAnalyzerPanel(): JSX.Element {
  const { currentGame, chess, isAnalyzingGame, analysisProgress, currentMoveIndex } = useChessStore();
  
  // Calculate current ply (currentMoveIndex + 1, where -1 = starting position = ply 0)
  const currentPly = currentGame ? currentMoveIndex + 1 : null;
  const { analysis } = useStockfishAnalysis(currentPly);
  
  // Use stored analysis from game analysis
  const displayAnalysis = analysis;
  
  return (
    <div className="game-analyzer-panel">
      <div className="panel-header">
        <h2 className="panel-title">Game Analyzer</h2>
      </div>
      
      <div className="panel-content">
        {currentGame ? (
          <>
            <div className="game-header">
              <div className="game-players-summary">
                <strong>{currentGame.metadata.white.name}</strong> 
                {currentGame.metadata.white.rating && ` (${currentGame.metadata.white.rating})`} vs{' '}
                <strong>{currentGame.metadata.black.name}</strong>
                {currentGame.metadata.black.rating && ` (${currentGame.metadata.black.rating})`}
              </div>
              
              <div className="game-details-summary">
                {currentGame.metadata.opening} • {currentGame.metadata.date}
              </div>
            </div>
            
            <div className="analyzer-layout" style={{ position: 'relative' }}>
              {isAnalyzingGame && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                }}>
                  <div style={{
                    backgroundColor: 'var(--bg-panel)',
                    padding: '24px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  }}>
                    <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
                      Analyzing Game
                    </h3>
                    <div style={{
                      width: '200px',
                      height: '8px',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginBottom: '8px',
                    }}>
                      <div style={{
                        width: `${analysisProgress}%`,
                        height: '100%',
                        backgroundColor: 'var(--text-primary)',
                        transition: 'width 300ms ease-out',
                      }} />
                    </div>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '0.875rem', 
                      color: 'var(--text-secondary)' 
                    }}>
                      {analysisProgress}% complete
                    </p>
                  </div>
                </div>
              )}
              
              <div className="board-section">
                <ChessBoardComponent />
                <div style={{
                  width: '400px',
                  margin: '0 auto',
                  marginTop: '8px'
                }}>
                  <EvalBar 
                    evaluation={displayAnalysis?.evaluation || 0} 
                    mate={displayAnalysis?.mate}
                    height={24}
                    isAnalyzing={isAnalyzingGame}
                  />
                </div>
              </div>
              
              <div className="moves-section">
                <MoveNavigationComponent bestMove={displayAnalysis?.bestMoveSan} />
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">♟</div>
            <h3>No Game Selected</h3>
            <p>Select a game from the list or load sample games to begin analysis</p>
          </div>
        )}
      </div>
    </div>
  );
} 