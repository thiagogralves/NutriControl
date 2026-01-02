
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Isso garante que o process.env.API_KEY usado no código 
    // seja substituído pela variável de ambiente do Vercel
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
