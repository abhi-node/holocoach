/**
 * @fileoverview Game Analyzer Panel Component
 * @module renderer/components/layout/GameAnalyzerPanel
 * 
 * Main panel for chess game analysis containing the chess board,
 * move navigation, and game information display.
 * 
 * @requires react
 */

import React from 'react';
import { ChessBoardComponent } from '../chess/ChessBoardComponent';
import { MoveNavigationComponent } from '../chess/MoveNavigationComponent';
import { GameInfoComponent } from '../chess/GameInfoComponent';
import { useChessStore } from '../../stores/useChessStore';

/**
 * Game Analyzer Panel - Central component for chess analysis
 */
export function GameAnalyzerPanel(): JSX.Element {
  const { currentGame } = useChessStore();

  // Debug log
  console.log('GameAnalyzerPanel rendering, currentGame:', currentGame);

  return (
    <div className="game-analyzer-panel panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header" style={{ flexShrink: 0, padding: '8px 16px' }}>
        <h2 className="panel-title" style={{ fontSize: '1.125rem', margin: 0 }}>Game Analysis</h2>
      </div>

      <div className="panel-content" style={{ flex: 1, overflow: 'hidden', padding: '8px' }}>
        {currentGame ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px',
            height: '100%'
          }}>
            {/* Compact Game Information at top */}
            <div style={{ 
              flexShrink: 0, 
              fontSize: '0.75rem',
              lineHeight: '1.2',
              padding: '4px 8px',
              background: 'rgba(0,0,0,0.05)',
              borderRadius: '4px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <strong>{currentGame.metadata.white}</strong> ({currentGame.metadata.whiteRating || '?'}) vs{' '}
                  <strong>{currentGame.metadata.black}</strong> ({currentGame.metadata.blackRating || '?'})
                </span>
                <span>{currentGame.metadata.result}</span>
              </div>
              {currentGame.metadata.opening && (
                <div style={{ opacity: 0.8, marginTop: '2px' }}>
                  {currentGame.metadata.opening} • {currentGame.metadata.date.toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Main content area - board and moves side by side */}
            <div style={{ 
              flex: 1, 
              display: 'grid', 
              gridTemplateColumns: '1fr 280px',
              gap: '8px',
              overflow: 'hidden',
              minHeight: 0
            }}>
              {/* Chess Board - auto-sizing */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                overflow: 'hidden',
                minHeight: 0,
                minWidth: 0,
                padding: '4px'
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  maxWidth: '450px',
                  maxHeight: '480px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ChessBoardComponent />
                </div>
              </div>

              {/* Move Navigation - compact */}
              <div style={{ 
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0
              }}>
                <MoveNavigationComponent />
              </div>
            </div>
          </div>
        ) : (
          <div className="no-game-state" style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '20px'
          }}>
            <div className="no-game-icon" style={{ fontSize: '3rem', marginBottom: '12px', opacity: 0.5 }}>♔</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>No Game Selected</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.875rem', opacity: 0.8 }}>
              Select a game from the games list to begin analysis
            </p>
            <div className="no-game-hints" style={{ fontSize: '0.75rem' }}>
              <div className="hint-item" style={{ marginBottom: '8px' }}>
                <span className="hint-icon">📁</span> Load games from Chess.com or Lichess
              </div>
              <div className="hint-item" style={{ marginBottom: '8px' }}>
                <span className="hint-icon">🎯</span> Try a sample game to get started
              </div>
              <div className="hint-item">
                <span className="hint-icon">📋</span> Paste PGN directly into the app
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 