import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-admin-index',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/' || req.url === '/index.html' || req.url.startsWith('/admin')) {
            req.url = '/admin-app/index.html';
          }
          next();
        });
      },
      closeBundle() {
        const src = path.resolve('dist-admin/admin-app/index.html');
        const dest = path.resolve('dist-admin/index.html');
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        }
      }
    }
  ],
  server: {
    port: 5176,
    strictPort: true
  },
  build: {
    outDir: 'dist-admin',
    rollupOptions: {
      input: {
        admin: 'admin-app/index.html'
      }
    }
  }
});
