/**
 * @fileoverview Environment detection utilities for main process
 * @module main/utils/environment
 * 
 * Provides utilities for detecting development vs production environment
 * and managing environment-specific configurations.
 */

/**
 * Determines if the application is running in development mode
 * 
 * @returns {boolean} True if running in development mode
 */
export const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

/**
 * Determines if the application is running in production mode
 * 
 * @returns {boolean} True if running in production mode
 */
export const isProd = process.env.NODE_ENV === 'production';

/**
 * Gets the current platform
 * 
 * @returns {string} The current platform (darwin, win32, linux)
 */
export const platform = process.platform;

/**
 * Determines if running on macOS
 * 
 * @returns {boolean} True if running on macOS
 */
export const isMac = platform === 'darwin';

/**
 * Determines if running on Windows
 * 
 * @returns {boolean} True if running on Windows
 */
export const isWindows = platform === 'win32';

/**
 * Determines if running on Linux
 * 
 * @returns {boolean} True if running on Linux
 */
export const isLinux = platform === 'linux'; 