/**
 * @fileoverview Main App Component
 * @module renderer/App
 * 
 * Root component that sets up the three-panel layout and theme system.
 * Contains the main application structure with games list, analyzer, and chat panels.
 * 
 * @requires react
 */

import React, { useEffect, useState } from 'react';
import { GamesListPanel } from './components/layout/GamesListPanel';
import { GameAnalyzerPanel } from './components/layout/GameAnalyzerPanel';
import { AIChatPanel } from './components/layout/AIChatPanel';

/**
 * Error Boundary component
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; name: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; name: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.name}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', border: '2px solid red', margin: '10px' }}>
          <h3>Error in {this.props.name}</h3>
          <p>{this.state.error?.message}</p>
          <details style={{ marginTop: '10px' }}>
            <summary>Stack trace</summary>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {this.state.error?.stack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Main App component with three-panel layout
 */
export function App(): JSX.Element {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    console.log('App component mounted');
    
    // Set initial theme
    const savedTheme = localStorage.getItem('theme-simple') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
    
    // Add debug info
    console.log('Document root element:', document.documentElement);
    console.log('Theme attribute set to:', initialTheme);
    console.log('Body computed styles:', window.getComputedStyle(document.body));
    
    // Check if CSS variables are defined
    const computedStyle = window.getComputedStyle(document.documentElement);
    const bgBase = computedStyle.getPropertyValue('--bg-base');
    const textPrimary = computedStyle.getPropertyValue('--text-primary');
    console.log('CSS Variables - bg-base:', bgBase, 'text-primary:', textPrimary);
    
    if (!bgBase || !textPrimary) {
      console.error('CSS variables not loaded! SCSS might not be processing correctly.');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme-simple', newTheme);
    console.log('Theme toggled to:', newTheme);
  };

  // Fallback styles to ensure visibility
  const isDark = theme === 'dark';
  const appStyles: React.CSSProperties = {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: isDark ? '#0f1419' : '#ffffff',
    color: isDark ? '#f8fafc' : '#334155',
    margin: 0,
    padding: 0,
    overflow: 'hidden'
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: isDark ? '#1a1f2e' : '#f8fafc',
    borderBottom: `1px solid ${isDark ? '#3f4659' : '#cbd5e1'}`,
    flexShrink: 0
  };

  const layoutStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '280px 1fr 280px',  // Increased games panel from 240px to 280px
    gap: '10px',
    padding: '10px',
    flex: 1,
    overflow: 'hidden',
    backgroundColor: isDark ? '#0f1419' : '#ffffff'
  };

  const panelStyles: React.CSSProperties = {
    backgroundColor: isDark ? '#1a1f2e' : '#ffffff',
    border: `1px solid ${isDark ? '#3f4659' : '#cbd5e1'}`,
    borderRadius: '8px',
    padding: '16px',
    overflow: 'hidden'
  };

  console.log('App rendering with theme:', theme);

  return (
    <div className="app" style={appStyles}>
      <div className="app-header" style={headerStyles}>
        <div className="app-title">
          <h1 style={{ margin: 0, fontSize: '1.25rem' }}>HoloCoach</h1>
          <span className="app-subtitle" style={{ fontSize: '0.875rem', opacity: 0.8 }}>
            AI Chess Analysis
          </span>
        </div>
        
        <div className="app-controls">
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            style={{
              background: 'none',
              border: `1px solid ${isDark ? '#3f4659' : '#cbd5e1'}`,
              borderRadius: '6px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '1rem',
              color: isDark ? '#f8fafc' : '#334155'
            }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      <div className="app-layout" style={layoutStyles}>
        <aside className="app-sidebar panel" style={panelStyles}>
          <ErrorBoundary name="GamesListPanel">
            <GamesListPanel />
          </ErrorBoundary>
        </aside>
        
        <main className="app-main" style={panelStyles}>
          <ErrorBoundary name="GameAnalyzerPanel">
            <GameAnalyzerPanel />
          </ErrorBoundary>
        </main>
        
        <aside className="app-aside panel" style={panelStyles}>
          <ErrorBoundary name="AIChatPanel">
            <AIChatPanel />
          </ErrorBoundary>
        </aside>
      </div>
    </div>
  );
} 