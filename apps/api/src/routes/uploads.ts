import { Router, IRouter, Request, Response } from 'express';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
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

// Helper: Send admin notification for new uploads
async function notifyAdminNewUpload(data: z.infer<typeof metadataSchema>) {
  const mmWebhookUrl = process.env.MATTERMOST_WEBHOOK_URL;
  
  // Mattermost notification
  if (mmWebhookUrl) {
    try {
      await fetch(mmWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `📁 **New File Uploaded**\n` +
                `- File: \`${data.filename}\`\n` +
                `- Size: ${formatBytes(data.size)}\n` +
                `- Type: ${data.contentType}\n` +
                `- User: ${data.userId}\n` +
                (data.orderId ? `- Order: ${data.orderId}\n` : '') +
                (data.submissionId ? `- Submission: ${data.submissionId}\n` : '') +
                `- Time: ${data.uploadedAt || new Date().toISOString()}`,
        }),
      });
    } catch (error) {
      console.error('[Notification] Failed to send Mattermost notification:', error);
    }
  }

  // Email notification (optional)
  const adminEmail = process.env.ADMIN_EMAIL;
  const resendKey = process.env.RESEND_API_KEY;
  const sendgridKey = process.env.SENDGRID_API_KEY;
  
  if (adminEmail && (resendKey || sendgridKey)) {
    try {
      await sendAdminEmail(adminEmail, data, resendKey || undefined, sendgridKey || undefined);
    } catch (error) {
      console.error('[Notification] Failed to send admin email:', error);
    }
  }
}

async function sendAdminEmail(
  adminEmail: string, 
  data: z.infer<typeof metadataSchema>,
  resendKey?: string,
  sendgridKey?: string
) {
  const subject = `[HandyWriterz] New Upload: ${data.filename}`;
  const htmlContent = `
    <h2>New File Upload</h2>
    <table>
      <tr><td><strong>Filename:</strong></td><td>${data.filename}</td></tr>
      <tr><td><strong>Size:</strong></td><td>${formatBytes(data.size)}</td></tr>
      <tr><td><strong>Type:</strong></td><td>${data.contentType}</td></tr>
      <tr><td><strong>User ID:</strong></td><td>${data.userId}</td></tr>
      ${data.orderId ? `<tr><td><strong>Order:</strong></td><td>${data.orderId}</td></tr>` : ''}
      ${data.submissionId ? `<tr><td><strong>Submission:</strong></td><td>${data.submissionId}</td></tr>` : ''}
      <tr><td><strong>Time:</strong></td><td>${data.uploadedAt || new Date().toISOString()}</td></tr>
    </table>
  `;
  
  if (resendKey) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'noreply@handywriterz.com',
        to: adminEmail,
        subject,
        html: htmlContent,
      }),
    });
  } else if (sendgridKey) {
    await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: adminEmail }] }],
        from: { email: process.env.EMAIL_FROM || 'noreply@handywriterz.com' },
        subject,
        content: [{ type: 'text/html', value: htmlContent }],
      }),
    });
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

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

const deleteSchema = z.object({
  key: z.string().min(1),
});

const listSchema = z.object({
  prefix: z.string().optional(),
  delimiter: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((value) => (value ? Number.parseInt(value, 10) : undefined)),
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const url = await getSignedUrl(s3Client as any, command as any, { expiresIn: PRESIGN_EXPIRES });

  return {
    url,
    key,
    bucket: BUCKET,
    contentType,
    expiresIn: PRESIGN_EXPIRES,
  };
}

async function resolveUserFromReq(req: Request, allowAnon: boolean) {
  const headers: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    headers[key] = Array.isArray(value) ? value[0] : value;
  }
  return resolveUser({ headers }, allowAnon);
}

async function handlePresignGet(req: Request, res: Response) {
  try {
    const user = await resolveUserFromReq(req, ALLOW_ANON_DOWNLOADS);
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const url = await getSignedUrl(s3Client as any, command as any, { expiresIn: PRESIGN_EXPIRES });

    res.json({
      url,
      key,
      expiresIn: PRESIGN_EXPIRES,
    });
  } catch (error) {
    console.error('Presign GET error:', error);
    res.status(500).json({ error: 'Failed to generate presigned URL' });
  }
}

/**
 * POST /api/uploads/presign-put
 * Generate presigned URL for uploading to R2
 */
uploadRouter.post('/presign-put', async (req, res) => {
  try {
    const user = await resolveUserFromReq(req, ALLOW_ANON_UPLOADS);
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
uploadRouter.post('/presign-get', handlePresignGet);
uploadRouter.post('/presign', handlePresignGet);

/**
 * POST /api/uploads/delete
 * Delete an object from R2
 */
uploadRouter.post('/delete', async (req, res) => {
  try {
    const user = await resolveUserFromReq(req, ALLOW_ANON_UPLOADS);
    if (!user) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const parsed = deleteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
    }

    await s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: parsed.data.key,
    }));

    res.json({ deleted: true, key: parsed.data.key });
  } catch (error) {
    console.error('Delete object error:', error);
    res.status(500).json({ error: 'Failed to delete object' });
  }
});

/**
 * GET /api/r2/list
 * List objects in R2 for compatibility with legacy UI
 */
uploadCompatRouter.get('/r2/list', async (req, res) => {
  try {
    const user = await resolveUserFromReq(req, ALLOW_ANON_DOWNLOADS);
    if (!user) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const parsed = listSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid query', details: parsed.error.issues });
    }

    const limit = parsed.data.limit && Number.isFinite(parsed.data.limit) ? Math.min(parsed.data.limit, 1000) : 100;

    const result = await s3Client.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: parsed.data.prefix || undefined,
      Delimiter: parsed.data.delimiter || undefined,
      MaxKeys: limit,
    }));

    const files = (result.Contents || []).map((item) => ({
      key: item.Key || '',
      size: item.Size ?? 0,
      lastModified: item.LastModified ? item.LastModified.toISOString() : new Date().toISOString(),
    }));

    const prefixes = (result.CommonPrefixes || [])
      .map((prefix) => prefix.Prefix)
      .filter(Boolean);

    res.json({ files, prefixes });
  } catch (error) {
    console.error('List objects error:', error);
    res.status(500).json({ error: 'Failed to list objects' });
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

    const user = await resolveUserFromReq(req, ALLOW_ANON_UPLOADS);
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
    const user = await resolveUserFromReq(req, ALLOW_ANON_UPLOADS);
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

    // Trigger admin notification
    await notifyAdminNewUpload(data);

    // Note: Turnitin checks are handled by the separate turnitin route
    // based on submission metadata

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
    const user = await resolveUserFromReq(req, ALLOW_ANON_UPLOADS);
    if (!user) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const { submissionId, files, email, sendReceipt, orderId } = req.body;

    // Send admin notification via Mattermost
    const mmWebhookUrl = process.env.MATTERMOST_WEBHOOK_URL;
    if (mmWebhookUrl) {
      const fileList = files?.map((f: any) => `- ${f.filename} (${formatBytes(f.size || 0)})`).join('\n') || 'No files listed';
      
      try {
        await fetch(mmWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `📤 **New Submission Uploaded**\n` +
                  `- Submission ID: \`${submissionId}\`\n` +
                  (orderId ? `- Order ID: \`${orderId}\`\n` : '') +
                  `- User: ${user.userId}\n` +
                  `- Email: ${email || 'Not provided'}\n` +
                  `- Files (${files?.length || 0}):\n${fileList}\n` +
                  `- Time: ${new Date().toISOString()}`,
          }),
        });
        console.log(`[Notification] Admin notified of submission ${submissionId}`);
      } catch (error) {
        console.error('[Notification] Failed to notify admin:', error);
      }
    }

    // Send receipt to user if requested
    if (sendReceipt && email) {
      const resendKey = process.env.RESEND_API_KEY;
      const sendgridKey = process.env.SENDGRID_API_KEY;
      
      if (resendKey || sendgridKey) {
        const fileList = files?.map((f: any) => `<li>${f.filename} (${formatBytes(f.size || 0)})</li>`).join('') || '';
        const htmlContent = `
          <h2>Submission Receipt</h2>
          <p>Your files have been successfully uploaded.</p>
          <p><strong>Submission ID:</strong> ${submissionId}</p>
          ${orderId ? `<p><strong>Order ID:</strong> ${orderId}</p>` : ''}
          <h3>Files Uploaded:</h3>
          <ul>${fileList}</ul>
          <p>You will receive another notification when your files have been processed.</p>
          <p>Thank you for using HandyWriterz!</p>
        `;
        
        try {
          if (resendKey) {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: process.env.EMAIL_FROM || 'noreply@handywriterz.com',
                to: email,
                subject: `[HandyWriterz] Submission Receipt - ${submissionId}`,
                html: htmlContent,
              }),
            });
          } else if (sendgridKey) {
            await fetch('https://api.sendgrid.com/v3/mail/send', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${sendgridKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                personalizations: [{ to: [{ email }] }],
                from: { email: process.env.EMAIL_FROM || 'noreply@handywriterz.com' },
                subject: `[HandyWriterz] Submission Receipt - ${submissionId}`,
                content: [{ type: 'text/html', value: htmlContent }],
              }),
            });
          }
          console.log(`[Notification] Receipt sent to ${email}`);
        } catch (error) {
          console.error('[Notification] Failed to send receipt:', error);
        }
      }
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

    const user = await resolveUserFromReq(req, ALLOW_ANON_UPLOADS);
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
