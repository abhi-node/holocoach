/**
 * @fileoverview Test utility for sample games
 * @module renderer/utils/testSampleGames
 * 
 * Tests the sample game creation functions to ensure they work correctly.
 */

import {
  getSampleGames,
  getSampleGame,
  getRandomSampleGame
} from './sampleGame';

/**
 * Test result interface
 */
interface TestResult {
  gameName: string;
  success: boolean;
  error?: string;
  moveCount?: number;
  players?: string;
}

/**
 * Tests all sample games to ensure they load correctly
 */
export function testAllSampleGames(): TestResult[] {
  const tests = [
    { name: 'Italian Game', loader: getSampleGame('sample_italian') },
    { name: 'Sicilian Tactical', loader: getSampleGame('sample_sicilian') },
    { name: 'Queen\'s Gambit', loader: getSampleGame('sample_queens_gambit') },
    { name: 'Morphy Brilliancy', loader: getSampleGame('sample_morphy_brilliancy') },
  ];

  const results: TestResult[] = [];

  for (const test of tests) {
    try {
      console.log(`🧪 Testing ${test.name}...`);
      const game = test.loader;
      
      // Validate the game has required data
      if (!game) {
        throw new Error('Game loader returned null/undefined');
      }
      
      if (!game.metadata) {
        throw new Error('Game missing metadata');
      }
      
      if (!game.moves) {
        throw new Error('Game missing moves array');
      }
      
      if (game.moves.length === 0) {
        throw new Error('Game has no moves');
      }

      console.log(`✅ ${test.name}: ${game.moves.length} moves`);
      results.push({
        gameName: test.name,
        success: true,
        moveCount: game.moves.length,
        players: `${game.metadata.white.name} vs ${game.metadata.black.name}`,
      });
    } catch (error) {
      console.error(`❌ ${test.name} failed:`, error);
      results.push({
        gameName: test.name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

/**
 * Logs test results to console
 */
export function logTestResults(): void {
  console.group('🧪 Sample Games Test Results');
  
  const results = testAllSampleGames();
  let successCount = 0;
  
  for (const result of results) {
    if (result.success) {
      console.log(
        `✅ ${result.gameName}: ${result.moveCount} moves, ${result.players}`
      );
      successCount++;
    } else {
      console.error(`❌ ${result.gameName}: ${result.error}`);
    }
  }
  
  console.log(`\n📊 Results: ${successCount}/${results.length} tests passed`);
  console.groupEnd();
  
  if (successCount === results.length) {
    console.log('🎉 All sample games are working correctly!');
  } else {
    console.error('⚠️ Some sample games failed to load. Check the errors above.');
  }
}

/**
 * Quick validation that can be called in development
 */
export function validateSampleGames(): boolean {
  const results = testAllSampleGames();
  return results.every(result => result.success);
}

// Test the sample games
export function testSampleGames(): void {
  console.log('🧪 Testing sample games...');
  
  try {
    // Test getting all sample games
    const allGames = getSampleGames();
    console.log(`✅ Successfully loaded ${allGames.length} sample games`);
    
    allGames.forEach(game => {
      console.log(`  - ${game.metadata.opening || 'Unknown'}: ${game.metadata.white.name} vs ${game.metadata.black.name} (${game.moves.length} moves)`);
    });
    
    // Test getting specific game
    const italianGame = getSampleGame('sample_italian');
    if (italianGame) {
      console.log('✅ Italian Game loaded:', {
        white: italianGame.metadata.white.name,
        black: italianGame.metadata.black.name,
        moves: italianGame.moves.length
      });
    }
    
    // Test getting random game
    const randomGame = getRandomSampleGame();
    console.log('✅ Random game loaded:', {
      opening: randomGame.metadata.opening,
      result: randomGame.metadata.result
    });
    
    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Sample game test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testSampleGames();
} 