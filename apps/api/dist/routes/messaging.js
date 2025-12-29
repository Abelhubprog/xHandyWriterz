import { Router } from 'express';
import { verifyClerkToken } from '../lib/clerk.js';
export const messagingRouter = Router();
const MATTERMOST_URL = process.env.MATTERMOST_URL || 'https://mattermost.handywriterz.com';
const SESSION_TTL_SECONDS = 24 * 60 * 60;
/**
 * POST /api/messaging/auth/exchange
 * Exchange Clerk token for Mattermost session
 */
messagingRouter.post('/auth/exchange', async (req, res) => {
    try {
        const token = typeof req.body?.token === 'string'
            ? req.body.token
            : req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Missing Clerk token' });
        }
        const clerkUser = await verifyClerkToken(token);
        if (!clerkUser) {
            return res.status(401).json({ error: 'Invalid Clerk token' });
        }
        // Check if Mattermost is configured
        const mmAdminToken = process.env.MATTERMOST_ADMIN_TOKEN;
        if (!mmAdminToken) {
            return res.status(503).json({
                error: 'Mattermost not configured',
                fallback: true,
                message: 'Messaging service is currently unavailable'
            });
        }
        // Find or create Mattermost user
        const mmUser = await findOrCreateMMUser(clerkUser, mmAdminToken);
        if (!mmUser) {
            return res.status(500).json({ error: 'Failed to provision Mattermost user' });
        }
        // Generate Mattermost session token
        const mmSession = await createMMSession(mmUser.id, mmAdminToken);
        if (!mmSession) {
            return res.status(500).json({ error: 'Failed to create Mattermost session' });
        }
        res.json({
            ok: true,
            token: mmSession.token,
            expiresAt: mmSession.expiresAt,
            user: {
                id: mmUser.id,
                email: mmUser.email,
                username: mmUser.username,
                first_name: mmUser.first_name || clerkUser.firstName || '',
                last_name: mmUser.last_name || clerkUser.lastName || '',
            },
        });
    }
    catch (error) {
        console.error('MM auth exchange error:', error);
        res.status(500).json({ error: 'Authentication exchange failed' });
    }
});
/**
 * POST /api/messaging/auth/refresh
 * Validate Mattermost session token
 */
messagingRouter.post('/auth/refresh', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Missing authorization header' });
        }
        const token = authHeader.replace('Bearer ', '');
        const response = await fetch(`${MATTERMOST_URL}/api/v4/users/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            return res.status(401).json({ error: 'Invalid Mattermost token' });
        }
        const profile = await response.json();
        return res.json({
            ok: true,
            expiresAt: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
            user: {
                id: profile.id,
                email: profile.email,
                username: profile.username,
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
            },
        });
    }
    catch (error) {
        console.error('MM auth refresh error:', error);
        res.status(500).json({ error: 'Authentication refresh failed' });
    }
});
/**
 * POST /api/messaging/auth/logout
 * Clear Mattermost session token client-side
 */
messagingRouter.post('/auth/logout', async (_req, res) => {
    res.json({ ok: true });
});
/**
 * GET /api/messaging/status
 * Check messaging service status
 */
messagingRouter.get('/status', async (_req, res) => {
    try {
        const mmUrl = process.env.MATTERMOST_URL;
        const mmToken = process.env.MATTERMOST_ADMIN_TOKEN;
        if (!mmUrl || !mmToken) {
            return res.json({
                available: false,
                status: 'not_configured',
                message: 'Mattermost is not configured',
            });
        }
        // Ping Mattermost
        try {
            const response = await fetch(`${mmUrl}/api/v4/system/ping`, {
                headers: { Authorization: `Bearer ${mmToken}` },
            });
            if (response.ok) {
                return res.json({
                    available: true,
                    status: 'online',
                    url: mmUrl,
                });
            }
        }
        catch {
            // Mattermost not reachable
        }
        res.json({
            available: false,
            status: 'offline',
            message: 'Mattermost service is not responding',
        });
    }
    catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({ error: 'Status check failed' });
    }
});
/**
 * POST /api/messaging/notify
 * Send notification to admin channel
 */
messagingRouter.post('/notify', async (req, res) => {
    try {
        const { channel, message, attachments } = req.body;
        const mmToken = process.env.MATTERMOST_BOT_TOKEN || process.env.MATTERMOST_ADMIN_TOKEN;
        const mmUrl = process.env.MATTERMOST_URL;
        if (!mmToken || !mmUrl) {
            console.log('MM notification (not configured):', message);
            return res.json({ sent: false, reason: 'not_configured' });
        }
        const channelId = channel || process.env.MATTERMOST_ADMIN_CHANNEL;
        if (!channelId) {
            return res.json({ sent: false, reason: 'no_channel' });
        }
        // Post message to Mattermost
        const response = await fetch(`${mmUrl}/api/v4/posts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${mmToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                channel_id: channelId,
                message,
                props: attachments ? { attachments } : undefined,
            }),
        });
        if (response.ok) {
            const post = await response.json();
            return res.json({ sent: true, postId: post.id });
        }
        const error = await response.text();
        console.error('MM post error:', error);
        res.json({ sent: false, reason: 'api_error' });
    }
    catch (error) {
        console.error('Notification error:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});
async function findOrCreateMMUser(clerkUser, adminToken) {
    const mmUrl = MATTERMOST_URL;
    try {
        // Try to find existing user by email
        const email = clerkUser.email || `${clerkUser.userId}@handywriterz.com`;
        const searchResponse = await fetch(`${mmUrl}/api/v4/users/email/${encodeURIComponent(email)}`, { headers: { Authorization: `Bearer ${adminToken}` } });
        if (searchResponse.ok) {
            return await searchResponse.json();
        }
        // Create new user
        const username = `user_${clerkUser.userId.slice(0, 8)}`;
        const createResponse = await fetch(`${mmUrl}/api/v4/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                username,
                first_name: clerkUser.firstName || 'User',
                last_name: clerkUser.lastName || '',
                auth_service: 'clerk',
                auth_data: clerkUser.userId,
            }),
        });
        if (createResponse.ok) {
            return await createResponse.json();
        }
        console.error('Failed to create MM user:', await createResponse.text());
        return null;
    }
    catch (error) {
        console.error('MM user lookup error:', error);
        return null;
    }
}
async function createMMSession(userId, adminToken) {
    const mmUrl = MATTERMOST_URL;
    try {
        // Create personal access token for user
        const response = await fetch(`${mmUrl}/api/v4/users/${userId}/tokens`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                description: `Session token - ${new Date().toISOString()}`,
            }),
        });
        if (response.ok) {
            const token = await response.json();
            return {
                token: token.token,
                expiresAt: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
            };
        }
        console.error('Failed to create MM session:', await response.text());
        return null;
    }
    catch (error) {
        console.error('MM session creation error:', error);
        return null;
    }
}
//# sourceMappingURL=messaging.js.map