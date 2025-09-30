/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API
  readonly VITE_API_URL: string

  // Application Settings
  readonly VITE_APP_NAME: string
  readonly VITE_APP_URL: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_APP_TITLE: string
  readonly VITE_URL: string

  // Cloudflare Database
  readonly VITE_CLOUDFLARE_DATABASE_URL: string
  readonly VITE_CLOUDFLARE_API_TOKEN: string
  readonly VITE_CLOUDFLARE_ACCOUNT_ID: string
  readonly VITE_CLOUDFLARE_DATABASE_ID: string

  // Clerk Auth
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_CLERK_SIGN_IN_URL: string
  readonly VITE_CLERK_SIGN_UP_URL: string
  readonly VITE_CLERK_AFTER_SIGN_IN_URL: string
  readonly VITE_CLERK_AFTER_SIGN_UP_URL: string

  // Public Access Features
  readonly VITE_ENABLE_PUBLIC_ACCESS: string
  readonly VITE_ENABLE_ANONYMOUS_LIKES: string
  readonly VITE_ENABLE_ANONYMOUS_SHARES: string
  readonly VITE_ENABLE_SOCIAL_SHARING: string
  readonly VITE_ENABLE_AUTHENTICATED_COMMENTS: string
  readonly VITE_ENABLE_PUBLIC_LIKES: string
  readonly VITE_ENABLE_PUBLIC_SHARES: string
  readonly VITE_ENABLE_COMMENTS: string
  readonly VITE_ENABLE_PUBLIC_ROUTES: string
  readonly VITE_MAINTENANCE_MODE: string
  readonly VITE_ADMIN_CONTACT_EMAIL: string

  // Content Management
  readonly VITE_STORAGE_BUCKET: string
  readonly VITE_ALLOWED_FILE_TYPES: string
  readonly VITE_MAX_FILE_SIZE: string

  // Admin Features
  readonly VITE_ADMIN_EMAIL: string
  readonly VITE_ENABLE_ADMIN_DASHBOARD: string
  readonly VITE_ENABLE_USER_MANAGEMENT: string
  readonly VITE_ENABLE_CONTENT_MANAGEMENT: string
  readonly VITE_ENABLE_ROLE_MANAGEMENT: string

  // Performance & Configuration
  readonly VITE_API_TIMEOUT: string
  readonly VITE_RETRY_ATTEMPTS: string
  readonly VITE_DASHBOARD_URL: string
  readonly VITE_ADMIN_DASHBOARD_URL: string
  readonly VITE_ENABLE_QUERY_CACHING: string
  readonly VITE_CACHE_DURATION: string
  readonly VITE_MAX_CONCURRENT_REQUESTS: string
  readonly VITE_ENABLE_REALTIME: string
  readonly VITE_ENABLE_CDN: string
  readonly VITE_ENABLE_COMPRESSION: string

  // Service Configuration
  readonly VITE_TURNITIN_MAX_FILE_SIZE: string
  readonly VITE_TURNITIN_ALLOWED_TYPES: string
  readonly VITE_ENABLE_TURNITIN: string
  readonly VITE_ENABLE_TELEGRAM: string
  readonly VITE_TELEGRAM_BOT_TOKEN: string
  readonly VITE_STRIPE_PUBLIC_KEY: string
  readonly VITE_TURNITIN_CHECK_PRICE: string

  // Debug Settings
  readonly VITE_ENABLE_DEBUG: string
  readonly VITE_DEBUG_MODE: string

  // WebSocket Configuration
  readonly VITE_WS_URL: string
  readonly VITE_ENABLE_WEBSOCKET: string

  // Web3 Configuration
  readonly VITE_DISABLE_METAMASK_DETECTION: string
  readonly VITE_PREFERRED_WALLET: string

  // Any other env vars
  [key: string]: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
