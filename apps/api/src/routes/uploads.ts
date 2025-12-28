import { Router, IRouter } from 'express';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';
import { verifyClerkToken } from '../lib/clerk.js';

export const uploadRouter: IRouter = Router();
export const uploadCompatRouter: IRouter = Router();

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
const ALLOW_ANON_UPLOADS = process.env.ALLOW_ANON_UPLOADS === 'true';
const ALLOW_ANON_DOWNLOADS = process.env.ALLOW_ANON_DOWNLOADS === 'true' || ALLOW_ANON_UPLOADS;

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
  uploadedAt: z.string().optional(),
});

// In-memory store (replace with DB in production)
const uploadMetadata: Map<string, z.infer<typeof metadataSchema>> = new Map();

const submissionSchema = z.object({
  attachments: z.array(z.object({
    r2Key: z.string(),
    filename: z.string(),
    size: z.number(),
    contentType: z.string(),
  })).min(1),
  metadata: z.record(z.unknown()).optional(),
});

const uploadUrlSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().optional(),
});

type ResolvedUser = { userId: string } | null;

async function resolveUser(req: { headers: Record<string, string | undefined> }, allowAnonymous: boolean): Promise<ResolvedUser> {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const user = await verifyClerkToken(authHeader.replace('Bearer ', ''));
    if (user) {
      return { userId: user.userId };
    }
  }

  if (allowAnonymous) {
    return { userId: 'anonymous' };
  }

  return null;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

async function buildPresignedPut(key: string, contentType: string, userId: string, contentLength?: number) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    ...(contentLength && { ContentLength: contentLength }),
    Metadata: {
      'uploaded-by': userId,
      'uploaded-at': new Date().toISOString(),
    },
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: PRESIGN_EXPIRES });

  return {
    url,
    key,
    bucket: BUCKET,
    contentType,
    expiresIn: PRESIGN_EXPIRES,
  };
}

/**
 * POST /api/uploads/presign-put
 * Generate presigned URL for uploading to R2
 */
uploadRouter.post('/presign-put', async (req, res) => {
  try {
    const user = await resolveUser(req, ALLOW_ANON_UPLOADS);
    if (!user) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    // Validate request body
    const parsed = presignPutSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
    }

    const { key, contentType, contentLength } = parsed.data;

    const payload = await buildPresignedPut(key, contentType, user.userId, contentLength);
    res.json(payload);
  } catch (error) {
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
    const user = await resolveUser(req, ALLOW_ANON_DOWNLOADS);
    if (!user) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
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

    const url = await getSignedUrl(s3Client as any, command, { expiresIn: PRESIGN_EXPIRES });

    res.json({
      url,
      key,
      expiresIn: PRESIGN_EXPIRES,
    });
  } catch (error) {
    console.error('Presign GET error:', error);
    res.status(500).json({ error: 'Failed to generate presigned URL' });
  }
});

/**
 * POST /api/uploads
 * Store upload metadata from submission flow
 */
uploadRouter.post('/', async (req, res) => {
  try {
    const parsed = submissionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
    }

    const user = await resolveUser(req, ALLOW_ANON_UPLOADS);
    if (!user) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const { attachments, metadata } = parsed.data;
    const metadataRecord = metadata ?? {};
    const uploadId =
      typeof metadataRecord.submissionId === 'string' ? metadataRecord.submissionId :
      typeof metadataRecord.orderId === 'string' ? metadataRecord.orderId :
      `upload_${Date.now()}`;

    const uploadedAt = new Date().toISOString();
    attachments.forEach((attachment) => {
      uploadMetadata.set(attachment.r2Key, {
        key: attachment.r2Key,
        filename: attachment.filename,
        contentType: attachment.contentType,
        size: attachment.size,
        userId: user.userId,
        submissionId: uploadId,
        uploadedAt,
      });
    });

    res.json({ uploadId });
  } catch (error) {
    console.error('Upload metadata error:', error);
    res.status(500).json({ error: 'Failed to store metadata' });
  }
});

/**
 * POST /api/uploads/metadata
 * Store upload metadata
 */
uploadRouter.post('/metadata', async (req, res) => {
  try {
    const user = await resolveUser(req, ALLOW_ANON_UPLOADS);
    if (!user) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const parsed = metadataSchema.safeParse({ ...req.body, userId: user.userId });
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
    }

    const data = parsed.data;
    uploadMetadata.set(data.key, {
      ...data,
      uploadedAt: data.uploadedAt || new Date().toISOString(),
    });

    // TODO: Persist to database
    // TODO: Trigger admin notification
    // TODO: Trigger Turnitin check if applicable

    console.log(`Upload metadata stored: ${data.key} by ${data.userId}`);

    res.json({ success: true, key: data.key });
  } catch (error) {
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
    const user = await resolveUser(req, ALLOW_ANON_UPLOADS);
    if (!user) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
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
  } catch (error) {
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
      .sort((a, b) => new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime());

    res.json({ uploads: userUploads });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch upload history' });
  }
});

/**
 * POST /api/upload-url
 * Compatibility endpoint for UploadDropzone
 */
uploadCompatRouter.post('/upload-url', async (req, res) => {
  try {
    const parsed = uploadUrlSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
    }

    const user = await resolveUser(req, ALLOW_ANON_UPLOADS);
    if (!user) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const { filename, contentType, size } = parsed.data;
    const safeName = sanitizeFileName(filename);
    const key = `uploads/${Date.now()}-${safeName}`;

    const payload = await buildPresignedPut(key, contentType, user.userId, size);
    res.json({ uploadUrl: payload.url, key: payload.key, bucket: payload.bucket });
  } catch (error) {
    console.error('Upload URL error:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});
