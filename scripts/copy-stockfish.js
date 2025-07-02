/**
 * @fileoverview Copy Stockfish Files Script
 * @module scripts/copy-stockfish
 * 
 * Copies Stockfish.js and WASM files from node_modules to public directory
 * for use as Web Workers in the application.
 */

const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'node_modules', 'stockfish.js');
const targetDir = path.join(__dirname, '..', 'public');

const filesToCopy = ['stockfish.js', 'stockfish.wasm'];

console.log('Copying Stockfish files...');

filesToCopy.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);
  
  try {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✓ Copied ${file}`);
  } catch (error) {
    console.error(`✗ Failed to copy ${file}:`, error.message);
    process.exit(1);
  }
});

console.log('Stockfish files copied successfully!'); 