/**
 * @fileoverview Sample chess game utility
 * @module renderer/utils/sampleGame
 * 
 * Creates sample chess games for testing and demonstration purposes.
 * Uses the comprehensive PGN parser for accurate game data.
 * 
 * @requires chess.js
 */

import { ChessGame } from '../../shared/types/chess';
import { parsePGN } from '../../chess/parser/PGNParser';

// Test the import immediately
console.log('🔍 PGN Parser import test:', typeof parsePGN);
if (typeof parsePGN !== 'function') {
  console.error('❌ parsePGN is not a function! Import failed.');
} else {
  console.log('✅ parsePGN imported successfully');
}

/**
 * Famous Italian Game sample with full PGN metadata
 */
export function createItalianGameSample(): ChessGame {
  const pgn = `[Event "Candidates Tournament"]
[Site "Madrid ESP"]
[Date "2022.06.28"]
[Round "14"]
[White "Nepomniachtchi, Ian"]
[Black "Caruana, Fabiano"]
[Result "1-0"]
[WhiteElo "2766"]
[BlackElo "2783"]
[ECO "C54"]
[Opening "Italian Game: Classical Variation"]
[TimeControl "7200+30"]
[Termination "Normal"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O O-O 7. Re1 a6 8. Bb3 Ba7 9. h3 h6 10. Nbd2 Re8 11. Nf1 Be6 12. Bc2 d5 13. exd5 Nxd5 14. Ng3 Qd7 15. Nh4 Rad8 16. Qf3 Nf6 17. Nf5 Bxf5 18. Qxf5 Qxf5 19. Nxf5 Rd7 20. Be3 Bxe3 21. Rxe3 Red8 22. Rae1 Kf8 23. g4 g6 24. Nh4 Kg7 25. f4 exf4 26. Rf3 Ne4 27. Bxe4 Rxd3 28. Rxd3 Rxd3 29. Bxc6 bxc6 30. Rxe4 1-0`;

  try {
    console.log('🎯 Attempting to parse Italian Game PGN...');
    const parseResult = parsePGN(pgn);
    
    console.log('🎯 Parse result:', parseResult);
    
    if (parseResult.success && parseResult.games.length > 0) {
      console.log('✅ Italian Game parsed successfully');
      return parseResult.games[0];
    } else {
      console.error('❌ Parse failed:', parseResult.errors);
      throw new Error(`PGN parsing failed: ${parseResult.errors?.join(', ') || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('❌ Exception in Italian Game parsing:', error);
    throw new Error(`Failed to parse Italian Game sample: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Sicilian Defense tactical game
 */
export function createTacticalSample(): ChessGame {
  const pgn = `[Event "Lichess Titled Arena"]
[Site "https://lichess.org/XYZ123"]
[Date "2024.01.15"]
[Round "-"]
[White "DrNykterstein"]
[Black "FabianoCaruana"]
[Result "1-0"]
[WhiteElo "3200"]
[BlackElo "3150"]
[ECO "B90"]
[Opening "Sicilian Defense: Najdorf Variation"]
[TimeControl "180+2"]
[Termination "Normal"]

1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e5 7. f3 Be7 8. Qd2 O-O 9. O-O-O Nbd7 10. g4 b5 11. g5 Nh5 12. Kb1 Bb7 13. h4 Rc8 14. Bh3 Nc5 15. f4 exf4 16. Bxf4 Nxf4 17. Qxf4 Ne6 18. Nxe6 fxe6 19. Rhf1 Qc7 20. g6 h6 21. Rf7 Qc4 22. Qg4 Rf6 23. Rxf6 Bxf6 24. Qxe6+ Kh8 25. Nd5 Bxd5 26. exd5 Qc1+ 27. Ka2 Qc2 28. Qe8+ Rxe8 29. Rd8+ 1-0`;

  const parseResult = parsePGN(pgn);
  
  if (parseResult.success && parseResult.games.length > 0) {
    return parseResult.games[0];
  }

  throw new Error('Failed to parse Tactical sample');
}

/**
 * Queen's Gambit game
 */
export function createQueensGambitSample(): ChessGame {
  const pgn = `[Event "World Championship"]
[Site "Dubai UAE"]
[Date "2021.12.03"]
[Round "6"]
[White "Carlsen, Magnus"]
[Black "Nepomniachtchi, Ian"]
[Result "1-0"]
[WhiteElo "2855"]
[BlackElo "2782"]
[ECO "D31"]
[Opening "Queen's Gambit Declined"]
[TimeControl "7200+30"]
[Termination "Normal"]

1. d4 Nf6 2. c4 e6 3. Nf3 d5 4. Nc3 Be7 5. Bf4 O-O 6. e3 c5 7. dxc5 Bxc5 8. a3 Nc6 9. Qc2 Qa5 10. Rd1 Re8 11. Be2 e5 12. Bg5 d4 13. Bxf6 gxf6 14. Nh4 Qb6 15. exd4 exd4 16. Nf5 dxc3 17. Qxc3 Be6 18. b4 Bd6 19. Nxd6 Qxd6 20. c5 Qf4 21. O-O Rad8 22. Bc4 Rxd1 23. Rxd1 Bxc4 24. Qxc4 Qxc4 25. bxc4 Re4 26. Rd4 Re1+ 27. Kf2 Re2+ 28. Kg3 Rxc2 29. c6 bxc6 30. Rd8+ Kg7 31. c5 Kf8 32. Rd6 Rc3+ 33. Kf4 Rxc5 34. Rxc6 Rxc6 35. a4 1-0`;

  const parseResult = parsePGN(pgn);
  
  if (parseResult.success && parseResult.games.length > 0) {
    return parseResult.games[0];
  }

  throw new Error('Failed to parse Queen\'s Gambit sample');
}

/**
 * Short tactical brilliancy
 */
export function createBrilliancySample(): ChessGame {
  const pgn = `[Event "Internet Chess Club"]
[Site "Internet Chess Club"]
[Date "1999.02.21"]
[Round "-"]
[White "Morphy, Paul"]
[Black "Amateur"]
[Result "1-0"]
[WhiteElo "2600"]
[BlackElo "1800"]
[ECO "C56"]
[Opening "Italian Game: Two Knights Defense"]
[TimeControl "900+10"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 Nxd5 6. Nxf7 Kxf7 7. Qf3+ Ke6 8. Nc3 Nb4 9. Qe4 c6 10. a3 Nd5 11. Nxd5 cxd5 12. Qxd5+ Ke7 13. Re1 Be6 14. Qb5+ Qd7 15. Qxb7 Qxb7 16. Bxe6 Kxe6 17. Rxe5+ Kd6 18. d4 Bd6 19. Re3 Rae8 20. Rxe8 Rxe8+ 21. Kd2 Re2+ 22. Kd3 Rxf2 23. c4 Rf3+ 24. Ke2 Rxh3 25. b4 Rh2+ 26. Kf3 Rxh1 27. c5+ Bxc5 28. bxc5+ Kxc5 29. Ba3+ Kc6 30. Kg4 1-0`;

  const parseResult = parsePGN(pgn);
  
  if (parseResult.success && parseResult.games.length > 0) {
    return parseResult.games[0];
  }

  throw new Error('Failed to parse Brilliancy sample');
}

/**
 * Gets all available sample games with proper PGN parsing
 */
export function getAllSampleGames(): ChessGame[] {
  return [
    createItalianGameSample(),
    createTacticalSample(),
    createQueensGambitSample(),
    createBrilliancySample(),
  ];
}

/**
 * Creates a sample game from a custom PGN string
 */
export function createGameFromPGN(pgnString: string): ChessGame {
  const parseResult = parsePGN(pgnString);
  
  if (!parseResult.success) {
    throw new Error(`PGN parsing failed: ${parseResult.errors.join(', ')}`);
  }
  
  if (parseResult.games.length === 0) {
    throw new Error('No games found in PGN');
  }
  
  return parseResult.games[0];
}

/**
 * Validates a PGN string before creating a game
 */
export function validatePGN(pgnString: string): { isValid: boolean; errors: string[] } {
  const parseResult = parsePGN(pgnString);
  return {
    isValid: parseResult.success,
    errors: parseResult.errors,
  };
} 