/**
 * @fileoverview Rate Limiter for API requests
 * @module api/base/RateLimiter
 * 
 * Implements token bucket algorithm for rate limiting API requests
 * to comply with Chess.com and Lichess API limits.
 * Browser-compatible implementation without Node.js EventEmitter.
 */

/**
 * Rate limiter configuration
 */
export interface RateLimiterConfig {
  /** Maximum requests per time window */
  maxRequests: number;
  /** Time window in milliseconds */
  timeWindow: number;
  /** Name for logging */
  name: string;
}

/**
 * Simple event listener type
 */
type EventListener = (data: any) => void;

/**
 * Rate limiter using token bucket algorithm
 * Browser-compatible implementation
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private queue: Array<() => void> = [];
  private listeners: Map<string, EventListener[]> = new Map();
  
  constructor(private config: RateLimiterConfig) {
    this.tokens = config.maxRequests;
    this.lastRefill = Date.now();
    
    // Start the refill timer
    this.startRefillTimer();
  }
  
  /**
   * Adds an event listener
   */
  on(event: string, listener: EventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }
  
  /**
   * Emits an event to all listeners
   */
  private emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
  
  /**
   * Acquires a token for making a request
   * Returns a promise that resolves when a token is available
   */
  async acquire(): Promise<void> {
    return new Promise((resolve) => {
      this.tryAcquire(resolve);
    });
  }
  
  /**
   * Tries to acquire a token immediately
   */
  private tryAcquire(resolve: () => void): void {
    this.refillTokens();
    
    if (this.tokens > 0) {
      this.tokens--;
      resolve();
      this.emit('token-acquired', { remaining: this.tokens });
    } else {
      // Queue the request
      this.queue.push(resolve);
      this.emit('request-queued', { queueLength: this.queue.length });
    }
  }
  
  /**
   * Refills tokens based on elapsed time
   */
  private refillTokens(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = Math.floor(timePassed / this.config.timeWindow * this.config.maxRequests);
    
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.tokens + tokensToAdd, this.config.maxRequests);
      this.lastRefill = now;
      
      // Process queued requests
      while (this.queue.length > 0 && this.tokens > 0) {
        const resolve = this.queue.shift();
        if (resolve) {
          this.tokens--;
          resolve();
          this.emit('token-acquired', { remaining: this.tokens });
        }
      }
    }
  }
  
  /**
   * Starts periodic token refill
   */
  private startRefillTimer(): void {
    setInterval(() => {
      this.refillTokens();
    }, this.config.timeWindow / this.config.maxRequests);
  }
  
  /**
   * Gets current rate limiter status
   */
  getStatus(): { tokens: number; queueLength: number } {
    return {
      tokens: this.tokens,
      queueLength: this.queue.length
    };
  }
  
  /**
   * Resets the rate limiter
   */
  reset(): void {
    this.tokens = this.config.maxRequests;
    this.lastRefill = Date.now();
    this.queue = [];
    this.emit('reset');
  }
} 