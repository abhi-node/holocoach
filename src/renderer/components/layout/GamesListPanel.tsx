/**
 * @fileoverview Games List Panel Component
 * @module renderer/components/layout/GamesListPanel
 * 
 * Left panel showing the list of synced chess games with sync controls
 * and game selection functionality.
 * 
 * @requires react
 * @requires zustand
 */

import React, { useState } from 'react';
import { useChessStore } from '../../stores/useChessStore';
import { GameSyncForm } from '../common/GameSyncForm';
import { getSampleGames } from '../../utils/sampleGame';
import { ChessGame } from '../../../shared/types/chess';

/**
 * Games List Panel - Left panel of the application
 */
export const GamesListPanel: React.FC = () => {
  const { games, currentGame, loadGame } = useChessStore();
  const [syncError, setSyncError] = useState<string>('');
  const [syncSuccess, setSyncSuccess] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  /**
   * Handles game sync request
   */
  const handleSync = async (username: string, platform: 'chess.com' | 'lichess') => {
    setSyncError('');
    setSyncSuccess('');
    setIsSyncing(true);
    
    try {
      // TODO: Implement actual API sync
      console.log(`Syncing games for ${username} from ${platform}`);
      
      // For now, just show a message
      setTimeout(() => {
        setSyncSuccess(`API integration coming soon! For now, loading sample games...`);
        
        // Load sample games for demonstration
        const sampleGames = getSampleGames();
        sampleGames.forEach(game => loadGame(game));
        
        setIsSyncing(false);
      }, 1500);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Failed to sync games');
      setIsSyncing(false);
    }
  };
  
  /**
   * Loads sample games for testing
   */
  const loadSampleGames = () => {
    const sampleGames = getSampleGames();
    sampleGames.forEach(game => loadGame(game));
    setSyncSuccess(`Loaded ${sampleGames.length} sample games`);
  };
  
  return (
    <div className="games-list-panel">
      <div className="panel-header">
        <h2 className="panel-title">Games</h2>
      </div>
      
      <div className="sync-section">
        <GameSyncForm
          onSync={handleSync}
          isSyncing={isSyncing}
          error={syncError}
          success={syncSuccess}
        />
        
        <div className="sample-games-section">
          <div className="divider">
            <span>or</span>
          </div>
          <button
            className="sample-games-button"
            onClick={loadSampleGames}
            disabled={isSyncing}
          >
            Load Sample Games
          </button>
        </div>
      </div>
      
      <div className="games-list">
        {games.length === 0 ? (
          <div className="empty-state">
            <p>No games loaded</p>
            <p className="empty-state-hint">
              Sync your games from Chess.com or Lichess, or load sample games to get started
            </p>
          </div>
        ) : (
          games.map((game: ChessGame) => (
            <div
              key={game.id}
              className={`game-card ${currentGame?.id === game.id ? 'active' : ''}`}
              onClick={() => loadGame(game)}
            >
              <div className="game-players">
                <span className="player white-player">
                  {game.metadata.white.name}
                  {game.metadata.white.rating && (
                    <span className="rating">({game.metadata.white.rating})</span>
                  )}
                </span>
                <span className="vs">vs</span>
                <span className="player black-player">
                  {game.metadata.black.name}
                  {game.metadata.black.rating && (
                    <span className="rating">({game.metadata.black.rating})</span>
                  )}
                </span>
              </div>
              
              <div className="game-info">
                <span className="game-result">
                  {game.metadata.result === '1-0' && '1-0'}
                  {game.metadata.result === '0-1' && '0-1'}
                  {game.metadata.result === '1/2-1/2' && '½-½'}
                  {game.metadata.result === '*' && '*'}
                </span>
                <span className="game-date">
                  {game.metadata.date}
                </span>
              </div>
              
              {game.metadata.opening && (
                <div className="game-opening">
                  {game.metadata.eco && <span className="eco">{game.metadata.eco}</span>}
                  <span className="opening-name">{game.metadata.opening}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 