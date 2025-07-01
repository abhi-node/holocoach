/**
 * @fileoverview AI Chat Panel component
 * @module renderer/components/layout/AIChatPanel
 * 
 * Right panel component that provides the conversational AI tutor interface.
 * Handles chat input, message display, and context-aware chess coaching.
 * 
 * @requires react
 */

import { useState } from 'react';

/**
 * Chat message interface
 */
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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

  /**
   * Handles sending a chat message
   * TODO: Connect to IPC for actual AI communication
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
      // TODO: Call window.chessAPI.getChatResponse()
      console.log('Sending message to AI:', inputText);
      
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I understand you want to discuss chess strategy. Once you select a game and position, I can provide specific analysis and coaching.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
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

  return (
    <div className="panel ai-chat-panel">
      <div className="panel-header">
        <h2 className="panel-title">AI Tutor</h2>
        <div className="chat-status">
          <span className="text-muted">Ready to help</span>
        </div>
      </div>
      
      <div className="panel-content">
        <div className="chat-container">
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
                    <li>&quot;What&apos;s the best opening for beginners?&quot;</li>
                    <li>&quot;How do I improve my endgame?&quot;</li>
                    <li>&quot;Explain this position&quot;</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="messages-list">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`message ${message.role === 'user' ? 'user-message' : 'ai-message'}`}
                  >
                    <div className="message-content">
                      {message.content}
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
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="chat-input-area">
            <div className="input-container">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about chess..."
                rows={2}
                disabled={isLoading}
                className="chat-input"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="send-button button-primary"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 