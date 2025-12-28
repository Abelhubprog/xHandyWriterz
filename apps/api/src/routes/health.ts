import { Router, IRouter } from 'express';

export const healthRouter: IRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      api: 'running',
      strapi: process.env.STRAPI_URL ? 'configured' : 'missing',
      r2: process.env.R2_ACCOUNT_ID ? 'configured' : 'missing',
      clerk: process.env.CLERK_SECRET_KEY ? 'configured' : 'missing',
    }
  });
});

healthRouter.get('/ready', async (_req, res) => {
  const checks = {
    strapi: false,
    database: false,
  };

  // Check Strapi
  if (process.env.STRAPI_URL) {
    try {
      const response = await fetch(`${process.env.STRAPI_URL}/_health`);
      checks.strapi = response.ok;
    } catch {
      checks.strapi = false;
    }
  }

  const allHealthy = Object.values(checks).every(Boolean);
  res.status(allHealthy ? 200 : 503).json({
    ready: allHealthy,
    checks,
  });
});
