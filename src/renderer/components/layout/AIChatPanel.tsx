/**
 * @fileoverview AI Chat Panel component
 * @module renderer/components/layout/AIChatPanel
 * 
 * Right panel component that provides the conversational AI tutor interface.
 * Handles chat input, message display, and context-aware chess coaching.
 * Uses IPC to communicate with AI chat service in main process.
 * 
 * @requires react
 * @requires useChessStore
 */

import { useState, useRef, useEffect } from 'react';
import { useChessStore } from '../../stores/useChessStore';
import { AIChatResponse } from '../../../shared/types/ai-chat';

/**
 * Chat message interface
 */
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  analysis?: AIChatResponse['analysis'];
  error?: string;
}

/**
 * AI Chat Panel component
 * 
 * Renders the right panel containing the AI chat interface for
 * conversational chess coaching and Q&A.
 * 
 * @returns {JSX.Element} The AI chat panel
 */
export function AIChatPanel(): JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  
  // References for auto-scroll and textarea auto-resize
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Chess store state
  const { chess, currentGame, currentMoveIndex } = useChessStore();

  /**
   * Initialize component
   */
  useEffect(() => {
    // Start with connected status - we'll determine actual status when user tries to send a message
    setConnectionStatus('connected');
  }, []);

  /**
   * Reset textarea height when input is cleared
   */
  useEffect(() => {
    if (inputText === '' && textareaRef.current) {
      textareaRef.current.style.height = '40px';
    }
  }, [inputText]);

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Auto-resize textarea based on content
   */
  const handleTextareaResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  /**
   * Handle input text change with auto-resize
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    handleTextareaResize();
  };

  /**
   * Gets current FEN position from chess state
   */
  const getCurrentFEN = (): string => {
    if (!chess) {
      return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'; // Starting position
    }
    return chess.fen();
  };

  /**
   * Gets current PGN from the current game
   */
  const getCurrentPGN = (): string => {
    if (!currentGame) {
      return ''; // No game loaded
    }
    return currentGame.pgn || '';
  };

  /**
   * Formats analysis data for display
   */
  const formatAnalysis = (analysis: AIChatResponse['analysis']): string => {
    if (!analysis.bestmove) return '';
    
    const parts = [];
    
    if (analysis.bestmove) {
      parts.push(`Best move: ${analysis.bestmove}`);
    }
    
    if (analysis.evaluation) {
      const evalText = analysis.evaluation.type === 'mate' 
        ? `Mate in ${Math.abs(analysis.evaluation.score)}`
        : `${analysis.evaluation.score > 0 ? '+' : ''}${analysis.evaluation.score}`;
      parts.push(`Evaluation: ${evalText}`);
    }
    
    if (analysis.topLines.length > 0) {
      parts.push('\nTop variations:');
      analysis.topLines.slice(0, 3).forEach((line, i) => {
        const evalText = line.evaluationType === 'mate' 
          ? `#${Math.abs(line.evaluation)}`
          : `${line.evaluation > 0 ? '+' : ''}${line.evaluation}`;
        parts.push(`${i + 1}. ${line.moves.slice(0, 3).join(' ')} (${evalText})`);
      });
    }
    
    return parts.join('\n');
  };

  /**
   * Handles sending a chat message
   */
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Get current position and game PGN
      const currentFEN = getCurrentFEN();
      const currentPGN = getCurrentPGN();
      
      // Send to AI for analysis
      const response = await window.holoCoach.aiChat.analyzePosition(currentPGN, currentFEN, inputText);

      if (response && response.success) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.aiResponse,
          timestamp: new Date(),
          analysis: response.analysis
        };

        setMessages(prev => [...prev, aiMessage]);
        
        // Update connection status
        if (connectionStatus !== 'connected') {
          setConnectionStatus('connected');
        }
      } else {
        // Error handling
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'system',
          content: 'Sorry, I encountered an error analyzing this position. Please try again.',
          timestamp: new Date(),
          error: response?.error || 'Analysis failed'
        };

        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: 'Network error. Please check your connection and try again.',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      setMessages(prev => [...prev, errorMessage]);
      setConnectionStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles input key press events
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Gets status indicator
   */
  const getStatusIndicator = () => {
    switch (connectionStatus) {
      case 'connected':
        return <span style={{ color: '#059669' }}>● Online</span>;
      case 'disconnected':
        return <span style={{ color: '#dc2626' }}>● Offline</span>;
      case 'checking':
        return <span style={{ color: '#d97706' }}>● Connecting...</span>;
    }
  };

  /**
   * Gets context message about current position
   */
  const getContextMessage = (): string => {
    if (!currentGame) {
      return 'No game selected. Load a game to get position-specific analysis.';
    }
    
    const moveNumber = Math.floor(currentMoveIndex / 2) + 1;
    const side = currentMoveIndex % 2 === 0 ? 'White' : 'Black';
    
    if (currentMoveIndex === -1) {
      return `Analyzing starting position of ${currentGame.metadata.white.name} vs ${currentGame.metadata.black.name}`;
    }
    
    return `Analyzing move ${moveNumber} ${side} in ${currentGame.metadata.white.name} vs ${currentGame.metadata.black.name}`;
  };

  return (
    <div className="panel ai-chat-panel">
      <div className="panel-header">
        <h2 className="panel-title">AI Tutor</h2>
        <div className="chat-status">
          {getStatusIndicator()}
        </div>
      </div>
      
      <div className="panel-content">
        <div className="chat-container">
          {/* Context Info */}
          {currentGame && (
            <div className="context-info">
              {getContextMessage()}
            </div>
          )}

          {/* Messages Area */}
          <div className="messages-area">
            {messages.length === 0 ? (
              <div className="empty-state">
                <p>Welcome to your AI chess tutor!</p>
                <p className="text-muted">
                  Ask me about chess strategy, tactics, or specific positions.
                </p>
                <div className="suggested-questions">
                  <p className="text-muted">Try asking:</p>
                  <ul>
                    <li>&quot;What&apos;s the best move here?&quot;</li>
                    <li>&quot;How do I improve this position?&quot;</li>
                    <li>&quot;Explain the key ideas in this opening&quot;</li>
                    <li>&quot;What are the tactical themes here?&quot;</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="messages-list">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`message ${
                      message.role === 'user' ? 'user-message' : 
                      message.role === 'system' ? 'system-message' : 'ai-message'
                    }`}
                  >
                    <div className="message-content">
                      {message.content}
                      {message.analysis && (
                        <div className="analysis-summary">
                          {formatAnalysis(message.analysis)}
                        </div>
                      )}
                      {message.error && (
                        <div className="error-details">
                          Error: {message.error}
                        </div>
                      )}
                    </div>
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message ai-message">
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="chat-input-area">
            <div className="input-container">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder={
                  connectionStatus === 'connected' 
                    ? "Ask me about chess..." 
                    : "Connecting to AI tutor..."
                }
                disabled={isLoading || connectionStatus !== 'connected'}
                className="chat-input"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading || connectionStatus !== 'connected'}
                className="send-button button-primary"
              >
                {isLoading ? 'Analyzing...' : 'Send'}
              </button>
            </div>
            {connectionStatus === 'disconnected' && (
              <div className="connection-warning">
                AI tutor offline. Make sure n8n is running at the configured endpoint
                <button 
                  onClick={() => setConnectionStatus('connected')}
                  className="retry-button"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 