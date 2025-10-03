export default ({ env }) => {
  const host = env('HOST', '0.0.0.0');
  const port = env.int('PORT', 1337);
  const isProduction = env('NODE_ENV', 'development') === 'production';
  const publicUrl = env('URL');
  const enableProxy = env.bool('ENABLE_PROXY', isProduction);

  const serverConfig: Record<string, unknown> = {
    host,
    port,
    app: {
      keys: env.array('APP_KEYS'),
    },
  };

  // Railway proxy configuration - CRITICAL for HTTPS detection
  if (enableProxy) {
    serverConfig.proxy = {
      enabled: true,
      // Trust Railway's proxy headers
      koa: {
        proxy: true,
        proxyIpHeader: 'X-Forwarded-For',
        maxIpsCount: 1,
      },
    };
  } else {
    serverConfig.proxy = false;
  }

  if (publicUrl) {
    serverConfig.url = publicUrl;
  } else if (!isProduction) {
    serverConfig.url = `http://${host}:${port}`;
  }

  return serverConfig;
};
