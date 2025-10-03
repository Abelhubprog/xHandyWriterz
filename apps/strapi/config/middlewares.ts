export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  {
    name: 'strapi::session',
    config: {
      /**
       * Railway terminates TLS before Strapi, so ctx.secure remains false even
       * over HTTPS. Until the proxy headers are trusted end-to-end, keep the
       * admin session cookie non-secure so logins succeed.
       */
      secure: false,
      sameSite: 'lax',
    },
  },
  'strapi::favicon',
  'strapi::public',
];
