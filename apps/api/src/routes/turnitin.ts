import { Router, IRouter } from 'express';
import { z } from 'zod';

export const turnitinRouter: IRouter = Router();

const notifySchema = z.object({
  orderId: z.string(),
  email: z.string().optional(),
  attachments: z.array(z.object({
    r2Key: z.string(),
    filename: z.string(),
    size: z.number(),
    contentType: z.string(),
  })).optional(),
});

const receiptSchema = z.object({
  orderId: z.string(),
  email: z.string().email(),
});

/**
 * POST /api/turnitin/notify
 * Notify admin about a Turnitin submission
 */
turnitinRouter.post('/notify', async (req, res) => {
  try {
    const parsed = notifySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
    }

    const { orderId, email, attachments } = parsed.data;

    console.log(`[Turnitin] Notify received: ${orderId} (${attachments?.length || 0} files)`);

    // TODO: Notify admin via email or Mattermost webhook
    if (email) {
      console.log(`[Turnitin] User email provided: ${email}`);
    }

    res.json({ ok: true, orderId });
  } catch (error) {
    console.error('[Turnitin] Notify error:', error);
    res.status(500).json({ error: 'Failed to notify' });
  }
});

/**
 * POST /api/turnitin/receipt
 * Send receipt notification to the user
 */
turnitinRouter.post('/receipt', async (req, res) => {
  try {
    const parsed = receiptSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
    }

    const { orderId, email } = parsed.data;

    console.log(`[Turnitin] Receipt requested: ${orderId} -> ${email}`);

    // TODO: Send receipt email
    res.json({ ok: true, orderId });
  } catch (error) {
    console.error('[Turnitin] Receipt error:', error);
    res.status(500).json({ error: 'Failed to send receipt' });
  }
});
