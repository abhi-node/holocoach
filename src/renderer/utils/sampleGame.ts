/**
 * @fileoverview Sample chess games for testing
 * @module renderer/utils/sampleGame
 * 
 * Provides sample chess games in PGN format for testing the chess board
 * and game analysis features without requiring API access.
 */

import { ChessGame, MoveQuality, ChessMove } from '../../shared/types/chess';
import { PGNParser } from '../../chess/parser/PGNParser';

// Sample PGN data from real games
const SAMPLE_PGNS = {
  italian: `[Event "Titled Tuesday Blitz"]
[Site "chess.com INT"]
[Date "2023.11.14"]
[Round "1"]
[White "Carlsen, Magnus"]
[Black "Nakamura, Hikaru"]
[Result "1-0"]
[ECO "C54"]
[Opening "Italian Game: Classical Variation"]
[WhiteElo "2839"]
[BlackElo "2789"]
[TimeControl "180+1"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O a6 7. Re1 Ba7 8. h3 O-O 9. Nbd2 Be6 10. Bb3 Qd7 11. Nf1 Rae8 12. Ng3 d5 13. exd5 Bxd5 14. Bxd5 Qxd5 15. Be3 Bxe3 16. Rxe3 Qd6 17. Qb3 Nd7 18. Rae1 f6 19. Nh4 Nc5 20. Qc2 Ne6 21. Nhf5 Qd7 22. d4 exd4 23. cxd4 Nf4 24. Rxe8 Rxe8 25. Rxe8+ Qxe8 26. Ne4 Qe1+ 27. Kh2 Qe2 28. Qc4+ Kh8 29. Nfg3 Qxb2 30. Qf7 h6 31. Qg6 Qe2 32. Nf5 Ne7 33. Nxe7 Qxe7 34. Qf5 Nd5 35. Ng3 Qe1 36. Qf3 c6 37. Ne4 Kg8 38. Nd6 Qd2 39. Nf5 Kh7 40. Qg3 Qxa2 41. Qd6 Qb1 42. Qe6 a5 43. Nd6 Qf5 44. Qxf5+ 1-0`,

  sicilian: `[Event "World Championship Match"]
[Site "Reykjavik ISL"]
[Date "1972.07.23"]
[Round "6"]
[White "Fischer, Robert J."]
[Black "Spassky, Boris V."]
[Result "1-0"]
[ECO "B44"]
[Opening "Sicilian Defense: Taimanov Variation"]
[WhiteElo "2785"]
[BlackElo "2660"]
[TimeControl "-"]

1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 e6 5. Nb5 d6 6. Bf4 e5 7. Be3 Nf6 8. Bg5 Be6 9. N1c3 a6 10. Bxf6 gxf6 11. Na3 b5 12. Nd5 f5 13. Bd3 Be7 14. Qh5 Bxd5 15. exd5 Ne7 16. Nxb5 axb5 17. Bxb5+ Kf8 18. O-O-O Kg7 19. Rhe1 Ng6 20. g3 Rb8 21. a4 Rb4 22. b3 e4 23. c4 Qb6 24. Qd1 Bf6 25. Kb1 h5 26. h4 Rhb8 27. Ka2 R4b7 28. Qd2 Qc5 29. Re3 Kh7 30. Rde1 Bg7 31. R1e2 f4 32. gxf4 Nxf4 33. Re1 Rf8 34. Qe3 Qd4 35. Qxd4 Bxd4 36. Rf3 Kg6 37. Rf1 Bb2 38. Kxb2 Nd3+ 39. Kc2 Nxf2 40. Re1 f5 41. Rf1 1-0`,

  queensGambit: `[Event "Candidates Tournament"]
[Site "Berlin GER"]
[Date "2018.03.10"]
[Round "1"]
[White "Kramnik, Vladimir"]
[Black "Grischuk, Alexander"]
[Result "1/2-1/2"]
[ECO "D37"]
[Opening "Queen's Gambit Declined: Three Knights Variation"]
[WhiteElo "2800"]
[BlackElo "2767"]
[TimeControl "6000+3000"]

1. c4 e6 2. Nc3 d5 3. d4 Nf6 4. Nf3 Be7 5. Bf4 O-O 6. e3 c5 7. dxc5 Bxc5 8. Qc2 Nc6 9. a3 Qa5 10. Rd1 Be7 11. Be2 dxc4 12. Bxc4 Nh5 13. O-O Nxf4 14. exf4 g6 15. g3 Rd8 16. Rxd8+ Qxd8 17. Rd1 Qb6 18. Qd2 Bd7 19. Qd5 Rd8 20. Qf3 Be8 21. h4 Bf6 22. Ne4 Bg7 23. h5 Rxd1+ 24. Qxd1 gxh5 25. Qxh5 Qd8 26. Qg5 h6 27. Qd2 Qxd2 28. Nfxd2 1/2-1/2`,

  tactical: `[Event "USSR Championship"]
[Site "Moscow URS"]
[Date "1957.02.05"]
[Round "17"]
[White "Tal, Mikhail"]
[Black "Tolush, Alexander"]
[Result "1-0"]
[ECO "C97"]
[Opening "Ruy Lopez: Closed, Chigorin Defense"]
[WhiteElo "2530"]
[BlackElo "2480"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 O-O 8. c3 d6 9. h3 Na5 10. Bc2 c5 11. d4 Qc7 12. Nbd2 Nc6 13. dxc5 dxc5 14. Nf1 Be6 15. Ne3 Rad8 16. Qe2 g6 17. Ng5 Bc8 18. Nf3 Be6 19. Ng5 Bc8 20. Nf3 h6 21. Nh2 Kh7 22. Nhg4 Nxg4 23. hxg4 f6 24. g3 Qd6 25. Kg2 Bd7 26. Rh1 Kg7 27. g5 h5 28. Nf5+ Bxf5 29. exf5 gxf5 30. gxf6+ Rxf6 31. g4 h4 32. gxf5 h3+ 33. Kf1 e4 34. Bg5 Rg6 35. fxg6 1-0`
};

/**
 * Creates a sample ChessGame from PGN
 */
function createSampleGame(pgn: string, id: string): ChessGame {
  const parser = new PGNParser();
  const parseResult = parser.parse(pgn);
  
  if (!parseResult.success || parseResult.games.length === 0 || !parseResult.games[0]) {
    throw new Error('Failed to parse sample PGN');
  }
  
  const parsedGame = parseResult.games[0];
  
  // Add sample move qualities and annotations for demonstration
  const sampleQualities: MoveQuality[] = [];
  const sampleAnnotations: string[] = [];
  
  // Add some example move qualities
  parsedGame.moves.forEach((_move: ChessMove, index: number) => {
    // Example pattern: mark some moves with new 4-tier system
    if (index % 8 === 0) sampleQualities.push('best');
    else if (index % 6 === 0) sampleQualities.push('blunder');
    else if (index % 4 === 0) sampleQualities.push('inaccuracy');
    else if (index % 2 === 0) sampleQualities.push('okay');
    else sampleQualities.push('okay');
    
    // Add sample annotations for key moves
    if (index === 0) sampleAnnotations.push('Opening the game with king\'s pawn');
    else if (index === 10) sampleAnnotations.push('Developing the knight to an active square');
    else if (index === 20) sampleAnnotations.push('Creating tactical complications');
    else sampleAnnotations.push('');
  });
  
  return {
    id,
    metadata: parsedGame.metadata,
    moves: parsedGame.moves,
    pgn: parsedGame.pgn,
    startingFen: parsedGame.startingFen,
    analysis: {
      engineEvaluations: parsedGame.moves.map(() => Math.random() * 200 - 100), // Random evaluations for demo
      moveQualities: sampleQualities,
      annotations: sampleAnnotations
    }
  };
}

/**
 * Gets all sample games
 */
export function getSampleGames(): ChessGame[] {
  return [
    createSampleGame(SAMPLE_PGNS.italian, 'sample_italian'),
    createSampleGame(SAMPLE_PGNS.sicilian, 'sample_sicilian'),
    createSampleGame(SAMPLE_PGNS.queensGambit, 'sample_queens_gambit'),
    createSampleGame(SAMPLE_PGNS.tactical, 'sample_tactical')
  ];
}

/**
 * Gets a specific sample game by ID
 */
export function getSampleGame(id: string): ChessGame | null {
  const games = getSampleGames();
  return games.find(game => game.id === id) || null;
}

/**
 * Gets a random sample game
 */
export function getRandomSampleGame(): ChessGame {
  const games = getSampleGames();
  return games[Math.floor(Math.random() * games.length)];
} 