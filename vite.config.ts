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
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          // Keep all React-ecosystem libs together to avoid chunk init-order errors.
          // Splitting react into its own chunk causes `PureComponent` undefined errors
          // in production when sibling chunks initialize before vendor-react loads.
          if (
            id.includes('react') ||
            id.includes('/motion/') || id.includes('framer') ||
            id.includes('@radix-ui')
          ) return 'vendor-react';
          if (id.includes('recharts') || id.includes('/d3-')) return 'vendor-charts';
          if (id.includes('lucide-react'))                     return 'vendor-icons';
          return 'vendor';
        },
      },
    },
  },
})
