import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
