import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Change to api-gateway service in docker-compose if needed
        changeOrigin: true,
        secure: false,
      },
    },
  },
}); 