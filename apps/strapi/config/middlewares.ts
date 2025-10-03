export default ({ env }) => {
  const isProduction = env('NODE_ENV', 'development') === 'production';

  return [
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
        secure: env.bool('ADMIN_SESSION_COOKIE_SECURE', isProduction),
        sameSite: env('ADMIN_SESSION_COOKIE_SAMESITE', isProduction ? 'none' : 'lax'),
      },
    },
    'strapi::favicon',
    'strapi::public',
  ];
};
