/**
 * @fileoverview AI Chat Service
 * @module main/services/AIChatService
 * 
 * Handles AI chat requests to n8n endpoint from the main process
 * to avoid CORS issues in the renderer process.
 * 
 * @requires node-fetch
 */

import { AIChatRequest, AIChatResponse } from '../../shared/types/ai-chat';

/**
 * AI Chat service for main process
 */
export class AIChatService {
  private readonly baseURL: string;
  private readonly timeout: number;

  constructor(baseURL = 'http://localhost:5678/webhook/analyze') {
    this.baseURL = baseURL;
    this.timeout = 60000; // 60 second timeout
  }

  /**
   * Sends a chess position and question to the AI for analysis
   */
  async analyzePosition(pgn: string, fen: string, question: string): Promise<AIChatResponse> {
    const payload: AIChatRequest = {
      pgn: pgn.trim(),
      fen: fen.trim(),
      question: question.trim()
    };

    // Validate inputs
    if (!payload.pgn) {
      throw new Error('PGN is required');
    }

    if (!payload.fen) {
      throw new Error('FEN position is required');
    }

    if (!payload.question) {
      throw new Error('Question is required');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    // Debug: Log the request details
    console.log('[AI Chat Debug] Request URL:', this.baseURL);
    console.log('[AI Chat Debug] Request method: POST');
    console.log('[AI Chat Debug] Request headers:', { 'Content-Type': 'application/json' });
    console.log('[AI Chat Debug] Request payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      console.log('[AI Chat Debug] Response status:', response.status);
      console.log('[AI Chat Debug] Response headers:', Object.fromEntries(response.headers.entries()));

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json() as any;
      
      // Debug: Log the raw response data for debugging
      console.log('[AI Chat Debug] Raw responseData:', JSON.stringify(responseData, null, 2));
      
      // Handle the actual n8n response format (OpenAI Chat Completion response)
      let data: AIChatResponse;
      
      if (responseData?.message?.content) {
        // n8n is returning raw OpenAI Chat Completion format
        // Create a minimal AIChatResponse structure
        data = {
          success: true,
          position: payload.fen,
          question: payload.question,
          analysis: {
            bestmove: null, // No analysis data in this format
            evaluation: null,
            topLines: []
          },
          aiResponse: responseData.message.content,
          timestamp: new Date().toISOString()
        };
      } else if (responseData?.content) {
        // Alternative format where content is at root level
        data = {
          success: true,
          position: payload.fen,
          question: payload.question,
          analysis: {
            bestmove: null,
            evaluation: null,
            topLines: []
          },
          aiResponse: responseData.content,
          timestamp: new Date().toISOString()
        };
      } else if (responseData?.success && responseData?.aiResponse) {
        // Expected full format with analysis (if n8n workflow is updated)
        data = responseData as AIChatResponse;
      } else {
        // Fallback: treat entire response as AI response
        data = {
          success: true,
          position: payload.fen,
          question: payload.question,
          analysis: {
            bestmove: null,
            evaluation: null,
            topLines: []
          },
          aiResponse: JSON.stringify(responseData),
          timestamp: new Date().toISOString()
        };
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      
      throw new Error('Failed to analyze position');
    }
  }
} 