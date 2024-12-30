import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env,
  },
  optimizeDeps: {
    include: ['react-typed'], // Ensures react-typed is pre-bundled by Vite
  },
  server: {
    host: '0.0.0.0', // Listens on all available network interfaces
    port: 5173, // Optional, defaults to 5173
  },
});
