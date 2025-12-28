import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint2';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 6601,
  },
  preview: {
    port: 6602,
  },
  plugins: [react(), eslint()],
});
