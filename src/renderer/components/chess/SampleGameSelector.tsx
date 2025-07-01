/**
 * @fileoverview Sample Game Selector Component
 * @module renderer/components/chess/SampleGameSelector
 * 
 * Component that displays a selection of sample chess games for testing purposes.
 * Allows users to load famous games and tactical positions.
 * 
 * @requires react
 */

import React, { useState } from 'react';
import { useChessStore } from '../../stores/useChessStore';
import { 
  createItalianGameSample, 
  createTacticalSample, 
  createQueensGambitSample, 
  createBrilliancySample 
} from '../../utils/sampleGame';

/**
 * Sample game metadata for display
 */
interface SampleGameInfo {
  id: string;
  name: string;
  description: string;
  players: string;
  opening: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  theme: 'Opening' | 'Tactical' | 'Endgame' | 'Positional';
  loader: () => any;
}

/**
 * Available sample games
 */
const SAMPLE_GAMES: SampleGameInfo[] = [
  {
    id: 'italian-game',
    name: 'Italian Game Classic',
    description: 'A masterful Italian Game from the Candidates Tournament showing deep positional understanding.',
    players: 'Nepomniachtchi vs Caruana',
    opening: 'Italian Game: Classical Variation',
    difficulty: 'Advanced',
    theme: 'Positional',
    loader: createItalianGameSample,
  },
  {
    id: 'sicilian-tactical',
    name: 'Sicilian Tactical Strike',
    description: 'Sharp Sicilian Defense with brilliant tactical sequences and sacrificial attack.',
    players: 'DrNykterstein vs FabianoCaruana',
    opening: 'Sicilian Defense: Najdorf',
    difficulty: 'Master',
    theme: 'Tactical',
    loader: createTacticalSample,
  },
  {
    id: 'queens-gambit',
    name: 'World Championship Queen\'s Gambit',
    description: 'Carlsen vs Nepomniachtchi from the 2021 World Championship showing precise technique.',
    players: 'Carlsen vs Nepomniachtchi',
    opening: 'Queen\'s Gambit Declined',
    difficulty: 'Master',
    theme: 'Positional',
    loader: createQueensGambitSample,
  },
  {
    id: 'morphy-brilliancy',
    name: 'Morphy\'s Tactical Brilliancy',
    description: 'Classic Paul Morphy game demonstrating brilliant tactical vision and attacking play.',
    players: 'Morphy vs Amateur',
    opening: 'Italian Game: Two Knights',
    difficulty: 'Intermediate',
    theme: 'Tactical',
    loader: createBrilliancySample,
  },
];

/**
 * Difficulty badge component
 */
function DifficultyBadge({ difficulty }: { difficulty: string }): JSX.Element {
  return (
    <span className={`difficulty-badge ${difficulty.toLowerCase()}`}>
      {difficulty}
    </span>
  );
}

/**
 * Theme badge component
 */
function ThemeBadge({ theme }: { theme: string }): JSX.Element {
  return (
    <span className={`theme-badge ${theme.toLowerCase()}`}>
      {theme}
    </span>
  );
}

/**
 * Sample game card component
 */
function SampleGameCard({ game, onLoad }: { game: SampleGameInfo; onLoad: () => void }): JSX.Element {
  return (
    <div className="sample-game-card">
      <div className="game-header">
        <h4 className="game-name">{game.name}</h4>
        <div className="game-badges">
          <DifficultyBadge difficulty={game.difficulty} />
          <ThemeBadge theme={game.theme} />
        </div>
      </div>
      
      <div className="game-details">
        <div className="game-players">{game.players}</div>
        <div className="game-opening">{game.opening}</div>
        <p className="game-description">{game.description}</p>
      </div>
      
      <button 
        className="load-game-button"
        onClick={onLoad}
      >
        Load Game
      </button>
    </div>
  );
}

/**
 * Main sample game selector component
 */
export function SampleGameSelector(): JSX.Element {
  const { loadGame } = useChessStore();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingGameId, setLoadingGameId] = useState<string | null>(null);

  const handleLoadGame = async (game: SampleGameInfo) => {
    setIsLoading(true);
    setLoadingGameId(game.id);
    
    try {
      const chessGame = game.loader();
      loadGame(chessGame);
      
      // Small delay to show loading state
      setTimeout(() => {
        setIsLoading(false);
        setLoadingGameId(null);
      }, 300);
    } catch (error) {
      console.error('Failed to load sample game:', error);
      setIsLoading(false);
      setLoadingGameId(null);
      // You could add error handling here
    }
  };

  return (
    <div className="sample-game-selector">
      <div className="selector-header">
        <h3>Sample Games</h3>
        <p>Choose a sample game to explore the analysis features</p>
      </div>
      
      <div className="games-grid">
        {SAMPLE_GAMES.map((game) => (
          <SampleGameCard
            key={game.id}
            game={game}
            onLoad={() => handleLoadGame(game)}
          />
        ))}
      </div>
      
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Loading {SAMPLE_GAMES.find(g => g.id === loadingGameId)?.name}...</span>
          </div>
        </div>
      )}
    </div>
  );
} 