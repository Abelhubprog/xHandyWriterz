import path from 'path';

type DatabaseClient = 'sqlite' | 'postgres' | 'mysql';

type SslConfig = false | {
  rejectUnauthorized: boolean;
  ca?: string;
  cert?: string;
  key?: string;
  capath?: string;
  cipher?: string;
};

export default ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite') as DatabaseClient;

  const basePool = {
    min: env.int('DATABASE_POOL_MIN', 2),
    max: env.int('DATABASE_POOL_MAX', 10),
    acquireTimeoutMillis: env.int('DATABASE_ACQUIRE_TIMEOUT', 60000),
    createTimeoutMillis: env.int('DATABASE_CREATE_TIMEOUT', 60000),
    idleTimeoutMillis: env.int('DATABASE_IDLE_TIMEOUT', 60000),
  } as const;

  const acquireConnectionTimeout = env.int('DATABASE_CONNECTION_TIMEOUT', 60000);

  const resolveSsl = (defaultRejectUnauthorized = true): SslConfig => {
    if (!env.bool('DATABASE_SSL', false)) {
      return false;
    }

    return {
      rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', defaultRejectUnauthorized),
      ca: env('DATABASE_SSL_CA') || undefined,
      cert: env('DATABASE_SSL_CERT') || undefined,
      key: env('DATABASE_SSL_KEY') || undefined,
      capath: env('DATABASE_SSL_CAPATH') || undefined,
      cipher: env('DATABASE_SSL_CIPHER') || undefined,
    };
  };

  if (client === 'postgres') {
    const connectionString = env('DATABASE_URL');

    const connection = connectionString
      ? {
          connectionString,
          ssl: resolveSsl(),
          schema: env('DATABASE_SCHEMA', 'public'),
        }
      : {
          host: env('DATABASE_HOST', '127.0.0.1'),
          port: env.int('DATABASE_PORT', 5432),
          database: env('DATABASE_NAME', 'strapi'),
          user: env('DATABASE_USERNAME', 'strapi'),
          password: env('DATABASE_PASSWORD', 'strapi'),
          schema: env('DATABASE_SCHEMA', 'public'),
          ssl: resolveSsl(false),
        };

    return {
      connection: {
        client,
        connection,
        pool: basePool,
        acquireConnectionTimeout,
      },
    };
  }

  if (client === 'mysql') {
    const connection = {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 3306),
      database: env('DATABASE_NAME', 'strapi'),
      user: env('DATABASE_USERNAME', 'strapi'),
      password: env('DATABASE_PASSWORD', 'strapi'),
      ssl: resolveSsl(),
    };

    return {
      connection: {
        client,
        connection,
        pool: {
          min: env.int('DATABASE_POOL_MIN', 2),
          max: env.int('DATABASE_POOL_MAX', 10),
        },
        acquireConnectionTimeout,
      },
    };
  }

  return {
    connection: {
      client,
      connection: {
        filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
  };
};

