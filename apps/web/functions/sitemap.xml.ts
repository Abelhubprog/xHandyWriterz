import { getMessagingOrigin } from './_lib/config';

const XML_HEADERS = { 'content-type': 'application/xml; charset=utf-8' };

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const origin = getMessagingOrigin(context.env);
    const base = (context.request.headers.get('x-forwarded-proto') ? `${context.request.headers.get('x-forwarded-proto')}://` : 'https://') + new URL(context.request.url).host;

    const [servicesRes, articlesRes] = await Promise.all([
      fetch(`${origin}/api/services?fields[0]=slug&pagination[pageSize]=1000`),
      fetch(`${origin}/api/articles?fields[0]=slug&pagination[pageSize]=1000`),
    ]);

    const servicesJson = servicesRes.ok ? await servicesRes.json() : { data: [] };
    const articlesJson = articlesRes.ok ? await articlesRes.json() : { data: [] };

    const urls: string[] = [];
    urls.push(`${base}/`);
    urls.push(`${base}/services`);

    for (const s of servicesJson.data ?? []) {
      const slug = s?.attributes?.slug || s?.slug;
      if (slug) urls.push(`${base}/services/general/${encodeURIComponent(slug)}`);
    }
    for (const a of articlesJson.data ?? []) {
      const slug = a?.attributes?.slug || a?.slug;
      if (slug) urls.push(`${base}/articles/${encodeURIComponent(slug)}`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      urls.map((u) => `<url><loc>${u}</loc></url>`).join('') +
      `</urlset>`;

    return new Response(xml, { status: 200, headers: XML_HEADERS });
  } catch (error) {
    return new Response('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', { status: 200, headers: XML_HEADERS });
  }
};
