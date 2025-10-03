export default ({ env }) => ({
  // GraphQL Plugin Configuration
  graphql: {
    enabled: true,
    config: {
      playgroundAlways: true,
      defaultLimit: 10,
      maxLimit: 20,
      apolloServer: {
        tracing: false,
      },
    },
  },

  // Upload Provider Configuration for Cloudflare R2
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

  // Email Provider Configuration
  // Supports: resend (recommended), nodemailer (SMTP), sendgrid
  email: env('EMAIL_PROVIDER') ? {
    config: {
      provider: env('EMAIL_PROVIDER', 'sendmail'),
      providerOptions: env('EMAIL_PROVIDER') === 'resend' ? {
        apiKey: env('RESEND_API_KEY'),
      } : env('EMAIL_PROVIDER') === 'nodemailer' ? {
        host: env('SMTP_HOST'),
        port: env.int('SMTP_PORT', 587),
        secure: env.bool('SMTP_SECURE', false),
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
      } : env('EMAIL_PROVIDER') === 'sendgrid' ? {
        apiKey: env('SENDGRID_API_KEY'),
      } : {},
      settings: {
        defaultFrom: env('EMAIL_FROM', 'noreply@handywriterz.com'),
        defaultReplyTo: env('EMAIL_REPLY_TO', 'support@handywriterz.com'),
      },
    },
  } : undefined,
});
