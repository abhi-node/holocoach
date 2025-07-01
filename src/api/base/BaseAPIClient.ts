/**
 * @fileoverview Base API Client for chess platforms
 * @module api/base/BaseAPIClient
 * 
 * Provides common functionality for API clients including
 * rate limiting, error handling, and request retrying.
 * 
 * @requires node-fetch
 */

import { RateLimiter, RateLimiterConfig } from './RateLimiter';

/**
 * API response wrapper
 */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  headers?: Record<string, string>;
}

/**
 * Base API client configuration
 */
export interface BaseAPIConfig {
  baseURL: string;
  rateLimiter: RateLimiterConfig;
  headers?: Record<string, string>;
  timeout?: number;
  maxRetries?: number;
}

/**
 * Abstract base class for API clients
 */
export abstract class BaseAPIClient {
  protected rateLimiter: RateLimiter;
  protected baseURL: string;
  protected headers: Record<string, string>;
  protected timeout: number;
  protected maxRetries: number;
  
  constructor(config: BaseAPIConfig) {
    this.baseURL = config.baseURL;
    this.rateLimiter = new RateLimiter(config.rateLimiter);
    this.headers = config.headers || {};
    this.timeout = config.timeout || 30000; // 30 seconds default
    this.maxRetries = config.maxRetries || 3;
    
    // Log rate limiter events
    this.rateLimiter.on('request-queued', ({ queueLength }) => {
      console.log(`[${config.rateLimiter.name}] Request queued. Queue length: ${queueLength}`);
    });
  }
  
  /**
   * Makes an API request with rate limiting and error handling
   */
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    // Wait for rate limiter
    await this.rateLimiter.acquire();
    
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data,
          statusCode: response.status,
          headers
        };
      } else {
        // Handle error responses
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData.message || errorData.error) {
            errorMessage = errorData.message || errorData.error;
          }
        } catch {
          // Response body is not JSON
        }
        
        return {
          success: false,
          error: errorMessage,
          statusCode: response.status,
          headers
        };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout'
          };
        }
        
        return {
          success: false,
          error: error.message
        };
      }
      
      return {
        success: false,
        error: 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Makes a request with automatic retry on failure
   */
  protected async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<APIResponse<T>> {
    const response = await this.request<T>(endpoint, options);
    
    if (!response.success && retryCount < this.maxRetries) {
      // Check if error is retryable
      const isRetryable = 
        response.statusCode === 429 || // Rate limited
        response.statusCode === 503 || // Service unavailable
        response.statusCode === 504 || // Gateway timeout
        response.error === 'Request timeout';
      
      if (isRetryable) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        console.log(`Retrying request to ${endpoint} after ${delay}ms (attempt ${retryCount + 1})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.requestWithRetry<T>(endpoint, options, retryCount + 1);
      }
    }
    
    return response;
  }
  
  /**
   * Gets rate limiter status
   */
  getRateLimiterStatus(): { tokens: number; queueLength: number } {
    return this.rateLimiter.getStatus();
  }
} 