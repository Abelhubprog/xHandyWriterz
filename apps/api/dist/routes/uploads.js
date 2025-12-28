import { Router } from 'express';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';
import { verifyClerkToken } from '../lib/clerk.js';
export const uploadRouter = Router();
// R2/S3 Client
const s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});
const BUCKET = process.env.R2_BUCKET || 'handywriterz-uploads';
const PRESIGN_EXPIRES = 300; // 5 minutes
// Schemas
const presignPutSchema = z.object({
    key: z.string().min(1),
    contentType: z.string().min(1),
    contentLength: z.number().optional(),
});
const presignGetSchema = z.object({
    key: z.string().min(1),
});
const metadataSchema = z.object({
    key: z.string(),
    filename: z.string(),
    contentType: z.string(),
    size: z.number(),
    userId: z.string(),
    orderId: z.string().optional(),
    submissionId: z.string().optional(),
});
// In-memory store (replace with DB in production)
const uploadMetadata = new Map();
/**
 * POST /api/uploads/presign-put
 * Generate presigned URL for uploading to R2
 */
uploadRouter.post('/presign-put', async (req, res) => {
    try {
        // Verify authentication
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Missing authorization header' });
        }
        const user = await verifyClerkToken(authHeader.replace('Bearer ', ''));
        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        // Validate request body
        const parsed = presignPutSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
        }
        const { key, contentType, contentLength } = parsed.data;
        // Generate presigned URL
        const command = new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            ContentType: contentType,
            ...(contentLength && { ContentLength: contentLength }),
            Metadata: {
                'uploaded-by': user.userId,
                'uploaded-at': new Date().toISOString(),
            },
        });
        const url = await getSignedUrl(s3Client, command, { expiresIn: PRESIGN_EXPIRES });
        res.json({
            url,
            key,
            bucket: BUCKET,
            contentType,
            expiresIn: PRESIGN_EXPIRES,
        });
    }
    catch (error) {
        console.error('Presign PUT error:', error);
        res.status(500).json({ error: 'Failed to generate presigned URL' });
    }
});
/**
 * POST /api/uploads/presign-get
 * Generate presigned URL for downloading from R2
 */
uploadRouter.post('/presign-get', async (req, res) => {
    try {
        // Verify authentication
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Missing authorization header' });
        }
        const user = await verifyClerkToken(authHeader.replace('Bearer ', ''));
        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        // Validate request body
        const parsed = presignGetSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
        }
        const { key } = parsed.data;
        // Check AV status (placeholder - implement with actual AV service)
        const metadata = uploadMetadata.get(key);
        if (metadata) {
            // TODO: Check x-scan metadata for AV status
            // For now, allow all downloads
        }
        // Generate presigned URL
        const command = new GetObjectCommand({
            Bucket: BUCKET,
            Key: key,
        });
        const url = await getSignedUrl(s3Client, command, { expiresIn: PRESIGN_EXPIRES });
        res.json({
            url,
            key,
            expiresIn: PRESIGN_EXPIRES,
        });
    }
    catch (error) {
        console.error('Presign GET error:', error);
        res.status(500).json({ error: 'Failed to generate presigned URL' });
    }
});
/**
 * POST /api/uploads/metadata
 * Store upload metadata
 */
uploadRouter.post('/metadata', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Missing authorization header' });
        }
        const user = await verifyClerkToken(authHeader.replace('Bearer ', ''));
        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        const parsed = metadataSchema.safeParse({ ...req.body, userId: user.userId });
        if (!parsed.success) {
            return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
        }
        const data = parsed.data;
        uploadMetadata.set(data.key, data);
        // TODO: Persist to database
        // TODO: Trigger admin notification
        // TODO: Trigger Turnitin check if applicable
        console.log(`Upload metadata stored: ${data.key} by ${data.userId}`);
        res.json({ success: true, key: data.key });
    }
    catch (error) {
        console.error('Metadata storage error:', error);
        res.status(500).json({ error: 'Failed to store metadata' });
    }
});
/**
 * POST /api/uploads/notify
 * Notify admin of new upload (Turnitin flow)
 */
uploadRouter.post('/notify', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Missing authorization header' });
        }
        const user = await verifyClerkToken(authHeader.replace('Bearer ', ''));
        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        const { submissionId, files, email, sendReceipt } = req.body;
        // TODO: Send notification to admin (email, Mattermost, etc.)
        console.log(`Admin notification: Submission ${submissionId} with ${files?.length || 0} files`);
        // TODO: Send receipt to user if requested
        if (sendReceipt && email) {
            console.log(`Sending receipt to ${email}`);
        }
        res.json({
            success: true,
            message: 'Notification sent',
            submissionId,
        });
    }
    catch (error) {
        console.error('Notification error:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});
/**
 * GET /api/uploads/history
 * Get user's upload history
 */
uploadRouter.get('/history', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Missing authorization header' });
        }
        const user = await verifyClerkToken(authHeader.replace('Bearer ', ''));
        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        // Filter uploads by user
        const userUploads = Array.from(uploadMetadata.values())
            .filter(m => m.userId === user.userId)
            .sort((a, b) => new Date(b.key).getTime() - new Date(a.key).getTime());
        res.json({ uploads: userUploads });
    }
    catch (error) {
        console.error('History fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch upload history' });
    }
});
//# sourceMappingURL=uploads.js.map