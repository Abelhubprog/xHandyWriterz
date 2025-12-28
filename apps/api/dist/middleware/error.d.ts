/**
 * Error handling middleware for Express API
 */
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
export interface ApiError extends Error {
    statusCode?: number;
    code?: string;
    details?: any;
}
/**
 * Create an API error with status code
 */
export declare function createError(message: string, statusCode?: number, code?: string): ApiError;
/**
 * Common error creators
 */
export declare const errors: {
    badRequest: (message?: string) => ApiError;
    unauthorized: (message?: string) => ApiError;
    forbidden: (message?: string) => ApiError;
    notFound: (message?: string) => ApiError;
    conflict: (message?: string) => ApiError;
    tooManyRequests: (message?: string) => ApiError;
    internal: (message?: string) => ApiError;
    serviceUnavailable: (message?: string) => ApiError;
};
/**
 * Express error handler middleware
 */
export declare function errorHandler(error: Error | ApiError | ZodError, _req: Request, res: Response, _next: NextFunction): void;
/**
 * Async route handler wrapper
 * Catches async errors and passes them to error handler
 */
export declare function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Not found handler
 */
export declare function notFoundHandler(req: Request, res: Response): void;
//# sourceMappingURL=error.d.ts.map