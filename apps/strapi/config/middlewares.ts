export default ({ env }) => {
  const isProduction = env('NODE_ENV', 'development') === 'production';
  const corsOrigins = env('CORS_ORIGIN', '')
    .split(',')
    .map((o: string) => o.trim())
    .filter(Boolean);

  return [
    'strapi::logger',
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'connect-src': ["'self'", 'https:'],
            'img-src': ["'self'", 'data:', 'blob:', 'https:'],
            'media-src': ["'self'", 'data:', 'blob:', 'https:'],
            upgradeInsecureRequests: isProduction ? [] : null,
          },
        },
      },
    },
    {
      name: 'strapi::cors',
      config: {
        enabled: true,
        headers: '*',
        origin: corsOrigins.length > 0 ? corsOrigins : [
          'http://localhost:5173',
          'http://localhost:4173',
          'http://localhost:3000',
          'https://handywriterz.com',
          'https://www.handywriterz.com',
        ],
      },
    },
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};
