import type { StrapiConfig } from '@strapi/strapi';

export default ({ env }: { env: (key: string, defaultValue?: string) => string }): StrapiConfig['plugins'] => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        baseUrl: env('R2_PUBLIC_BASE', null),
        s3Options: {
          credentials: {
            accessKeyId: env('R2_ACCESS_KEY_ID'),
            secretAccessKey: env('R2_SECRET_ACCESS_KEY'),
          },
          endpoint: env('R2_ENDPOINT'),
          region: env('R2_REGION', 'auto'),
          forcePathStyle: true,
        },
        params: {
          Bucket: env('R2_BUCKET_CMS', 'cms-media'),
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
  graphql: {
    enabled: true,
    config: {
      defaultLimit: 25,
      maxLimit: 200,
      apolloServer: {
        introspection: true,
      },
    },
  },
  // F-034: Enable i18n for multi-language content
  i18n: {
    enabled: true,
    config: {
      // Available locales (add more as needed)
      locales: ['en', 'es', 'fr', 'de', 'zh', 'ar'],
      // Default locale
      defaultLocale: 'en',
    },
  },
});
