/// <reference types="vite/client" />

// Comprehensive environment variables declarations for HandyWriterz
interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_URL: string;

  // Application Settings
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_DESCRIPTION: string;
  readonly VITE_APP_URL: string;

  // Cloudflare Configuration
  readonly VITE_CLOUDFLARE_DATABASE_URL?: string;
  readonly VITE_CLOUDFLARE_API_TOKEN?: string;
  readonly VITE_CLOUDFLARE_ACCOUNT_ID?: string;
  readonly VITE_CLOUDFLARE_DATABASE_ID?: string;

  // Clerk Authentication
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_CLERK_DOMAIN?: string;
  readonly VITE_CLERK_SIGN_IN_URL: string;
  readonly VITE_CLERK_SIGN_UP_URL: string;
  readonly VITE_CLERK_AFTER_SIGN_IN_URL: string;
  readonly VITE_CLERK_AFTER_SIGN_UP_URL: string;

  // Vite Built-in Environment Variables
  readonly PROD: boolean;
  readonly DEV: boolean;

  // Feature Flags - Public Access
  readonly VITE_ENABLE_PUBLIC_ACCESS: string;
  readonly VITE_ENABLE_PUBLIC_ROUTES: string;
  readonly VITE_ENABLE_COMMENTS: string;

  // Feature Flags - Admin Features
  readonly VITE_ENABLE_ADMIN_DASHBOARD: string;
  readonly VITE_ENABLE_USER_MANAGEMENT: string;
  readonly VITE_ENABLE_CONTENT_MANAGEMENT: string;
  readonly VITE_ENABLE_ROLE_MANAGEMENT: string;

  // Service Configuration
  readonly VITE_TURNITIN_MAX_FILE_SIZE: string;
  readonly VITE_TURNITIN_ALLOWED_TYPES: string;

  // Feature Flags - Services
  readonly VITE_ENABLE_TURNITIN: string;
  readonly VITE_ENABLE_TELEGRAM: string;

  // Web3 Configuration
  readonly VITE_DISABLE_METAMASK_DETECTION: string;
  readonly VITE_PREFERRED_WALLET: string;

  // StableLink.xyz Integration
  readonly VITE_STABLELINK_API_KEY: string;
  readonly VITE_STABLELINK_WEBHOOK_SECRET: string;
  readonly VITE_STABLELINK_ENVIRONMENT: string;

  // Supabase (Legacy)
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Declare missing modules or types if necessary
declare module 'some-untyped-module';

declare module '@mui/material/styles' {
  interface Theme {
    // Add custom theme properties if any
  }
  interface ThemeOptions {
    // Add custom theme options if any
  }
}
