import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { env } from '@/env';
import { mattermostClient, MattermostConfigError, type MattermostUserProfile } from '@/lib/mm-client';

export type MattermostAuthStatus = 'disabled' | 'idle' | 'loading' | 'ready' | 'error';

interface UseMMAuthResult {
  status: MattermostAuthStatus;
  user: MattermostUserProfile | null;
  error: Error | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  reauthenticate: () => Promise<void>;
  configured: boolean;
}

function isConfigured(): boolean {
  try {
    void mattermostClient.apiBaseUrl;
    void mattermostClient.authEndpoint;
    return true;
  } catch (error) {
    return false;
  }
}

export function useMMAuth(): UseMMAuthResult {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [status, setStatus] = useState<MattermostAuthStatus>(() => (isConfigured() ? 'idle' : 'disabled'));
  const [mmUser, setMmUser] = useState<MattermostUserProfile | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const prevClerkUserId = useRef<string | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshSessionRef = useRef<() => Promise<void>>();
  const tokenTemplate = env.VITE_CLERK_MM_TOKEN_TEMPLATE ?? undefined;
  const configured = isConfigured();

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
  }, []);

  const scheduleRefresh = useCallback((expiresAt?: number) => {
    clearRefreshTimer();
    if (!expiresAt) return;
    const ttlMs = expiresAt * 1000 - Date.now();
    if (ttlMs <= 0) {
      void refreshSessionRef.current?.();
      return;
    }
    const refreshIn = Math.max(30_000, ttlMs - 120_000);
    refreshTimer.current = setTimeout(() => {
      void refreshSessionRef.current?.();
    }, refreshIn);
  }, [clearRefreshTimer]);

  const exchangeSession = useCallback(async () => {
    if (!configured) {
      setStatus('disabled');
      return;
    }
    if (!isLoaded || !isSignedIn) {
      setStatus('idle');
      return;
    }
    setStatus('loading');
    setError(null);
    try {
      const token = await getToken(tokenTemplate ? { template: tokenTemplate } : undefined);
      if (!token) {
        throw new Error('Unable to acquire Clerk token for Mattermost session');
      }
      const response = await mattermostClient.exchange(token);
      setMmUser(response.user);
      setStatus('ready');
      scheduleRefresh(response.expiresAt);
    } catch (err) {
      const resolved = err instanceof Error ? err : new Error(String(err));
      setError(resolved);
      setStatus(resolved instanceof MattermostConfigError ? 'disabled' : 'error');
      console.error('Mattermost session exchange failed', err);
    }
  }, [configured, getToken, isLoaded, isSignedIn, scheduleRefresh, tokenTemplate]);

  const refreshSession = useCallback(async () => {
    if (!configured) return;
    try {
      const response = await mattermostClient.refresh();
      setMmUser(response.user);
      setStatus('ready');
      scheduleRefresh(Date.now() / 1000 + 3600);
    } catch (err) {
      console.warn('Mattermost session refresh failed', err);
      setStatus('error');
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [configured, scheduleRefresh]);

  useEffect(() => {
    refreshSessionRef.current = refreshSession;
    return () => {
      refreshSessionRef.current = undefined;
    };
  }, [refreshSession]);

  const logout = useCallback(async () => {
    clearRefreshTimer();
    if (!configured) return;
    try {
      await mattermostClient.logout();
    } catch (err) {
      console.warn('Mattermost logout failed', err);
    } finally {
      setMmUser(null);
      setStatus(configured ? 'idle' : 'disabled');
    }
  }, [clearRefreshTimer, configured]);

  useEffect(() => {
    if (!configured) {
      setStatus('disabled');
      return;
    }
    if (!isLoaded) {
      return;
    }
    if (!isSignedIn) {
      prevClerkUserId.current = null;
      if (status !== 'disabled') {
        void logout();
      }
      return;
    }

    const currentClerkId = clerkUser?.id ?? null;
    if (prevClerkUserId.current !== currentClerkId) {
      prevClerkUserId.current = currentClerkId;
      void exchangeSession();
      return;
    }

    if (status === 'idle') {
      void exchangeSession();
    }
  }, [clerkUser?.id, configured, exchangeSession, isLoaded, isSignedIn, logout, status]);

  useEffect(() => () => clearRefreshTimer(), [clearRefreshTimer]);

  return useMemo<UseMMAuthResult>(() => ({
    status,
    user: mmUser,
    error,
    refresh: refreshSession,
    logout,
    reauthenticate: exchangeSession,
    configured,
  }), [configured, error, exchangeSession, logout, mmUser, refreshSession, status]);
}

export default useMMAuth;
