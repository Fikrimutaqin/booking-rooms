import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'API_']);
  const rawTarget = env.API_URL || env.VITE_API_URL || 'http://localhost:3000';
  const target = rawTarget.replace(/\/api.*$/, '');

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'API_'],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true, // Listen on 0.0.0.0 for Docker container support
      port: 5173,
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
        },
      },
    },
  };
});
