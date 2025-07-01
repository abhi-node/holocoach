import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react()
  ],
  root: '.',
  publicDir: 'public',
  resolve: {
    alias: {
      '@': resolve(process.cwd(), 'src'),
      '@/main': resolve(process.cwd(), 'src/main'),
      '@/renderer': resolve(process.cwd(), 'src/renderer'),
      '@/shared': resolve(process.cwd(), 'src/shared'),
      '@/chess': resolve(process.cwd(), 'src/chess'),
      '@/api': resolve(process.cwd(), 'src/api'),
      '@/langgraph': resolve(process.cwd(), 'src/langgraph')
    }
  },
  build: {
    outDir: 'dist/renderer'
  },
  server: {
    port: 3000,
    host: 'localhost'
  }
}); 