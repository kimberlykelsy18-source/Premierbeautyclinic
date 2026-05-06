import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Split vendor libraries into separate chunks so they load in parallel
        // and are cached independently from app code.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-dom') || id.includes('react/'))   return 'vendor-react';
          if (id.includes('react-router'))                          return 'vendor-router';
          if (id.includes('/motion/') || id.includes('framer'))     return 'vendor-motion';
          if (id.includes('recharts') || id.includes('/d3-'))       return 'vendor-charts';
          if (id.includes('lucide-react'))                          return 'vendor-icons';
          if (id.includes('@radix-ui'))                             return 'vendor-radix';
          return 'vendor';
        },
      },
    },
  },
})
