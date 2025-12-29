export default ({ env }) => {
  const isProduction = env('NODE_ENV', 'development') === 'production';

  return {
    // GraphQL Plugin Configuration
    graphql: {
      enabled: true,
      config: {
        // Disable playground in production for security
        playgroundAlways: !isProduction,
        defaultLimit: 10,
        maxLimit: 100,
        apolloServer: {
          tracing: false,
          introspection: !isProduction,
        },
      },
    },

    // Upload Provider Configuration for Cloudflare R2
    // Only configure if R2 credentials are available
    ...(env('R2_ACCESS_KEY_ID') && env('R2_SECRET_ACCESS_KEY') && env('R2_ENDPOINT') && env('R2_BUCKET')
      ? {
          upload: {
            config: {
              provider: 'aws-s3',
              providerOptions: {
                s3Options: {
                  credentials: {
                    accessKeyId: env('R2_ACCESS_KEY_ID'),
                    secretAccessKey: env('R2_SECRET_ACCESS_KEY'),
                  },
                  endpoint: env('R2_ENDPOINT'),
                  region: env('R2_REGION', 'auto'),
                  // Required for R2 compatibility
                  forcePathStyle: true,
                  params: {
                    Bucket: env('R2_BUCKET'),
                  },
                },
              },
              actionOptions: {
                upload: {},
                uploadStream: {},
                delete: {},
              },
            },
          },
        }
      : {}),

    // Email Provider Configuration
    // Supports: resend (recommended), nodemailer (SMTP), sendgrid
    // Only configure if EMAIL_PROVIDER is set
    ...(env('EMAIL_PROVIDER')
      ? {
          email: {
            config: {
              provider: env('EMAIL_PROVIDER', 'sendmail'),
              providerOptions:
                env('EMAIL_PROVIDER') === 'resend'
                  ? {
                      apiKey: env('RESEND_API_KEY'),
                    }
                  : env('EMAIL_PROVIDER') === 'nodemailer'
                  ? {
                      host: env('SMTP_HOST'),
                      port: env.int('SMTP_PORT', 587),
                      secure: env.bool('SMTP_SECURE', false),
                      auth: {
                        user: env('SMTP_USERNAME'),
                        pass: env('SMTP_PASSWORD'),
                      },
                    }
                  : env('EMAIL_PROVIDER') === 'sendgrid'
                  ? {
                      apiKey: env('SENDGRID_API_KEY'),
                    }
                  : {},
              settings: {
                defaultFrom: env('EMAIL_FROM', 'noreply@handywriterz.com'),
                defaultReplyTo: env('EMAIL_REPLY_TO', 'support@handywriterz.com'),
              },
            },
          },
        }
      : {}),
  };
};
