import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // Dev server (local only)
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:5000'
    }
  },

  // Production preview server (used on Render)
  preview: {
    host: true,
    allowedHosts: ['notes-app-2-pqy8.onrender.com'], // <-- Add your Render domain here
    port: process.env.PORT || 4173
  }
});
