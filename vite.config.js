import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Ai-Poker/',
  server: {
    proxy: {
      '/api/claude': {
        target: 'https://api.anthropic.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/claude/, ''),
        secure: false,
        headers: {
          'anthropic-version': '2024-01-01'
        }
      }
    }
  }
});