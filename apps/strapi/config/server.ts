export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  /**
   * `url` ensures Strapi generates absolute links with the correct protocol when
   * it sits behind Railway's reverse proxy (HTTPS outside, HTTP inside).
   */
  url: env('URL', 'http://localhost:1337'),
  /**
   * `proxy` allows Strapi to trust `x-forwarded-*` headers so secure cookies can
   * be issued even though the upstream connection to the proxy is plain HTTP.
   */
  proxy: env.bool('ENABLE_PROXY', true),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
