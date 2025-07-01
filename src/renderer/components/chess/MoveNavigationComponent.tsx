/**
 * @fileoverview Move Navigation Component with quality indicators
 * @module renderer/components/chess/MoveNavigationComponent
 * 
 * Displays chess moves with quality indicators, navigation controls,
 * and game statistics as described in the user flow.
 * 
 * @requires react
 * @requires chess
 */

import React, { useEffect, useRef } from 'react';
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
 * Move Navigation Component with quality indicators
 */
export function MoveNavigationComponent(): JSX.Element {
  const {
    currentGame,
    currentMoveIndex,
    goToMove,
    goToStart,
    goToEnd,
    nextMove,
    previousMove,
  } = useChessStore();

  const moveListRef = useRef<HTMLDivElement>(null);

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
        minHeight: '40px', 
        fontSize: '0.75rem',
        padding: '8px',
        background: 'rgba(0,0,0,0.05)',
        borderRadius: '4px'
      }}>
        {currentMoveIndex >= 0 && currentGame.moves[currentMoveIndex] && (
          <>
            <strong>Move {currentMoveIndex + 1}:</strong>{' '}
            {currentGame.moves[currentMoveIndex].quality === 'blunder' && (
              <span className="move-blunder">
                Blunder! Consider the tactical consequences.
              </span>
            )}
            {currentGame.moves[currentMoveIndex].quality === 'mistake' && (
              <span className="move-mistake">
                Mistake. Better continuation available.
              </span>
            )}
            {currentGame.moves[currentMoveIndex].quality === 'inaccuracy' && (
              <span className="move-inaccuracy">
                Inaccuracy. More accurate move available.
              </span>
            )}
            {(currentGame.moves[currentMoveIndex].quality === 'best' || 
              currentGame.moves[currentMoveIndex].quality === 'excellent') && (
              <span className="move-good">
                Excellent choice!
              </span>
            )}
            {currentGame.moves[currentMoveIndex].quality === 'good' && (
              <span className="move-good">
                Good move.
              </span>
            )}
            {!currentGame.moves[currentMoveIndex].quality && (
              <span className="text-muted">
                Move played.
              </span>
            )}
          </>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="navigation-controls" style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
        <button onClick={goToStart} title="Go to start (Home)" style={{ padding: '4px 8px', fontSize: '0.875rem' }}>
          ⏮
        </button>
        <button onClick={previousMove} title="Previous move (←)" style={{ padding: '4px 8px', fontSize: '0.875rem' }}>
          ◀
        </button>
        <button onClick={nextMove} title="Next move (→)" style={{ padding: '4px 8px', fontSize: '0.875rem' }}>
          ▶
        </button>
        <button onClick={goToEnd} title="Go to end (End)" style={{ padding: '4px 8px', fontSize: '0.875rem' }}>
          ⏭
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