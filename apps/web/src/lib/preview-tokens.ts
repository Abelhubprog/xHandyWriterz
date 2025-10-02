/**
 * Strapi Preview Token Management
 * Enables secure preview of draft content before publication
 */

import { env } from '@/env';
import type { ServiceListItem, ServiceDetail } from '@/types/cms';
import { z } from 'zod';

const PREVIEW_TOKEN_TTL = 3600 * 1000; // 1 hour

export interface PreviewToken {
  token: string;
  entityType: 'service' | 'article';
  entityId: string;
  expiresAt: number;
}

const previewTokenSchema = z.object({
  token: z.string(),
  entityType: z.enum(['service', 'article']),
  entityId: z.string(),
  expiresAt: z.number(),
});

/**
 * Generate a preview token for a Strapi entity
 * Tokens are signed JWTs or random strings with expiry
 */
export function generatePreviewToken(entityType: 'service' | 'article', entityId: string): PreviewToken {
  const token = generateRandomToken();
  const expiresAt = Date.now() + PREVIEW_TOKEN_TTL;
  
  return {
    token,
    entityType,
    entityId,
    expiresAt,
  };
}

/**
 * Validate a preview token
 */
export function validatePreviewToken(tokenString: string): PreviewToken | null {
  try {
    // In a real implementation, this would verify a JWT signature
    // For now, we decode from local storage or URL params
    const decoded = JSON.parse(atob(tokenString));
    const validated = previewTokenSchema.parse(decoded);
    
    if (validated.expiresAt < Date.now()) {
      return null; // Token expired
    }
    
    return validated as PreviewToken;
  } catch (error) {
    console.warn('Invalid preview token', error);
    return null;
  }
}

/**
 * Encode preview token for URL transmission
 */
export function encodePreviewToken(token: PreviewToken): string {
  return btoa(JSON.stringify(token));
}

/**
 * Fetch preview content from Strapi using token
 */
export async function fetchPreviewContent(token: PreviewToken): Promise<ServiceListItem | ServiceDetail | null> {
  const cmsUrl = env.VITE_CMS_URL;
  const cmsToken = env.VITE_CMS_TOKEN;
  
  if (!cmsUrl) {
    console.error('[preview] CMS URL not configured');
    return null;
  }

  const endpoint =
    token.entityType === 'service'
      ? `/api/services/${token.entityId}`
      : `/api/articles/${token.entityId}`;

  try {
    const url = new URL(endpoint, cmsUrl);
    url.searchParams.set('publicationState', 'preview');
    url.searchParams.set('populate', '*');

    const headers: HeadersInit = {
      'content-type': 'application/json',
    };

    if (cmsToken) {
      headers.authorization = `Bearer ${cmsToken}`;
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn(`[preview] Failed to fetch preview content: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.data ?? null;
  } catch (error) {
    console.error('[preview] Error fetching preview content', error);
    return null;
  }
}

/**
 * Build preview URL for sharing
 */
export function buildPreviewUrl(token: PreviewToken, baseUrl?: string): string {
  const encoded = encodePreviewToken(token);
  const base = baseUrl || window.location.origin;
  return `${base}/preview?token=${encodeURIComponent(encoded)}`;
}

/**
 * Generate random token (cryptographically secure)
 */
function generateRandomToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Store preview token in session storage for admin UI
 */
export function storePreviewToken(token: PreviewToken): void {
  try {
    sessionStorage.setItem(`preview_${token.entityType}_${token.entityId}`, JSON.stringify(token));
  } catch (error) {
    console.warn('Failed to store preview token', error);
  }
}

/**
 * Retrieve preview token from session storage
 */
export function retrievePreviewToken(entityType: 'service' | 'article', entityId: string): PreviewToken | null {
  try {
    const stored = sessionStorage.getItem(`preview_${entityType}_${entityId}`);
    if (!stored) return null;
    
    const token = previewTokenSchema.parse(JSON.parse(stored));
    if (token.expiresAt < Date.now()) {
      sessionStorage.removeItem(`preview_${entityType}_${entityId}`);
      return null;
    }
    
    return token as PreviewToken;
  } catch (error) {
    return null;
  }
}
