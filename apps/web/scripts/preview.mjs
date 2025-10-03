import { preview } from 'vite';

const port = Number.parseInt(process.env.PORT ?? '', 10) || 4173;
const host = process.env.HOST ?? '0.0.0.0';

(async () => {
  const server = await preview({
    preview: {
      port,
      host,
      strictPort: false, // Changed: Allow Railway to assign port if needed
      open: false // Already disabled - prevents xdg-open error
    }
  });

  const urls = server.resolvedUrls ?? {};
  const networkUrl = (urls.network ?? [])[0];
  const localUrl = (urls.local ?? [])[0];
  const logUrl = networkUrl || localUrl || `http://${host}:${port}`;
  console.log(`[web] Preview server listening on ${logUrl}`);
  console.log(`[web] Health check: http://${host}:${port}/`);

  const handleShutdown = async () => {
    console.log('[web] Shutting down preview server');
    await server.close();
    process.exit(0);
  };

  process.on('SIGTERM', handleShutdown);
  process.on('SIGINT', handleShutdown);
  process.on('uncaughtException', (err) => {
    console.error('[web] Uncaught exception:', err);
    // Don't exit on xdg-open errors - just log them
    if (err.message && err.message.includes('xdg-open')) {
      console.log('[web] Browser auto-open not available (expected in container environment)');
    }
  });
})();