import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'manifest.json', dest: '.' },
        { src: 'src/content.js', dest: '.' },
        { src: 'public/icon.png', dest: '.' }
      ]
    })
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  }
});
