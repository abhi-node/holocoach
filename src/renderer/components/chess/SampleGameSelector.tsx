/**
 * @fileoverview Sample Game Selector component
 * @module renderer/components/chess/SampleGameSelector
 * 
 * Provides a UI for selecting and loading sample chess games
 * for testing and demonstration purposes.
 * 
 * @requires react
 */

import { useState } from 'react';
import { useChessStore } from '../../stores/useChessStore';
import { getSampleGames } from '../../utils/sampleGame';
import { ChessGame } from '../../../shared/types/chess';

/**
 * Sample Game Selector component
 */
export function SampleGameSelector(): JSX.Element {
  const { loadGame } = useChessStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleGames = getSampleGames();

  const handleSelectGame = async (game: ChessGame) => {
    setIsLoading(true);
    setError(null);
    
    try {
      loadGame(game);
    } catch (e) {
      setError('Failed to load game');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sample-game-selector">
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      <div className="sample-games-grid">
        {sampleGames.map((game) => (
          <div
            key={game.id}
            className="sample-game-card"
            onClick={() => handleSelectGame(game)}
          >
            <div className="game-icon">♟</div>
            <div className="game-details">
              <h3 className="game-title">{game.metadata.opening || 'Chess Game'}</h3>
              <div className="game-players">
                {game.metadata.white.name} vs {game.metadata.black.name}
              </div>
              <div className="game-info">
                <span>{game.moves.length} moves</span>
                <span>{game.metadata.result}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
} 