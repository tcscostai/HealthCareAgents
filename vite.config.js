import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/HealthCareAgents/',
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: true,
  },
});
