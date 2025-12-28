/**
 * Request logging middleware
 */

import { Request, Response, NextFunction } from 'express';

interface LogEntry {
  timestamp: string;
  method: string;
  path: string;
  status?: number;
  duration?: number;
  ip?: string;
  userAgent?: string;
  userId?: string;
}

// Store recent requests for debugging
const recentRequests: LogEntry[] = [];
const MAX_RECENT = 100;

/**
 * Request logger middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  
  // Capture request info
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip || req.headers['x-forwarded-for'] as string,
    userAgent: req.headers['user-agent'],
  };

  // Log response on finish
  res.on('finish', () => {
    entry.status = res.statusCode;
    entry.duration = Date.now() - startTime;
    entry.userId = (req as any).user?.userId;

    // Console log
    const statusColor = getStatusColor(res.statusCode);
    console.log(
      `[${entry.timestamp}] ${entry.method} ${entry.path} ${statusColor}${entry.status}\x1b[0m ${entry.duration}ms`
    );

    // Store in recent requests
    recentRequests.unshift(entry);
    if (recentRequests.length > MAX_RECENT) {
      recentRequests.pop();
    }
  });

  next();
}

/**
 * Get ANSI color for status code
 */
function getStatusColor(status: number): string {
  if (status >= 500) return '\x1b[31m'; // Red
  if (status >= 400) return '\x1b[33m'; // Yellow
  if (status >= 300) return '\x1b[36m'; // Cyan
  if (status >= 200) return '\x1b[32m'; // Green
  return '\x1b[0m'; // Default
}

/**
 * Get recent requests (for debugging)
 */
export function getRecentRequests(limit: number = 20): LogEntry[] {
  return recentRequests.slice(0, limit);
}

/**
 * Development-only detailed logger
 */
export function devLogger(req: Request, _res: Response, next: NextFunction): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('\n--- Request ---');
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Query:', req.query);
    console.log('Headers:', {
      'content-type': req.headers['content-type'],
      'authorization': req.headers.authorization ? '[REDACTED]' : undefined,
      'user-agent': req.headers['user-agent'],
    });
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Body:', JSON.stringify(req.body, null, 2).slice(0, 500));
    }
    console.log('---------------\n');
  }
  next();
}

/**
 * Simple rate limiter (in-memory, per-IP)
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // requests per window

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || 'unknown';
  const now = Date.now();

  let record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + RATE_LIMIT_WINDOW };
  }

  record.count++;
  rateLimitStore.set(ip, record);

  // Add headers
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX - record.count));
  res.setHeader('X-RateLimit-Reset', record.resetAt);

  if (record.count > RATE_LIMIT_MAX) {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((record.resetAt - now) / 1000),
    });
    return;
  }

  next();
}

// Cleanup old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(ip);
    }
  }
}, 60 * 1000);
