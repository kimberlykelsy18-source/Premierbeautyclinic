import { defineConfig } from 'vite'
import path, { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Dev server: rewrite all SPA routes to dashboard.html
    // Without this, Vite defaults to serving index.html (the store app) for every route.
    {
      name: 'dashboard-dev-entry',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (
            req.url &&
            !req.url.startsWith('/@') &&
            !req.url.startsWith('/src') &&
            !req.url.startsWith('/node_modules') &&
            !req.url.includes('.')
          ) {
            req.url = '/dashboard.html';
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
  build: {
    outDir: 'dist/dashboard',
    rollupOptions: {
      input: resolve(__dirname, 'dashboard.html'),
    },
  },
  server: {
    port: 5174,
  },
})
