import { env } from '@/env';

const rawBase = env.VITE_API_URL ? env.VITE_API_URL.replace(/\/$/, '') : '';

export function resolveApiUrl(path: string): string {
  if (!rawBase) {
    return path;
  }
  if (/^https?:/i.test(path)) {
    return path;
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (rawBase.endsWith('/api') && normalizedPath.startsWith('/api')) {
    return `${rawBase}${normalizedPath.slice(4)}`;
  }
  return `${rawBase}${normalizedPath}`;
}
