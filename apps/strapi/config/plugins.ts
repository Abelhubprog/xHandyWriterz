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
});
