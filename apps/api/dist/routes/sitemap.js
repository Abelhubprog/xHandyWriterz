import { Router } from 'express';
export const sitemapRouter = Router();
const SITE_URL = process.env.SITE_URL || 'https://handywriterz.com';
const CMS_URL = process.env.STRAPI_URL || 'https://cms.handywriterz.com';
// Cache the sitemap for 1 hour
let sitemapCache = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in ms
/**
 * GET /sitemap.xml
 * Generate dynamic sitemap from Strapi content
 */
sitemapRouter.get('/sitemap.xml', async (_req, res) => {
    try {
        // Check cache
        if (sitemapCache && Date.now() - sitemapCache.generatedAt < CACHE_TTL) {
            res.set('Content-Type', 'application/xml');
            res.set('Cache-Control', 'public, max-age=3600');
            return res.send(sitemapCache.xml);
        }
        // Generate fresh sitemap
        const sitemap = await generateSitemap();
        // Cache it
        sitemapCache = {
            xml: sitemap,
            generatedAt: Date.now(),
        };
        res.set('Content-Type', 'application/xml');
        res.set('Cache-Control', 'public, max-age=3600');
        res.send(sitemap);
    }
    catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).send('<!-- Sitemap generation failed -->');
    }
});
/**
 * GET /robots.txt
 * Dynamic robots.txt
 */
sitemapRouter.get('/robots.txt', (_req, res) => {
    const robotsTxt = `# HandyWriterz Robots.txt
User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /admin/
Disallow: /api/
Disallow: /sign-in/
Disallow: /sign-up/

# Sitemaps
Sitemap: ${SITE_URL}/sitemap.xml
`;
    res.set('Content-Type', 'text/plain');
    res.set('Cache-Control', 'public, max-age=86400'); // 24 hours
    res.send(robotsTxt);
});
/**
 * POST /sitemap/invalidate
 * Force sitemap regeneration (called by webhooks)
 */
sitemapRouter.post('/invalidate', (_req, res) => {
    sitemapCache = null;
    console.log('[Sitemap] Cache invalidated');
    res.json({ invalidated: true, timestamp: new Date().toISOString() });
});
// Helper function to generate sitemap XML
async function generateSitemap() {
    const urls = [];
    const now = new Date().toISOString();
    // Static pages
    const staticPages = [
        { loc: '/', priority: '1.0', changefreq: 'daily' },
        { loc: '/services', priority: '0.9', changefreq: 'daily' },
        { loc: '/about', priority: '0.7', changefreq: 'monthly' },
        { loc: '/pricing', priority: '0.8', changefreq: 'weekly' },
        { loc: '/contact', priority: '0.6', changefreq: 'monthly' },
        { loc: '/faq', priority: '0.6', changefreq: 'monthly' },
    ];
    staticPages.forEach(page => {
        urls.push({
            loc: `${SITE_URL}${page.loc}`,
            lastmod: now,
            changefreq: page.changefreq,
            priority: page.priority,
        });
    });
    // Domain landing pages
    const domains = [
        'nursing', 'medicine', 'psychology', 'sociology',
        'business', 'technology', 'ai', 'education',
        'law', 'history', 'literature', 'science'
    ];
    domains.forEach(domain => {
        urls.push({
            loc: `${SITE_URL}/d/${domain}`,
            lastmod: now,
            changefreq: 'weekly',
            priority: '0.8',
        });
    });
    // Fetch services from Strapi
    try {
        const servicesResponse = await fetch(`${CMS_URL}/api/services?populate=*&pagination[pageSize]=100&sort=updatedAt:desc`);
        if (servicesResponse.ok) {
            const servicesData = await servicesResponse.json();
            const services = servicesData.data || [];
            services.forEach((service) => {
                const attrs = service.attributes || service;
                if (attrs.publishedAt && attrs.slug) {
                    urls.push({
                        loc: `${SITE_URL}/services/${attrs.domain || 'general'}/${attrs.slug}`,
                        lastmod: attrs.updatedAt || attrs.publishedAt,
                        changefreq: 'weekly',
                        priority: '0.7',
                    });
                }
            });
            console.log(`[Sitemap] Added ${services.length} services`);
        }
    }
    catch (error) {
        console.error('[Sitemap] Failed to fetch services:', error);
    }
    // Fetch articles from Strapi
    try {
        const articlesResponse = await fetch(`${CMS_URL}/api/articles?populate=*&pagination[pageSize]=100&sort=updatedAt:desc`);
        if (articlesResponse.ok) {
            const articlesData = await articlesResponse.json();
            const articles = articlesData.data || [];
            articles.forEach((article) => {
                const attrs = article.attributes || article;
                if (attrs.publishedAt && attrs.slug) {
                    urls.push({
                        loc: `${SITE_URL}/articles/${attrs.slug}`,
                        lastmod: attrs.updatedAt || attrs.publishedAt,
                        changefreq: 'weekly',
                        priority: '0.6',
                    });
                }
            });
            console.log(`[Sitemap] Added ${articles.length} articles`);
        }
    }
    catch (error) {
        console.error('[Sitemap] Failed to fetch articles:', error);
    }
    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    console.log(`[Sitemap] Generated with ${urls.length} URLs`);
    return xml;
}
function escapeXml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
//# sourceMappingURL=sitemap.js.map