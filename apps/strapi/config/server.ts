import type { ServerConfig } from '@strapi/strapi';

export default ({ env }: { env: (key: string, defaultValue?: string) => string }): ServerConfig => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  url: env('APP_URL', undefined),
});
