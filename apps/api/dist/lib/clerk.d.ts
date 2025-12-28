/**
 * Clerk token verification helper
 * Used across API routes to verify authenticated requests
 */
declare const clerk: import("@clerk/backend").ClerkClient;
export interface ClerkUser {
    userId: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    metadata?: Record<string, any>;
}
/**
 * Verify a Clerk JWT token and return user info
 */
export declare function verifyClerkToken(token: string): Promise<ClerkUser | null>;
/**
 * Check if user has admin or editor role
 */
export declare function isAdmin(user: ClerkUser | null): boolean;
/**
 * Extract token from Authorization header
 */
export declare function extractToken(authHeader: string | undefined): string | null;
/**
 * Express middleware for Clerk authentication
 */
export declare function requireAuth(req: any, res: any, next: () => void): Promise<void>;
/**
 * Express middleware for admin-only routes
 */
export declare function requireAdmin(req: any, res: any, next: () => void): Promise<void>;
export { clerk };
//# sourceMappingURL=clerk.d.ts.map