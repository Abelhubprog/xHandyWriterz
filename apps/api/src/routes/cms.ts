import { Router, IRouter } from 'express';
import fetch from 'node-fetch';
import { requireAdmin } from '../lib/clerk.js';

export const cmsRouter: IRouter = Router();

const STRAPI_URL = (process.env.STRAPI_URL || process.env.CMS_URL || '').replace(/\/$/, '');
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || process.env.CMS_TOKEN || '';

const ensureConfig = (res: any) => {
  if (!STRAPI_URL || !STRAPI_TOKEN) {
    res.status(500).json({
      error: 'CMS proxy not configured',
      missing: {
        STRAPI_URL: !STRAPI_URL,
        STRAPI_TOKEN: !STRAPI_TOKEN,
      },
    });
    return false;
  }
  return true;
};

cmsRouter.post('/graphql', requireAdmin, async (req, res) => {
  if (!ensureConfig(res)) return;

  try {
    const response = await fetch(`${STRAPI_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify(req.body ?? {}),
    });

    const text = await response.text();
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.send(text);
  } catch (error) {
    console.error('[cms] graphql proxy failed', error);
    res.status(502).json({ error: 'CMS proxy failure' });
  }
});

cmsRouter.all('/rest/:path(*)', requireAdmin, async (req, res) => {
  if (!ensureConfig(res)) return;

  const proxyPath = req.originalUrl.replace(/^\/api\/cms\/rest\//, '');
  const targetUrl = `${STRAPI_URL}/api/${proxyPath}`;
  const hasBody = !['GET', 'HEAD'].includes(req.method.toUpperCase());

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...(req.headers['content-type'] ? { 'Content-Type': String(req.headers['content-type']) } : {}),
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: hasBody ? JSON.stringify(req.body ?? {}) : undefined,
    });

    const text = await response.text();
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.send(text);
  } catch (error) {
    console.error('[cms] rest proxy failed', error);
    res.status(502).json({ error: 'CMS proxy failure' });
  }
});

cmsRouter.post('/upload', requireAdmin, async (req, res) => {
  if (!ensureConfig(res)) return;

  try {
    const response = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers: {
        ...(req.headers['content-type'] ? { 'Content-Type': String(req.headers['content-type']) } : {}),
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: req as any,
    });

    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    if (response.body) {
      response.body.pipe(res);
      return;
    }

    const text = await response.text();
    res.send(text);
  } catch (error) {
    console.error('[cms] upload proxy failed', error);
    res.status(502).json({ error: 'CMS upload proxy failure' });
  }
});
