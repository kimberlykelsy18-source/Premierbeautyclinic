import { defineConfig } from 'vite'
import path, { resolve } from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  // In production, assets are served from /staff/ so links resolve correctly.
  // In dev (localhost:5174), base stays at / so the dev server works normally.
  base: command === 'build' ? '/staff/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    // Dev server: rewrite all SPA routes to dashboard.html
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
    // After build: rename dashboard.html → index.html so Vercel's rewrite can find it
    {
      name: 'rename-dashboard-html',
      closeBundle() {
        const src  = resolve(__dirname, 'dist/staff/dashboard.html');
        const dest = resolve(__dirname, 'dist/staff/index.html');
        if (fs.existsSync(src)) fs.renameSync(src, dest);
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
    outDir: 'dist/staff',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      input: resolve(__dirname, 'dashboard.html'),
    },
  },
  server: {
    port: 5174,
  },
}))
