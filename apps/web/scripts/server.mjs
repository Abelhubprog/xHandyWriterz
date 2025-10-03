import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { lookup } from 'mime-types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = Number.parseInt(process.env.PORT ?? '', 10) || 4173;
const host = process.env.HOST ?? '0.0.0.0';
const distDir = join(__dirname, '..', 'dist');

const server = createServer(async (req, res) => {
  try {
    // Parse URL path
    let filePath = req.url === '/' ? '/index.html' : req.url;
    
    // Remove query string
    const queryIndex = filePath.indexOf('?');
    if (queryIndex !== -1) {
      filePath = filePath.substring(0, queryIndex);
    }

    // Security: prevent directory traversal
    if (filePath.includes('..')) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    // Try to read the file
    const fullPath = join(distDir, filePath);
    let content;
    let contentType = lookup(filePath) || 'application/octet-stream';

    try {
      content = await readFile(fullPath);
    } catch (err) {
      // If file not found, serve index.html for SPA routing
      if (err.code === 'ENOENT' && !filePath.match(/\.\w+$/)) {
        content = await readFile(join(distDir, 'index.html'));
        contentType = 'text/html';
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }
    }

    // Set headers
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': filePath.includes('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(content);
  } catch (error) {
    console.error('[server] Error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(port, host, () => {
  console.log(`[web] Production server listening on http://${host}:${port}`);
  console.log(`[web] Serving from: ${distDir}`);
  console.log(`[web] Health check: http://${host}:${port}/`);
});

const handleShutdown = () => {
  console.log('[web] Shutting down server');
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);
