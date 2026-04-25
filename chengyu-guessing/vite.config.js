import { defineConfig } from 'vite';

const apiPort = process.env.API_PORT || '3003';

export default defineConfig({
  publicDir: 'data',
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': `http://127.0.0.1:${apiPort}`,
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
});
