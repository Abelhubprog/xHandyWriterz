/**
 * Error handling middleware for Express API
 */
import { ZodError } from 'zod';
/**
 * Create an API error with status code
 */
export function createError(message, statusCode = 500, code) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    return error;
}
/**
 * Common error creators
 */
export const errors = {
    badRequest: (message = 'Bad request') => createError(message, 400, 'BAD_REQUEST'),
    unauthorized: (message = 'Unauthorized') => createError(message, 401, 'UNAUTHORIZED'),
    forbidden: (message = 'Forbidden') => createError(message, 403, 'FORBIDDEN'),
    notFound: (message = 'Not found') => createError(message, 404, 'NOT_FOUND'),
    conflict: (message = 'Conflict') => createError(message, 409, 'CONFLICT'),
    tooManyRequests: (message = 'Too many requests') => createError(message, 429, 'TOO_MANY_REQUESTS'),
    internal: (message = 'Internal server error') => createError(message, 500, 'INTERNAL_ERROR'),
    serviceUnavailable: (message = 'Service unavailable') => createError(message, 503, 'SERVICE_UNAVAILABLE'),
};
/**
 * Express error handler middleware
 */
export function errorHandler(error, _req, res, _next) {
    // Log error
    console.error('[Error]', {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
    // Handle Zod validation errors
    if (error instanceof ZodError) {
        res.status(400).json({
            error: 'Validation error',
            code: 'VALIDATION_ERROR',
            details: error.errors.map(e => ({
                path: e.path.join('.'),
                message: e.message,
            })),
        });
        return;
    }
    // Handle API errors
    const apiError = error;
    const statusCode = apiError.statusCode || 500;
    const code = apiError.code || 'INTERNAL_ERROR';
    res.status(statusCode).json({
        error: error.message || 'Internal server error',
        code,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
}
/**
 * Async route handler wrapper
 * Catches async errors and passes them to error handler
 */
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
/**
 * Not found handler
 */
export function notFoundHandler(req, res) {
    res.status(404).json({
        error: 'Not found',
        code: 'NOT_FOUND',
        path: req.path,
        method: req.method,
    });
}
//# sourceMappingURL=error.js.map