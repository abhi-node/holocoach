/**
 * @fileoverview Game Information Component
 * @module renderer/components/chess/GameInfoComponent
 * 
 * Displays comprehensive game metadata including players, ratings,
 * opening information, and game details parsed from PGN.
 * 
 * @requires react
 */

import { useChessStore } from '../../stores/useChessStore';

/**
 * Player information display
 */
interface PlayerInfoProps {
  name: string;
  rating?: number;
  color: 'white' | 'black';
  result: string;
}

function PlayerInfo({ name, rating, color, result }: PlayerInfoProps): JSX.Element {
  const isWinner = (color === 'white' && result === '1-0') || (color === 'black' && result === '0-1');
  const isDraw = result === '1/2-1/2';
  
  return (
    <div className={`player-info ${color}-player`}>
      <div className="player-details">
        <span className="player-name">{name}</span>
        {rating && <span className="player-rating">({rating})</span>}
      </div>
      <div className="game-result">
        {isWinner && <span className="result-badge winner">W</span>}
        {isDraw && <span className="result-badge draw">D</span>}
        {!isWinner && !isDraw && <span className="result-badge loser">L</span>}
      </div>
    </div>
  );
}

/**
 * Game metadata component
 */
function GameMetadata(): JSX.Element {
  const { currentGame } = useChessStore();
  
  if (!currentGame) {
    return (
      <div className="game-metadata">
        <div className="no-game">No game loaded</div>
      </div>
    );
  }

  const { metadata } = currentGame;
  
  return (
    <div className="game-metadata">
      <div className="players-section">
        <PlayerInfo
          name={metadata.white}
          rating={metadata.whiteRating}
          color="white"
          result={metadata.result}
        />
        <div className="vs-separator">vs</div>
        <PlayerInfo
          name={metadata.black}
          rating={metadata.blackRating}
          color="black"
          result={metadata.result}
        />
      </div>
      
      <div className="game-details">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Event:</span>
            <span className="detail-value">{metadata.platform === 'lichess' ? 'Lichess' : 'Chess.com'}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Date:</span>
            <span className="detail-value">{metadata.date.toLocaleDateString()}</span>
          </div>
          
          {metadata.timeControl && (
            <div className="detail-item">
              <span className="detail-label">Time Control:</span>
              <span className="detail-value">{metadata.timeControl}</span>
            </div>
          )}
          
          {metadata.opening && (
            <div className="detail-item">
              <span className="detail-label">Opening:</span>
              <span className="detail-value">{metadata.opening}</span>
            </div>
          )}
          
          {metadata.eco && (
            <div className="detail-item">
              <span className="detail-label">ECO:</span>
              <span className="detail-value">{metadata.eco}</span>
            </div>
          )}
          
          <div className="detail-item">
            <span className="detail-label">Moves:</span>
            <span className="detail-value">{currentGame.moves.length}</span>
          </div>
        </div>
      </div>
      
      {currentGame.analyzed && (
        <div className="analysis-status">
          <div className="analysis-badge">
            ✓ Analyzed {currentGame.analyzedAt ? `on ${currentGame.analyzedAt.toLocaleDateString()}` : ''}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Game result display
 */
function GameResult(): JSX.Element {
  const { currentGame } = useChessStore();
  
  if (!currentGame) return <></>;
  
  const { result } = currentGame.metadata;
  
  const getResultText = (result: string) => {
    switch (result) {
      case '1-0': return 'White wins';
      case '0-1': return 'Black wins';
      case '1/2-1/2': return 'Draw';
      default: return 'Game in progress';
    }
  };
  
  const getResultClass = (result: string) => {
    switch (result) {
      case '1-0': return 'white-win';
      case '0-1': return 'black-win';
      case '1/2-1/2': return 'draw';
      default: return 'ongoing';
    }
  };
  
  return (
    <div className={`game-result-display ${getResultClass(result)}`}>
      <span className="result-text">{getResultText(result)}</span>
      <span className="result-notation">{result}</span>
    </div>
  );
}

/**
 * Main game information component
 */
export function GameInfoComponent(): JSX.Element {
  return (
    <div className="game-info-component">
      <div className="game-info-header">
        <h3>Game Information</h3>
      </div>
      
      <GameMetadata />
      <GameResult />
    </div>
  );
} 