import type { DatabaseConfig } from '@strapi/strapi';

export default ({ env }: { env: (key: string, defaultValue?: string) => string }): DatabaseConfig => ({
  connection: {
    client: env('DATABASE_CLIENT', 'postgres'),
    connection: {
      connectionString: env('DATABASE_URL'),
      host: env('DATABASE_HOST', '127.0.0.1'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'handywriterz_cms'),
      user: env('DATABASE_USERNAME', 'strapi'),
      password: env('DATABASE_PASSWORD', 'strapi'),
      ssl: env.bool('DATABASE_SSL', false) ? { rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true) } : false,
    },
    pool: {
      min: 2,
      max: env.int('DATABASE_POOL_MAX', 10),
    },
  },
});
