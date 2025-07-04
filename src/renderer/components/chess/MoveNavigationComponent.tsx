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
import { MoveClassifier } from '../../../chess/analysis/MoveClassifier';

/**
 * Gets the symbol for move quality
 */
function getMoveQualitySymbol(quality?: MoveQuality): string {
  switch (quality) {
    case 'best':
      return '✓';
    case 'okay':
      return '○';
    case 'inaccuracy':
      return '⚡';
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
      return 'move-best';
    case 'okay':
      return 'move-okay';
    case 'inaccuracy':
      return 'move-inaccuracy';
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
 * Gets color for accuracy percentage
 */
function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 95) return '#10B981'; // Excellent - emerald
  if (accuracy >= 90) return '#059669'; // Great - green
  if (accuracy >= 80) return '#65A30D'; // Good - lime
  if (accuracy >= 70) return '#CA8A04'; // Decent - yellow
  if (accuracy >= 60) return '#EA580C'; // Okay - orange
  return '#DC2626'; // Needs work - red
}

/**
 * Calculate game statistics by side
 */
function calculateStatsBySide(moves: any[]) {
  const whiteStats = {
    best: 0,
    okay: 0,
    inaccurate: 0,
    blunder: 0,
    total: 0,
    accuracy: 0,
    acpl: 0
  };

  const blackStats = {
    best: 0,
    okay: 0,
    inaccurate: 0,
    blunder: 0,
    total: 0,
    accuracy: 0,
    acpl: 0
  };

  const whiteQualities: MoveQuality[] = [];
  const blackQualities: MoveQuality[] = [];

  moves.forEach((move, index) => {
    const isWhite = index % 2 === 0;
    const stats = isWhite ? whiteStats : blackStats;
    const qualities = isWhite ? whiteQualities : blackQualities;
    
    stats.total++;
    
    if (move.quality) {
      qualities.push(move.quality);
      
      switch (move.quality) {
        case 'best':
          stats.best++;
          break;
        case 'okay':
          stats.okay++;
          break;
        case 'inaccuracy':
          stats.inaccurate++;
          break;
        case 'blunder':
          stats.blunder++;
          break;
      }
    }
  });

  // Calculate Chess.com-like accuracy using move qualities
  whiteStats.accuracy = MoveClassifier.computeAccuracyFromQualities(whiteQualities);
  blackStats.accuracy = MoveClassifier.computeAccuracyFromQualities(blackQualities);

  return { white: whiteStats, black: blackStats };
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
  // When viewing a move, we want the analysis AFTER that move was played
  // So for move 0, we want analysis from position 1 (after move 0)
  // For move 1, we want analysis from position 2 (after move 1), etc.
  const currentAnalysis = currentMoveIndex >= 0 
    ? gameAnalysis?.get(currentMoveIndex + 1) || null 
    : gameAnalysis?.get(0) || null; // Starting position
  
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

  const stats = calculateStatsBySide(currentGame.moves);

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
        {Array.from({ length: Math.ceil(currentGame.moves.length / 2) }, (_, moveNumberIndex) => {
          const moveNumber = moveNumberIndex + 1;
          const whiteIndex = moveNumberIndex * 2;
          const blackIndex = whiteIndex + 1;
          const whiteMove = currentGame.moves[whiteIndex];
          const blackMove = currentGame.moves[blackIndex];

          return (
            <div key={moveNumber} className="move-pair" style={{ 
              display: 'flex', 
              alignItems: 'center',
              marginBottom: '2px',
              gap: '8px'
            }}>
              <span className="move-number" style={{ 
                minWidth: '24px',
                opacity: 0.6,
                fontSize: '0.7rem'
              }}>
                {moveNumber}.
              </span>
              
              {/* White Move */}
              <span
                className={`move ${getMoveQualityClass(whiteMove.quality)} ${whiteIndex === currentMoveIndex ? 'move-active' : ''}`}
                onClick={() => goToMove(whiteIndex)}
                style={{ 
                  cursor: 'pointer', 
                  padding: '2px 4px',
                  borderRadius: '2px',
                  fontWeight: whiteIndex === currentMoveIndex ? '600' : '400',
                  minWidth: '60px'
                }}
              >
                {whiteMove.san} {getMoveQualitySymbol(whiteMove.quality)}
              </span>
              
              {/* Black Move (if exists) */}
              {blackMove && (
                <span
                  className={`move ${getMoveQualityClass(blackMove.quality)} ${blackIndex === currentMoveIndex ? 'move-active' : ''}`}
                  onClick={() => goToMove(blackIndex)}
                  style={{ 
                    cursor: 'pointer', 
                    padding: '2px 4px',
                    borderRadius: '2px',
                    fontWeight: blackIndex === currentMoveIndex ? '600' : '400',
                    minWidth: '60px'
                  }}
                >
                  {blackMove.san} {getMoveQualitySymbol(blackMove.quality)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Game Statistics by Side */}
      <div className="game-statistics" style={{ fontSize: '0.75rem', padding: '8px 0' }}>
        {/* White Player Statistics */}
        <div className="player-stats" style={{ marginBottom: '12px' }}>
          <div className="player-header" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '6px'
          }}>
            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
              ⚪ White ({stats.white.total} moves)
            </span>
            <span style={{ fontWeight: '600', fontSize: '0.75rem' }}>
              {stats.white.accuracy}% • {MoveClassifier.getAccuracyDescription(stats.white.accuracy)}
            </span>
          </div>
          <div className="quality-bar" style={{ 
            height: '12px', 
            background: 'rgba(0,0,0,0.1)', 
            borderRadius: '6px',
            position: 'relative',
            marginBottom: '6px'
          }}>
            <div 
              className="quality-bar-fill" 
              style={{ 
                width: `${stats.white.accuracy}%`,
                height: '100%',
                background: getAccuracyColor(stats.white.accuracy),
                borderRadius: '6px',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
          <div className="stats-breakdown" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '4px',
            fontSize: '0.6rem'
          }}>
            <span className="stat-item stat-best">
              ✓ {stats.white.best}
            </span>
            <span className="stat-item stat-okay">
              ○ {stats.white.okay}
            </span>
            <span className="stat-item stat-inaccurate">
              ⚡ {stats.white.inaccurate}
            </span>
            <span className="stat-item stat-blunder">
              ❌ {stats.white.blunder}
            </span>
          </div>
        </div>

        {/* Black Player Statistics */}
        <div className="player-stats">
          <div className="player-header" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '6px'
          }}>
            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
              ⚫ Black ({stats.black.total} moves)
            </span>
            <span style={{ fontWeight: '600', fontSize: '0.75rem' }}>
              {stats.black.accuracy}% • {MoveClassifier.getAccuracyDescription(stats.black.accuracy)}
            </span>
          </div>
          <div className="quality-bar" style={{ 
            height: '12px', 
            background: 'rgba(0,0,0,0.1)', 
            borderRadius: '6px',
            position: 'relative',
            marginBottom: '6px'
          }}>
            <div 
              className="quality-bar-fill" 
              style={{ 
                width: `${stats.black.accuracy}%`,
                height: '100%',
                background: getAccuracyColor(stats.black.accuracy),
                borderRadius: '6px',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
          <div className="stats-breakdown" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '4px',
            fontSize: '0.6rem'
          }}>
            <span className="stat-item stat-best">
              ✓ {stats.black.best}
            </span>
            <span className="stat-item stat-okay">
              ○ {stats.black.okay}
            </span>
            <span className="stat-item stat-inaccurate">
              ⚡ {stats.black.inaccurate}
            </span>
            <span className="stat-item stat-blunder">
              ❌ {stats.black.blunder}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 