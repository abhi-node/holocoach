/**
 * @fileoverview React renderer entry point
 * @module renderer/index
 * 
 * Main entry point for the React application that runs in the Electron renderer process.
 * Sets up React root and renders the main App component.
 * 
 * @requires react
 * @requires react-dom/client
 */

// Log that the script is starting
console.log('[index.tsx] Script starting...');

// Double-check dragEvent polyfill
if (!(window as any).dragEvent) {
  (window as any).dragEvent = {};
  console.log('[index.tsx] Added dragEvent polyfill (second attempt)');
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/main.scss'; // Re-enabled to test

// Get the root element
const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found');
}

// Create React root and render app
const root = createRoot(container);

console.log('About to render React app...');

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

console.log('React render called'); 