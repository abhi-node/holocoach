/**
 * @fileoverview Games List Panel component
 * @module renderer/components/layout/GamesListPanel
 * 
 * Left panel component that displays the user's games list,
 * sync functionality, and game selection interface.
 * 
 * @requires react
 */

import React, { useState } from 'react';
import { useChessStore } from '../../stores/useChessStore';
import { SampleGameSelector } from '../chess/SampleGameSelector';

/**
 * Games List Panel component
 */
export function GamesListPanel(): JSX.Element {
  const { currentGame } = useChessStore();
  const [showSampleGames, setShowSampleGames] = useState(false);

  const handleSyncGames = () => {
    console.log('Sync games functionality coming in Phase 3');
  };

  return (
    <div className="panel games-list-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header" style={{ flexShrink: 0, padding: '8px 12px' }}>
        <h2 className="panel-title" style={{ fontSize: '1rem', margin: 0 }}>My Games</h2>
        {currentGame && (
          <div className="current-game-indicator" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="indicator-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669' }}></span>
            <span className="indicator-text">Game loaded</span>
          </div>
        )}
      </div>
      
      <div className="panel-content" style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        {!showSampleGames ? (
          <>
            <div className="sync-section" style={{ marginBottom: '16px' }}>
              <button 
                className="button-primary sync-button" 
                onClick={handleSyncGames}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span className="button-icon">🔄</span>
                Sync Games
              </button>
              <p className="sync-description" style={{ 
                fontSize: '0.75rem', 
                textAlign: 'center',
                margin: '8px 0 0 0',
                opacity: 0.8
              }}>
                Connect to Chess.com or Lichess
              </p>
            </div>

            <div className="empty-state" style={{ textAlign: 'center' }}>
              <div className="empty-icon" style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.5 }}>🏆</div>
              <h3 style={{ fontSize: '0.875rem', margin: '0 0 8px 0' }}>No Games Yet</h3>
              <p style={{ fontSize: '0.75rem', margin: '0 0 16px 0', opacity: 0.8 }}>
                Your games will appear here once synced.
              </p>
              
              <div className="sample-games-section">
                <p style={{ fontSize: '0.75rem', margin: '0 0 8px 0' }}>Want to explore? Try samples:</p>
                <button 
                  className="button-secondary sample-games-button"
                  onClick={() => setShowSampleGames(true)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span className="button-icon">🎯</span>
                  Browse Sample Games
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="sample-games-container">
            <div className="sample-games-header" style={{ marginBottom: '12px' }}>
              <button 
                className="back-button"
                onClick={() => setShowSampleGames(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px 0',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  opacity: 0.8
                }}
              >
                ← Back to Games List
              </button>
            </div>
            <SampleGameSelector />
          </div>
        )}
      </div>
    </div>
  );
} 