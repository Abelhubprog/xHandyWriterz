import { z } from 'zod';

const envSchema = z.object({
  // API
  VITE_API_URL: z.string().url().default('http://localhost:5173/api'),

  // CMS
  VITE_CMS_URL: z.string().url().default('http://localhost:1337'),
  VITE_CMS_TOKEN: z.string().optional(),

  // Integrations
  VITE_UPLOAD_BROKER_URL: z.string().url().optional(),
  VITE_MATTERMOST_URL: z.string().url().optional(),
  VITE_MATTERMOST_API_URL: z.string().url().optional(),
  VITE_MM_AUTH_URL: z.string().url().optional(),
  VITE_CLERK_MM_TOKEN_TEMPLATE: z.string().optional(),
  VITE_MATTERMOST_TEAM_ID: z.string().optional(),

  // Application Settings
  VITE_APP_NAME: z.string().min(1).default('HandyWriterz'),
  VITE_APP_URL: z.string().url().default('http://localhost:5173'),
  VITE_APP_DESCRIPTION: z.string().default('Professional academic services platform'),

  // Cloudflare Database (optional for development)
  VITE_CLOUDFLARE_DATABASE_URL: z.string().optional(),
  VITE_CLOUDFLARE_API_TOKEN: z.string().optional(),
  VITE_CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  VITE_CLOUDFLARE_DATABASE_ID: z.string().optional(),

  // Clerk
  VITE_CLERK_PUBLISHABLE_KEY: z.string().min(1).default('pk_test_default'),
  VITE_CLERK_DOMAIN: z.string().optional(),
  VITE_CLERK_SIGN_IN_URL: z.string().default('/sign-in'),
  VITE_CLERK_SIGN_UP_URL: z.string().default('/sign-up'),
  VITE_CLERK_AFTER_SIGN_IN_URL: z.string().default('/dashboard'),
  VITE_CLERK_AFTER_SIGN_UP_URL: z.string().default('/dashboard'),

  // StableLink.xyz Integration
  VITE_STABLELINK_API_KEY: z.string().optional().default(''),
  VITE_STABLELINK_WEBHOOK_SECRET: z.string().optional().default(''),
  VITE_STABLELINK_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),

  // Email Service (Resend)
  VITE_RESEND_API_KEY: z.string().optional().default(''),

  // Public Features
  VITE_ENABLE_PUBLIC_ACCESS: z.coerce.boolean().default(true),
  VITE_ENABLE_PUBLIC_ROUTES: z.coerce.boolean().default(true),
  VITE_ENABLE_COMMENTS: z.coerce.boolean().default(true),

  // Admin Features
  VITE_ENABLE_ADMIN_DASHBOARD: z.coerce.boolean().default(true),
  VITE_ENABLE_USER_MANAGEMENT: z.coerce.boolean().default(true),
  VITE_ENABLE_CONTENT_MANAGEMENT: z.coerce.boolean().default(true),
  VITE_ENABLE_ROLE_MANAGEMENT: z.coerce.boolean().default(true),

  // Service configuration
  VITE_TURNITIN_MAX_FILE_SIZE: z.coerce.number().default(20971520),
  VITE_TURNITIN_ALLOWED_TYPES: z.string().default('application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'),

  // Feature flags
  VITE_ENABLE_TURNITIN: z.coerce.boolean().default(true),
  VITE_ENABLE_TELEGRAM: z.coerce.boolean().default(true),

  // Web3 Configuration
  VITE_DISABLE_METAMASK_DETECTION: z.coerce.boolean().optional().default(false),
  VITE_PREFERRED_WALLET: z.string().optional().default('metamask')
});

function getEnvVars() {
  const isProd = import.meta.env.PROD;

  // Use import.meta.env directly with type safety
  const envVars = {
    // API
    VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5173/api',

    // CMS
    VITE_CMS_URL: import.meta.env.VITE_CMS_URL || 'http://localhost:1337',
    VITE_CMS_TOKEN: import.meta.env.VITE_CMS_TOKEN || '',
    VITE_UPLOAD_BROKER_URL: import.meta.env.VITE_UPLOAD_BROKER_URL,

    // Application Settings
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME || 'HandyWriterz',
    VITE_APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    VITE_APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'Professional academic services platform',

    // Cloudflare Database
    VITE_CLOUDFLARE_DATABASE_URL: import.meta.env.VITE_CLOUDFLARE_DATABASE_URL,
    VITE_CLOUDFLARE_API_TOKEN: import.meta.env.VITE_CLOUDFLARE_API_TOKEN,
    VITE_CLOUDFLARE_ACCOUNT_ID: import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID,
    VITE_CLOUDFLARE_DATABASE_ID: import.meta.env.VITE_CLOUDFLARE_DATABASE_ID,

    // Clerk
    VITE_CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_default',
    VITE_CLERK_DOMAIN: import.meta.env.VITE_CLERK_DOMAIN || '',
    VITE_CLERK_SIGN_IN_URL: import.meta.env.VITE_CLERK_SIGN_IN_URL || '/sign-in',
    VITE_CLERK_SIGN_UP_URL: import.meta.env.VITE_CLERK_SIGN_UP_URL || '/sign-up',
    VITE_CLERK_AFTER_SIGN_IN_URL: import.meta.env.VITE_CLERK_AFTER_SIGN_IN_URL || '/dashboard',
    VITE_CLERK_AFTER_SIGN_UP_URL: import.meta.env.VITE_CLERK_AFTER_SIGN_UP_URL || '/dashboard',

    // StableLink.xyz Integration
    VITE_STABLELINK_API_KEY: import.meta.env.VITE_STABLELINK_API_KEY || '',
    VITE_STABLELINK_WEBHOOK_SECRET: import.meta.env.VITE_STABLELINK_WEBHOOK_SECRET || '',
    VITE_STABLELINK_ENVIRONMENT: import.meta.env.VITE_STABLELINK_ENVIRONMENT || 'sandbox',

    // Email Service (Resend)
    VITE_RESEND_API_KEY: import.meta.env.VITE_RESEND_API_KEY || '',

    // Mattermost integration
    VITE_MATTERMOST_URL: import.meta.env.VITE_MATTERMOST_URL,
    VITE_MATTERMOST_API_URL: import.meta.env.VITE_MATTERMOST_API_URL,
    VITE_MM_AUTH_URL: import.meta.env.VITE_MM_AUTH_URL,
    VITE_CLERK_MM_TOKEN_TEMPLATE: import.meta.env.VITE_CLERK_MM_TOKEN_TEMPLATE,
    VITE_MATTERMOST_TEAM_ID: import.meta.env.VITE_MATTERMOST_TEAM_ID,

    // Public Features
    VITE_ENABLE_PUBLIC_ACCESS: import.meta.env.VITE_ENABLE_PUBLIC_ACCESS || 'true',
    VITE_ENABLE_PUBLIC_ROUTES: import.meta.env.VITE_ENABLE_PUBLIC_ROUTES || 'true',
    VITE_ENABLE_COMMENTS: import.meta.env.VITE_ENABLE_COMMENTS || 'true',

    // Admin Features
    VITE_ENABLE_ADMIN_DASHBOARD: import.meta.env.VITE_ENABLE_ADMIN_DASHBOARD || 'true',
    VITE_ENABLE_USER_MANAGEMENT: import.meta.env.VITE_ENABLE_USER_MANAGEMENT || 'true',
    VITE_ENABLE_CONTENT_MANAGEMENT: import.meta.env.VITE_ENABLE_CONTENT_MANAGEMENT || 'true',
    VITE_ENABLE_ROLE_MANAGEMENT: import.meta.env.VITE_ENABLE_ROLE_MANAGEMENT || 'true',

    // Service configuration
    VITE_TURNITIN_MAX_FILE_SIZE: import.meta.env.VITE_TURNITIN_MAX_FILE_SIZE || '20971520',
    VITE_TURNITIN_ALLOWED_TYPES: import.meta.env.VITE_TURNITIN_ALLOWED_TYPES || 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',

    // Feature flags
    VITE_ENABLE_TURNITIN: import.meta.env.VITE_ENABLE_TURNITIN || 'true',
    VITE_ENABLE_TELEGRAM: import.meta.env.VITE_ENABLE_TELEGRAM || 'true',

    // Web3 Configuration
    VITE_DISABLE_METAMASK_DETECTION: import.meta.env.VITE_DISABLE_METAMASK_DETECTION || 'false',
    VITE_PREFERRED_WALLET: import.meta.env.VITE_PREFERRED_WALLET || 'metamask'
  };

  if (isProd) {
    const missing: string[] = [];

    const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
    if (!clerkKey || clerkKey === 'pk_test_default') missing.push('VITE_CLERK_PUBLISHABLE_KEY');

    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) missing.push('VITE_API_URL');
    if (apiUrl && /(localhost|127\.0\.0\.1)/i.test(apiUrl)) {
      throw new Error('[env] VITE_API_URL must not point to localhost in production');
    }

    const appUrl = import.meta.env.VITE_APP_URL;
    if (!appUrl) missing.push('VITE_APP_URL');
    if (appUrl && /(localhost|127\.0\.0\.1)/i.test(appUrl)) {
      throw new Error('[env] VITE_APP_URL must not point to localhost in production');
    }

    const cmsUrl = import.meta.env.VITE_CMS_URL;
    if (!cmsUrl) missing.push('VITE_CMS_URL');

    if (missing.length) {
      throw new Error(`[env] Missing required environment variables for production: ${missing.join(', ')}`);
    }
  }

  const result = envSchema.safeParse(envVars);
  if (!result.success) {
    // Dev: keep local bring-up smooth, but surface schema issues in console
    console.warn('[env] Invalid environment variables; falling back to schema defaults', result.error);
    return envSchema.parse(envVars);
  }

  return result.data;
}

export const env = getEnvVars();
