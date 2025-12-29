/**
 * Clerk token verification helper
 * Used across API routes to verify authenticated requests
 */
import { createClerkClient, verifyToken } from '@clerk/backend';
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || '';
const CLERK_PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY ||
    process.env.VITE_CLERK_PUBLISHABLE_KEY ||
    '';
// Initialize Clerk client
const clerk = createClerkClient({
    secretKey: CLERK_SECRET_KEY,
    publishableKey: CLERK_PUBLISHABLE_KEY,
});
/**
 * Verify a Clerk JWT token and return user info
 */
export async function verifyClerkToken(token) {
    if (!token || !CLERK_SECRET_KEY) {
        console.warn('[Clerk] Missing token or secret key');
        return null;
    }
    try {
        // Verify the JWT
        const payload = await verifyToken(token, {
            secretKey: CLERK_SECRET_KEY,
        });
        if (!payload?.sub) {
            console.warn('[Clerk] Invalid token payload');
            return null;
        }
        // Fetch full user details
        const user = await clerk.users.getUser(payload.sub);
        return {
            userId: user.id,
            email: user.emailAddresses?.[0]?.emailAddress,
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
            role: user.publicMetadata?.role || 'user',
            metadata: user.publicMetadata,
        };
    }
    catch (error) {
        console.error('[Clerk] Token verification failed:', error);
        return null;
    }
}
/**
 * Check if user has admin or editor role
 */
export function isAdmin(user) {
    if (!user)
        return false;
    return user.role === 'admin' || user.role === 'editor';
}
/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader) {
    if (!authHeader)
        return null;
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }
    return authHeader;
}
/**
 * Express middleware for Clerk authentication
 */
export async function requireAuth(req, res, next) {
    const token = extractToken(req.headers.authorization);
    if (!token) {
        res.status(401).json({ error: 'Missing authorization header' });
        return;
    }
    const user = await verifyClerkToken(token);
    if (!user) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
    }
    // Attach user to request
    req.user = user;
    next();
}
/**
 * Express middleware for admin-only routes
 */
export async function requireAdmin(req, res, next) {
    const token = extractToken(req.headers.authorization);
    if (!token) {
        res.status(401).json({ error: 'Missing authorization header' });
        return;
    }
    const user = await verifyClerkToken(token);
    if (!user) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
    }
    if (!isAdmin(user)) {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    req.user = user;
    next();
}
export { clerk };
//# sourceMappingURL=clerk.js.map