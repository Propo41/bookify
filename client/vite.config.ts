import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@api': '/src/api',
        '@helpers': '/src/helpers',
        '@pages': '/src/pages',
        '@theme': '/src/theme',
        '@config': '/src/config',
      },
    },
    build: {
      outDir: mode === 'chrome' ? 'build_chrome' : 'build_web',
      chunkSizeWarningLimit: 600,
    },
  };
});
