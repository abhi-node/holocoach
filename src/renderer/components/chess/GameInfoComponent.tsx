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
 * Props for PlayerInfo component
 */
interface PlayerInfoProps {
  name: string;
  rating?: number;
  color: 'white' | 'black';
  isWinner: boolean;
}

/**
 * Player information display
 */
function PlayerInfo({ name, rating, color, isWinner }: PlayerInfoProps): JSX.Element {
  return (
    <div className={`player-info ${color} ${isWinner ? 'winner' : ''}`}>
      <div className="player-icon">
        {color === 'white' ? '♔' : '♚'}
      </div>
      <div className="player-details">
        <div className="player-name">{name}</div>
        {rating && <div className="player-rating">{rating}</div>}
      </div>
      {isWinner && <div className="winner-indicator">✓</div>}
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
    <div className="game-info">
      <div className="players-section">
        <PlayerInfo
          name={metadata.white.name}
          rating={metadata.white.rating}
          color="white"
          isWinner={metadata.result === '1-0'}
        />
        
        <PlayerInfo
          name={metadata.black.name}
          rating={metadata.black.rating}
          color="black"
          isWinner={metadata.result === '0-1'}
        />
      </div>
      
      <div className="game-details">
        <div className="detail-row">
          <span className="detail-label">Platform</span>
          <span className="detail-value">{metadata.source === 'lichess' ? 'Lichess' : metadata.source === 'chess.com' ? 'Chess.com' : 'Local'}</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Date</span>
          <span className="detail-value">{metadata.date}</span>
        </div>
        
        {metadata.timeControl && (
          <div className="detail-row">
            <span className="detail-label">Time</span>
            <span className="detail-value">{metadata.timeControl}</span>
          </div>
        )}
        
        {metadata.opening && (
          <div className="detail-row">
            <span className="detail-label">Opening</span>
            <span className="detail-value">
              {metadata.eco && <span className="eco-code">{metadata.eco}</span>}
              <span className="opening-name">{metadata.opening}</span>
            </span>
          </div>
        )}
        
        <div className="detail-row">
          <span className="detail-label">Result</span>
          <span className={`detail-value result result-${getResultClass(metadata.result)}`}>
            {formatResult(metadata.result)}
          </span>
        </div>
      </div>
      
      {currentGame.analysis && (
        <div className="analysis-status">
          <span className="status-icon">✓</span>
          <span className="status-text">
            Game analyzed
          </span>
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
 * Gets CSS class for result display
 */
function getResultClass(result: string): string {
  switch (result) {
    case '1-0': return 'white-win';
    case '0-1': return 'black-win';
    case '1/2-1/2': return 'draw';
    default: return 'ongoing';
  }
}

/**
 * Formats result for display
 */
function formatResult(result: string): string {
  switch (result) {
    case '1-0': return '1-0';
    case '0-1': return '0-1';
    case '1/2-1/2': return '½-½';
    default: return '*';
  }
}

/**
 * Main game information component
 */
export const GameInfoComponent: React.FC = () => {
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