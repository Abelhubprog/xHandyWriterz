/**
 * Main Application Entry
 *
 * Sets up the React application and all required providers.
 *
 * @file src/main.tsx
 */

// Load polyfills first
import './polyfills';

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
// Use the app's centralized ClerkProvider so config is consistent across the app
import { ClerkProvider } from './providers/ClerkProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
// Removed SupabaseProvider - using Cloudflare instead
import { ThemeProvider } from './theme/ThemeContext';
import Web3Provider from './providers/Web3Provider';
import { CMSProvider } from './hooks';
import { logEnvironmentStatus } from './utils/checkEnv';
import { initSentry } from './lib/sentry';
import './index.css';
import './styles.css';
import { router } from './router';
import ErrorBoundary from './components/common/ErrorBoundary';
import { envValidation } from './env';

// Initialize observability
initSentry();

// Check environment on startup
logEnvironmentStatus();

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Clerk key is configured via env in providers/ClerkProvider; no fallback here to avoid accidental prod key leakage

// Try to render the application, with error handling
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  ReactDOM.createRoot(rootElement).render(
    <HelmetProvider>
      <Web3Provider>
        <ThemeProvider>
          {!envValidation.ok && import.meta.env.PROD ? (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
              <div className="max-w-xl w-full">
                <h1 className="text-2xl font-semibold">Deployment misconfigured</h1>
                <p className="mt-2 text-slate-300">
                  This deployment is missing required environment variables.
                </p>
                <ul className="mt-4 list-disc pl-5 text-slate-200">
                  {envValidation.issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
                <p className="mt-6 text-slate-400 text-sm">
                  Fix the Railway service variables and redeploy.
                </p>
              </div>
            </div>
          ) : (
            <ClerkProvider
              routerPush={(to) => router.navigate(to)}
              routerReplace={(to) => router.navigate(to, { replace: true })}
            >
              <QueryClientProvider client={queryClient}>
                <CMSProvider>
                  <Toaster />
                  <ErrorBoundary>
                    <Suspense fallback={<div className="flex h-screen items-center justify-center text-slate-200 bg-slate-950">Loading…</div>}>
                      <RouterProvider router={router} />
                    </Suspense>
                  </ErrorBoundary>
                </CMSProvider>
              </QueryClientProvider>
            </ClerkProvider>
          )}
        </ThemeProvider>
      </Web3Provider>
    </HelmetProvider>
  );
} catch (error) {

  // Render a fallback UI
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: system-ui, sans-serif;">
        <h1 style="color: #0369a1;">HandyWriterz</h1>
        <p>We're experiencing technical difficulties. Please try again later.</p>
      </div>
    `;
  }
}

