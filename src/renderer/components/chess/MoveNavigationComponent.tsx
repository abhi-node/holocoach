/**
 * @fileoverview Move Navigation Component
 * @module renderer/components/chess/MoveNavigationComponent
 * 
 * Provides move list display and navigation controls for chess games.
 * Includes move quality indicators and keyboard navigation support.
 * 
 * @requires react
 * @requires chess.js
 */

import { useEffect, useRef } from 'react';
import { useChessStore } from '../../stores/useChessStore';
import { MoveQuality } from '../../../shared/types/chess';

/**
 * Gets the symbol for move quality
 */
function getMoveQualitySymbol(quality?: MoveQuality): string {
  switch (quality) {
    case 'best':
    case 'excellent':
    case 'good':
      return '✓';
    case 'inaccuracy':
      return '⚡';
    case 'mistake':
    case 'blunder':
      return '❌';
    default:
      return '';
  }
}

/**
 * Gets the CSS class for move quality
 */
function getMoveQualityClass(quality?: MoveQuality): string {
  switch (quality) {
    case 'best':
    case 'excellent':
    case 'good':
      return 'move-good';
    case 'inaccuracy':
      return 'move-inaccuracy';
    case 'mistake':
      return 'move-mistake';
    case 'blunder':
      return 'move-blunder';
    default:
      return '';
  }
}

/**
 * Formats evaluation score for display
 * Evaluations are always from White's perspective:
 * - Positive values mean White is better
 * - Negative values mean Black is better
 */
function formatEval(evaluation: number, mate?: number): string {
  if (mate !== undefined) {
    return `M${Math.abs(mate)}`;
  }
  
  const pawns = evaluation / 100;
  const sign = pawns > 0 ? '+' : '';
  
  if (Math.abs(pawns) >= 1) {
    return `${sign}${pawns.toFixed(1)}`;
  } else {
    return `${sign}${(evaluation / 100).toFixed(2)}`;
  }
}

/**
 * Calculate game statistics
 */
function calculateStats(moves: any[]) {
  const stats = {
    best: 0,
    good: 0,
    inaccurate: 0,
    bad: 0,
    total: 0,
    accuracy: 0
  };

  moves.forEach(move => {
    stats.total++;
    switch (move.quality) {
      case 'best':
      case 'excellent':
        stats.best++;
        break;
      case 'good':
        stats.good++;
        break;
      case 'inaccuracy':
        stats.inaccurate++;
        break;
      case 'mistake':
      case 'blunder':
        stats.bad++;
        break;
    }
  });

  // Calculate accuracy percentage
  const goodMoves = stats.best + stats.good;
  stats.accuracy = stats.total > 0 ? Math.round((goodMoves / stats.total) * 100) : 0;

  return stats;
}

/**
 * Props for MoveNavigationComponent
 */
export interface MoveNavigationComponentProps {
  /** Current best move from Stockfish analysis */
  bestMove?: string;
}

/**
 * Move Navigation Component with quality indicators
 */
export function MoveNavigationComponent({ bestMove }: MoveNavigationComponentProps): JSX.Element {
  const {
    currentGame,
    currentMoveIndex,
    goToMove,
    goToStart,
    goToEnd,
    nextMove,
    previousMove,
    gameAnalysis,
  } = useChessStore();

  const moveListRef = useRef<HTMLDivElement>(null);
  
  // Get analysis for current position
  // When viewing a move, we want the analysis BEFORE that move was played
  // So for move 0, we want analysis of starting position (index 0)
  // For move 1, we want analysis after move 0 (index 1), etc.
  const currentAnalysis = gameAnalysis?.get(currentMoveIndex) || null;
  
  // Auto-scroll to current move
  useEffect(() => {
    if (moveListRef.current && currentMoveIndex >= 0) {
      const activeMoveElement = moveListRef.current.querySelector('.move-active');
      if (activeMoveElement) {
        activeMoveElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentMoveIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          previousMove();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextMove();
          break;
        case 'Home':
          e.preventDefault();
          goToStart();
          break;
        case 'End':
          e.preventDefault();
          goToEnd();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextMove, previousMove, goToStart, goToEnd]);

  if (!currentGame) {
    return (
      <div className="move-navigation">
        <p className="text-muted">No game loaded</p>
      </div>
    );
  }

  const stats = calculateStats(currentGame.moves);

  return (
    <div className="move-navigation" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Move Quality Explanation */}
      <div className="move-explanation" style={{ 
        minHeight: '80px', 
        fontSize: '0.875rem',
        padding: '12px',
        background: 'var(--bg-surface)',
        borderRadius: '8px',
        border: '1px solid var(--border-default)'
      }}>
        {currentMoveIndex >= 0 && currentGame.moves[currentMoveIndex] ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Played:</strong> 
                <span style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '1rem',
                  fontWeight: '600' 
                }}>
                  {currentGame.moves[currentMoveIndex].san}
                </span>
                {getMoveQualitySymbol(currentGame.moves[currentMoveIndex].quality) && (
                  <span className={getMoveQualityClass(currentGame.moves[currentMoveIndex].quality)} style={{ fontSize: '1rem' }}>
                    {getMoveQualitySymbol(currentGame.moves[currentMoveIndex].quality)}
                  </span>
                )}
              </div>
              {currentAnalysis && (
                <div style={{ 
                  fontWeight: 'bold', 
                  fontSize: '1rem',
                  color: currentAnalysis.evaluation > 0 ? '#059669' : '#DC2626' 
                }}>
                  {formatEval(currentAnalysis.evaluation, currentAnalysis.mate)}
                </div>
              )}
            </div>
            {(currentAnalysis?.bestMoveSan || bestMove) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Best:</strong> 
                <span style={{ 
                  color: '#059669',
                  fontFamily: 'monospace',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}>
                  {currentAnalysis?.bestMoveSan || bestMove}
                </span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--text-muted)',
                  fontStyle: 'italic'
                }}>
                  (depth 22)
                </span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: 'var(--text-muted)'
            }}>
              <span>{currentMoveIndex === -1 ? 'Starting position' : 'No move at this position'}</span>
              {currentAnalysis && (
                <div style={{ 
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  color: currentAnalysis.evaluation > 0 ? '#059669' : '#DC2626' 
                }}>
                  {formatEval(currentAnalysis.evaluation, currentAnalysis.mate)}
                </div>
              )}
            </div>
            {currentAnalysis?.bestMoveSan && currentMoveIndex === -1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Best:</strong> 
                <span style={{ 
                  color: '#059669',
                  fontFamily: 'monospace',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}>
                  {currentAnalysis.bestMoveSan}
                </span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--text-muted)',
                  fontStyle: 'italic'
                }}>
                  (depth 22)
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="navigation-controls">
        <button onClick={goToStart} title="Go to start (Home)">
          ⏮ Start
        </button>
        <button onClick={previousMove} title="Previous move (←)">
          ◀ Prev
        </button>
        <button onClick={nextMove} title="Next move (→)">
          Next ▶
        </button>
        <button onClick={goToEnd} title="Go to end (End)">
          End ⏭
        </button>
      </div>

      {/* Move List with Quality Indicators */}
      <div className="move-list" ref={moveListRef} style={{ 
        flex: 1, 
        overflowY: 'auto',
        fontSize: '0.75rem',
        padding: '8px',
        background: 'rgba(0,0,0,0.02)',
        borderRadius: '4px',
        minHeight: 0
      }}>
        {currentGame.moves.map((move, index) => {
          const moveNumber = Math.floor(index / 2) + 1;
          const isWhite = index % 2 === 0;
          const isActive = index === currentMoveIndex;
          const qualitySymbol = getMoveQualitySymbol(move.quality);
          const qualityClass = getMoveQualityClass(move.quality);

          return (
            <div key={index} className="move-row" style={{ display: 'inline-flex', width: '50%' }}>
              {isWhite && (
                <span className="move-number" style={{ marginRight: '4px', opacity: 0.6 }}>{moveNumber}.</span>
              )}
              <span
                className={`move ${qualityClass} ${isActive ? 'move-active' : ''}`}
                onClick={() => goToMove(index)}
                style={{ 
                  cursor: 'pointer', 
                  padding: '2px 4px',
                  borderRadius: '2px',
                  fontWeight: isActive ? '600' : '400'
                }}
              >
                {move.san} {qualitySymbol}
              </span>
            </div>
          );
        })}
      </div>

      {/* Game Statistics */}
      <div className="game-statistics" style={{ fontSize: '0.75rem', padding: '8px 0' }}>
        <div className="quality-bar" style={{ 
          height: '16px', 
          background: 'rgba(0,0,0,0.1)', 
          borderRadius: '8px',
          position: 'relative',
          marginBottom: '8px'
        }}>
          <div 
            className="quality-bar-fill" 
            style={{ 
              width: `${stats.accuracy}%`,
              height: '100%',
              background: '#059669',
              borderRadius: '8px',
              transition: 'width 0.3s ease'
            }}
          />
          <span className="quality-percentage" style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontWeight: '600',
            fontSize: '0.625rem'
          }}>{stats.accuracy}%</span>
        </div>
        
        <div className="stats-breakdown" style={{ 
          display: 'flex', 
          justifyContent: 'space-around',
          fontSize: '0.625rem'
        }}>
          <span className="stat-item stat-best">
            Best: {stats.best}
          </span>
          <span className="stat-item stat-good">
            Good: {stats.good}
          </span>
          <span className="stat-item stat-inaccurate">
            Inaccurate: {stats.inaccurate}
          </span>
          <span className="stat-item stat-bad">
            Bad: {stats.bad}
          </span>
        </div>
      </div>
    </div>
  );
} 