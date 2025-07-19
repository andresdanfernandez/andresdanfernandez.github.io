import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import macrosPlugin from 'vite-plugin-babel-macros'

// https://vite.dev/config/
export default defineConfig({
  base: '/personal-portfolio/', // Add this for GitHub Pages
  plugins: [
    macrosPlugin(),
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
