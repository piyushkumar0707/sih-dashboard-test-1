import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin to treat all .js files as JSX (CRA migration compatibility)
const jsxInJs = {
  name: 'jsx-in-js',
  transform(code, id) {
    if (id.endsWith('.js') && !id.includes('node_modules')) {
      return {
        code,
        map: null,
      };
    }
  },
};

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    port: 3000,
  },
  build: {
    sourcemap: false,
    outDir: 'dist',
    rollupOptions: {
      plugins: [],
    },
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});
