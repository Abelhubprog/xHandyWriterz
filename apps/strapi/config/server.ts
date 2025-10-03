export default ({ env }) => {
  const host = env('HOST', '0.0.0.0');
  const port = env.int('PORT', 1337);
  const isProduction = env('NODE_ENV', 'development') === 'production';
  const publicUrl = env('URL');
  const proxy = env.bool('ENABLE_PROXY', isProduction);

  const serverConfig: Record<string, unknown> = {
    host,
    port,
    proxy,
    app: {
      keys: env.array('APP_KEYS'),
    },
  };

  if (publicUrl) {
    serverConfig.url = publicUrl;
  } else if (!isProduction) {
    serverConfig.url = `http://${host}:${port}`;
  }

  return serverConfig;
};
