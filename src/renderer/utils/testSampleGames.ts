/**
 * @fileoverview Sample Games Test Utility
 * @module renderer/utils/testSampleGames
 * 
 * Simple utility to test that all sample games load correctly
 * and have valid PGN data.
 */

import { 
  createItalianGameSample, 
  createTacticalSample, 
  createQueensGambitSample, 
  createBrilliancySample 
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
    { name: 'Italian Game', loader: createItalianGameSample },
    { name: 'Sicilian Tactical', loader: createTacticalSample },
    { name: 'Queen\'s Gambit', loader: createQueensGambitSample },
    { name: 'Morphy Brilliancy', loader: createBrilliancySample },
  ];

  const results: TestResult[] = [];

  for (const test of tests) {
    try {
      console.log(`🧪 Testing ${test.name}...`);
      const game = test.loader();
      
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
        players: `${game.metadata.white} vs ${game.metadata.black}`,
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