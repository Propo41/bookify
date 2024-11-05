import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    build: {
      outDir: mode === 'chrome' ? 'build_chrome' : 'build_web',
      chunkSizeWarningLimit: 600,
    },
  };
});
