# AI Chat Integration Guide

This document explains the AI chat integration between HoloCoach and the n8n AI analysis endpoint.

## 🎯 Overview

The AI chat functionality enables position-aware conversations with an AI tutor powered by Stockfish analysis and GPT-4o Mini. Users can ask questions about specific chess positions and receive detailed, context-aware responses.

## 🏗️ Architecture

```
HoloCoach App → AIChatClient → n8n Endpoint → Stockfish + GPT → Response
```

### Components

1. **AIChatClient** (`src/api/ai-chat/AIChatClient.ts`)
   - Follows BaseAPIClient pattern for consistency
   - Handles rate limiting and error handling
   - Validates FEN positions and questions

2. **AIChatPanel** (`src/renderer/components/layout/AIChatPanel.tsx`)
   - Integration with chess store for current position
   - Real-time connection status monitoring
   - Position-aware context display
   - Analysis result formatting

3. **n8n Workflow** (External)
   - Webhook trigger at `/webhook-test/analyze`
   - Stockfish analysis with MultiPV
   - GPT-4o Mini response generation
   - Structured JSON response

## 🔌 API Integration

### Request Format
```json
{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "question": "What's the best opening move?"
}
```

### Response Format
```json
{
  "success": true,
  "position": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "question": "What's the best opening move?",
  "analysis": {
    "bestmove": "e2e4",
    "evaluation": {
      "score": 0.2,
      "type": "centipawns"
    },
    "topLines": [
      {
        "line": 1,
        "evaluation": 0.2,
        "evaluationType": "centipawns",
        "moves": ["e4", "e5", "Nf3", "Nc6", "Bb5"]
      }
    ]
  },
  "aiResponse": "The best opening move is 1.e4, controlling the center and developing quickly...",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🎮 User Experience

### Features

1. **Position Awareness**
   - Automatically sends current FEN position
   - Context display shows game and move information
   - Updates as user navigates through moves

2. **Connection Status**
   - Real-time connection monitoring
   - Visual indicators (● Online/Offline/Connecting)
   - Automatic retry on connection failure

3. **Rich Responses**
   - AI explanations in natural language
   - Embedded analysis data (best move, evaluation, variations)
   - Error handling with user-friendly messages

4. **Conversation Flow**
   - Message history preservation
   - Auto-scroll to latest messages
   - Typing indicators during analysis

### Message Types

- **User Messages**: Questions from the user
- **AI Messages**: Responses with analysis data
- **System Messages**: Error states and status updates

## 🛠️ Setup Instructions

### Prerequisites

1. **n8n Running**: Ensure n8n is running at `localhost:5678`
2. **Stockfish Available**: Stockfish must be accessible in the n8n container
3. **OpenAI API Key**: Required for GPT responses

### Configuration

1. **n8n Workflow Setup**:
   - Create webhook trigger at `/webhook-test/analyze` endpoint
   - Configure Stockfish analysis function
   - Set up OpenAI API integration
   - Add response formatting

2. **HoloCoach Configuration**:
   - No additional config needed
   - Uses existing chess store integration
   - Automatic endpoint detection

## 🧪 Testing

### Manual Testing

1. **Start n8n**: Ensure the workflow is active
2. **Load HoloCoach**: Open the application
3. **Load a Game**: Select any game from the games list
4. **Ask a Question**: Type in the AI chat panel

### Example Questions

- "What's the best move in this position?"
- "Why is this move a blunder?"
- "How do I improve my position?"
- "What are the key tactical themes here?"
- "Explain the opening principles in this position"

### API Testing

```bash
# Test the endpoint directly
curl -X POST http://localhost:5678/webhook-test/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    "question": "What is the best move and why?"
  }'
```

## 🔧 Error Handling

### Connection Issues
- **Offline Status**: Shows when n8n is unreachable
- **Retry Button**: Manual reconnection attempt
- **Auto-reconnection**: Attempts reconnection on successful requests

### API Errors
- **Validation Errors**: Invalid FEN or empty question
- **Analysis Failures**: Stockfish or GPT errors
- **Rate Limiting**: Respectful backoff and retry

### User Feedback
- **Loading States**: "Analyzing..." during requests
- **Error Messages**: Clear, actionable error descriptions
- **Status Indicators**: Visual connection status

## 🎯 Integration Benefits

1. **Position Context**: Questions are automatically contextualized with current position
2. **Real-time Analysis**: Fresh Stockfish analysis for each question
3. **Natural Language**: Complex engine analysis translated to understandable explanations
4. **Seamless UX**: Integrated into existing three-panel layout
5. **Error Resilience**: Graceful handling of connection and analysis failures

## 🔄 Future Enhancements

- **Chat History Persistence**: Save conversations to database
- **Voice Input**: Speech-to-text for questions
- **Position Suggestions**: AI-generated follow-up questions
- **Analysis Caching**: Cache analysis results for performance
- **Multi-language Support**: Responses in different languages 