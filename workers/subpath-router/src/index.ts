export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Required env:
    //  - WEB_ORIGIN: Cloudflare Pages domain for web (e.g., https://web.example.pages.dev)
    const webOrigin = (env.WEB_ORIGIN as string).replace(/\/$/, '');

    // Proxy all routes to the web app unchanged. Special-case sitemap.xml just proxies to web origin as well.
    const outUrl = new URL(webOrigin);
    outUrl.pathname = pathname;
    outUrl.search = url.search;

    const req = new Request(outUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer(),
      redirect: 'manual',
    });

    const res = await fetch(req);
    return new Response(res.body, { status: res.status, headers: res.headers });
  },
} as any;
