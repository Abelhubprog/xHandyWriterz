/**
 * Feature flags configuration
 * These control experimental or toggleable features in the application
 */

// Environment-based feature detection
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export interface FeatureFlags {
  // Authentication features
  enableSocialLogin: boolean;
  enableMagicLink: boolean;
  
  // Payment features
  enablePayments: boolean;
  enableSubscriptions: boolean;
  enableCrypto: boolean;
  
  // Messaging features
  enableMessaging: boolean;
  enableRealTimeChat: boolean;
  
  // Content features
  enableComments: boolean;
  enableBlog: boolean;
  enableDrafts: boolean;
  
  // AI features
  enableAIAssistant: boolean;
  enablePlagiarismCheck: boolean;
  
  // Debug features
  enableDebugMode: boolean;
  enableAnalytics: boolean;
}

export const featureFlags: FeatureFlags = {
  // Authentication
  enableSocialLogin: true,
  enableMagicLink: false,
  
  // Payments
  enablePayments: true,
  enableSubscriptions: true,
  enableCrypto: false, // Disabled - Dynamic Labs not integrated
  
  // Messaging
  enableMessaging: Boolean(import.meta.env.VITE_MATTERMOST_URL),
  enableRealTimeChat: Boolean(import.meta.env.VITE_MATTERMOST_URL),
  
  // Content
  enableComments: true,
  enableBlog: true,
  enableDrafts: true,
  
  // AI
  enableAIAssistant: Boolean(import.meta.env.VITE_OPENAI_API_KEY),
  enablePlagiarismCheck: true,
  
  // Debug
  enableDebugMode: isDevelopment,
  enableAnalytics: isProduction,
};

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return featureFlags[feature] ?? false;
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): (keyof FeatureFlags)[] {
  return (Object.keys(featureFlags) as (keyof FeatureFlags)[])
    .filter(key => featureFlags[key]);
}

export default featureFlags;
