/**
 * @fileoverview Game Analyzer Panel component
 * @module renderer/components/layout/GameAnalyzerPanel
 * 
 * Central panel component that displays the chess board, move list,
 * and game analysis controls.
 * 
 * @requires react
 */

import { ChessBoardComponent } from '../chess/ChessBoardComponent';
import { useChessStore } from '../../stores/useChessStore';
import { MoveNavigationComponent } from '../chess/MoveNavigationComponent';

/**
 * Game Analyzer Panel component
 */
export function GameAnalyzerPanel(): JSX.Element {
  const { currentGame } = useChessStore();
  
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
            
            <div className="analyzer-layout">
              <div className="board-section">
                <ChessBoardComponent />
              </div>
              
              <div className="moves-section">
                <MoveNavigationComponent />
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