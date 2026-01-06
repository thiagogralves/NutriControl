
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Garante que o process.env.API_KEY seja substituído durante o build
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
});
