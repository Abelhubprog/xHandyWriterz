export default ({ env }: { env: (key: string, defaultValue?: string) => string }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  url: env('ADMIN_URL', '/admin'),
});
