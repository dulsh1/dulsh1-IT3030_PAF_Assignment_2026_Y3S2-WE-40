import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['jspdf', 'jspdf-autotable']
  },
  resolve: {
    alias: {
      'jspdf': 'jspdf'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/jspdf')) {
            return 'jspdf'
          }
        }
      }
    }
  }
})
