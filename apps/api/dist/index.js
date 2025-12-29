import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { uploadRouter, uploadCompatRouter } from './routes/uploads.js';
import { sitemapRouter } from './routes/sitemap.js';
import { webhooksRouter } from './routes/webhooks.js';
import { paymentsRouter } from './routes/payments.js';
import { messagingRouter } from './routes/messaging.js';
import { turnitinRouter } from './routes/turnitin.js';
import { cmsRouter } from './routes/cms.js';
import { ordersRouter } from './routes/orders.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { requestLogger, rateLimiter } from './middleware/logger.js';
const app = express();
const PORT = process.env.PORT || 3001;
// Trust proxy for Railway
app.set('trust proxy', 1);
// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGINS?.split(',') || [
        'https://handywriterz.com',
        'https://www.handywriterz.com',
        'https://cms.handywriterz.com',
        'http://localhost:5173',
        'http://localhost:4173',
        'http://localhost:1337'
    ],
    credentials: true,
}));
// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// Request logging
app.use(requestLogger);
// Rate limiting on user-facing routes
app.use('/api/uploads', rateLimiter);
app.use('/api/payments', rateLimiter);
app.use('/api/messaging', rateLimiter);
app.use('/api/orders', rateLimiter);
// Routes - API
app.use('/health', healthRouter);
app.use('/api/uploads', uploadRouter);
app.use('/s3', uploadRouter);
app.use('/api', uploadCompatRouter);
app.use('/api/cms', cmsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/messaging', messagingRouter);
app.use('/api/turnitin', turnitinRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api/orders', ordersRouter);
// Routes - SEO (handles /sitemap.xml and /robots.txt)
app.use('/', sitemapRouter);
// Root endpoint
app.get('/', (_req, res) => {
    res.json({
        service: 'HandyWriterz API',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/health',
            uploads: '/api/uploads/*',
            cms: '/api/cms/*',
            payments: '/api/payments/*',
            messaging: '/api/messaging/*',
            orders: '/api/orders/*',
            webhooks: '/api/webhooks/*',
            sitemap: '/sitemap.xml',
            robots: '/robots.txt',
        },
    });
});
// 404 handler
app.use(notFoundHandler);
// Error handling
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`\n🚀 HandyWriterz API Server`);
    console.log(`   Port: ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`\n📍 Endpoints:`);
    console.log(`   GET  /health           - Health check`);
    console.log(`   POST /api/uploads/*    - File upload presigning`);
    console.log(`   POST /api/cms/*        - Admin CMS proxy`);
    console.log(`   POST /api/payments/*   - Payment processing`);
    console.log(`   POST /api/messaging/*  - Mattermost auth`);
    console.log(`   POST /api/webhooks/*   - Webhook handlers`);
    console.log(`   GET  /sitemap.xml      - SEO sitemap`);
    console.log(`   GET  /robots.txt       - Robots file`);
    console.log(`\n✅ Ready to accept requests\n`);
});
export default app;
//# sourceMappingURL=index.js.map