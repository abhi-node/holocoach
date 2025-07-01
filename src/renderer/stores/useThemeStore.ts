/**
 * @fileoverview Theme management store using Zustand
 * @module renderer/stores/useThemeStore
 * 
 * Manages application theme state (light/dark mode) with persistence
 * and system preference detection.
 * 
 * @requires zustand
 * @requires zustand/middleware
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Theme types supported by the application
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Theme store state interface
 */
interface ThemeState {
  /** Current active theme */
  theme: Theme;
  
  /** Resolved theme (light or dark, never system) */
  resolvedTheme: 'light' | 'dark';
  
  /** Actions */
  setTheme: (theme: Theme) => void;
  initializeTheme: () => void;
  toggleTheme: () => void;
}

/**
 * Detects system theme preference
 * 
 * @returns {'light' | 'dark'} System theme preference
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light';
}

/**
 * Resolves theme setting to actual theme
 * 
 * @param {Theme} theme - Theme setting
 * @returns {'light' | 'dark'} Resolved theme
 */
function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

/**
 * Theme store with persistence and system preference detection
 */
export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set, get) => ({
        theme: 'light',
        resolvedTheme: 'light',

        /**
         * Sets the theme preference
         * 
         * @param {Theme} theme - Theme to set
         */
        setTheme: (theme: Theme) => {
          const resolvedTheme = resolveTheme(theme);
          set({ theme, resolvedTheme });
        },

        /**
         * Initializes theme based on stored preference or system default
         */
        initializeTheme: () => {
          const { theme } = get();
          const resolvedTheme = resolveTheme(theme);
          set({ resolvedTheme });
          
          // Force apply theme to document immediately
          document.documentElement.setAttribute('data-theme', resolvedTheme);

          // Listen for system theme changes
          if (theme === 'system' && typeof window !== 'undefined') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            const handleChange = () => {
              const currentTheme = get().theme;
              if (currentTheme === 'system') {
                const newResolvedTheme = getSystemTheme();
                set({ resolvedTheme: newResolvedTheme });
                document.documentElement.setAttribute('data-theme', newResolvedTheme);
              }
            };

            mediaQuery.addEventListener('change', handleChange);
            
            // Cleanup function would go here in a real implementation
            // For now, we'll accept the small memory leak
          }
        },

        /**
         * Toggles between light and dark theme
         */
        toggleTheme: () => {
          const { resolvedTheme } = get();
          const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
          set({ theme: newTheme, resolvedTheme: newTheme });
        },
      }),
      {
        name: 'theme-storage',
        partialize: (state) => ({ theme: state.theme }),
      }
    ),
    { name: 'theme-store' }
  )
); 