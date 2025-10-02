/**
 * Sentry configuration for production monitoring
 */

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'development';
const RELEASE_VERSION = import.meta.env.VITE_RELEASE_VERSION || 'unknown';

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('[Sentry] No DSN configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    release: RELEASE_VERSION,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event, hint) {
      // Filter out non-critical errors
      if (event.exception) {
        const error = hint.originalException;
        if (error instanceof Error) {
          // Ignore network errors that are expected
          if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            return null;
          }
        }
      }
      return event;
    },
  });

  console.log(`[Sentry] Initialized for ${ENVIRONMENT} environment`);
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  if (SENTRY_DSN) {
    Sentry.captureException(error, { extra: context });
  } else {
    console.error('[Sentry fallback]', error, context);
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`[Sentry fallback ${level}]`, message);
  }
}

export function setUserContext(user: { id: string; email?: string; username?: string }) {
  if (SENTRY_DSN) {
    Sentry.setUser(user);
  }
}

export function clearUserContext() {
  if (SENTRY_DSN) {
    Sentry.setUser(null);
  }
}

export { Sentry };
