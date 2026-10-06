import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'block-admin-on-public-port',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url.toLowerCase();
          if (url.startsWith('/admin')) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html');
            res.end('<!doctype html><html><head><title>404 Not Found</title></head><body><h1>404 Not Found</h1><p>The requested path does not exist on this server.</p></body></html>');
            return;
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 5175,
    strictPort: true
  }
});
