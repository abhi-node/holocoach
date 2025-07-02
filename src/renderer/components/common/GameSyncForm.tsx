/**
 * @fileoverview Game Sync Form Component
 * @module renderer/components/common/GameSyncForm
 * 
 * Form component for entering username and selecting chess platform
 * to sync games from Chess.com or Lichess.
 * 
 * @requires react
 */

import React, { useState } from 'react';

/**
 * Props for GameSyncForm component
 */
export interface GameSyncFormProps {
  /** Callback when sync is requested */
  onSync: (username: string, platform: 'chess.com' | 'lichess') => void;
  /** Whether sync is in progress */
  isSyncing?: boolean;
  /** Error message to display */
  error?: string;
  /** Success message to display */
  success?: string;
}

/**
 * Form for syncing games from chess platforms
 */
export const GameSyncForm: React.FC<GameSyncFormProps> = ({
  onSync,
  isSyncing = false,
  error,
  success
}) => {
  const [username, setUsername] = useState('');
  const [platform, setPlatform] = useState<'chess.com' | 'lichess'>('chess.com');
  
  /**
   * Handles form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username.trim()) {
      onSync(username.trim(), platform);
    }
  };
  
  /**
   * Handles platform selection
   */
  const handlePlatformChange = (newPlatform: 'chess.com' | 'lichess') => {
    setPlatform(newPlatform);
  };
  
  return (
    <form onSubmit={handleSubmit} className="game-sync-form">
      <div className="form-field">
        <label htmlFor="username" className="form-label">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          className="form-input"
          disabled={isSyncing}
          required
        />
      </div>
      
      <div className="form-field">
        <label className="form-label">Platform</label>
        <div className="platform-selector">
          <button
            type="button"
            className={`platform-button ${platform === 'chess.com' ? 'active' : ''}`}
            onClick={() => handlePlatformChange('chess.com')}
            disabled={isSyncing}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
              <path d="M12 7a2 2 0 0 0-2 2v6a2 2 0 0 0 4 0V9a2 2 0 0 0-2-2z"/>
            </svg>
            Chess.com
          </button>
          
          <button
            type="button"
            className={`platform-button ${platform === 'lichess' ? 'active' : ''}`}
            onClick={() => handlePlatformChange('lichess')}
            disabled={isSyncing}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              <path d="M12 6l1.5 4.5L18 12l-4.5 1.5L12 18l-1.5-4.5L6 12l4.5-1.5z"/>
            </svg>
            Lichess
          </button>
        </div>
      </div>
      
      {error && (
        <div className="form-error">
          {error}
        </div>
      )}
      
      {success && (
        <div className="form-success">
          {success}
        </div>
      )}
      
      <button
        type="submit"
        className="sync-button"
        disabled={isSyncing || !username.trim()}
      >
        {isSyncing ? (
          <>
            <span className="spinner"></span>
            Syncing...
          </>
        ) : (
          'Sync Games'
        )}
      </button>
    </form>
  );
}; 