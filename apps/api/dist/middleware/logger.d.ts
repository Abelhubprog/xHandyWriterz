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
/**
 * Request logger middleware
 */
export declare function requestLogger(req: Request, res: Response, next: NextFunction): void;
/**
 * Get recent requests (for debugging)
 */
export declare function getRecentRequests(limit?: number): LogEntry[];
/**
 * Development-only detailed logger
 */
export declare function devLogger(req: Request, _res: Response, next: NextFunction): void;
export declare function rateLimiter(req: Request, res: Response, next: NextFunction): void;
export {};
//# sourceMappingURL=logger.d.ts.map