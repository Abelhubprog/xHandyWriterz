import { Router } from 'express';
import { z } from 'zod';
export const turnitinRouter = Router();
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
        // Notify admin via Mattermost webhook
        const mmWebhook = process.env.MATTERMOST_WEBHOOK_URL;
        if (mmWebhook) {
            const fileList = attachments?.map(a => `- ${a.filename} (${formatBytes(a.size)})`).join('\n') || 'No files';
            await fetch(mmWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: `📄 **Turnitin Submission Received**\n\n` +
                        `**Order ID:** ${orderId}\n` +
                        `**User Email:** ${email || 'Not provided'}\n` +
                        `**Files:**\n${fileList}\n` +
                        `**Time:** ${new Date().toISOString()}`,
                    username: 'Turnitin Bot',
                    icon_emoji: ':page_facing_up:',
                }),
            });
            console.log(`[Turnitin] Admin notified via Mattermost`);
        }
        // Send admin email notification
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
            await sendEmail({
                to: adminEmail,
                subject: `Turnitin Submission - Order ${orderId}`,
                html: `
          <h2>New Turnitin Submission</h2>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>User Email:</strong> ${email || 'Not provided'}</p>
          <p><strong>Files:</strong></p>
          <ul>
            ${attachments?.map(a => `<li>${a.filename} (${formatBytes(a.size)})</li>`).join('') || '<li>No files</li>'}
          </ul>
          <p><strong>Submitted:</strong> ${new Date().toISOString()}</p>
        `,
            });
            console.log(`[Turnitin] Admin notified via email`);
        }
        res.json({ ok: true, orderId });
    }
    catch (error) {
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
        // Send receipt email to user
        const sent = await sendEmail({
            to: email,
            subject: `Turnitin Submission Received - Order ${orderId}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Submission Received</h2>
          <p>Thank you for your Turnitin submission.</p>
          <p><strong>Order Reference:</strong> ${orderId}</p>
          <p>We have received your document and will process the plagiarism check shortly.</p>
          <p>You will receive the results via email within 24-48 hours.</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 12px;">
            This is an automated message from HandyWriterz. Please do not reply to this email.
          </p>
        </div>
      `,
        });
        if (sent) {
            console.log(`[Turnitin] Receipt sent to ${email}`);
        }
        res.json({ ok: true, orderId, emailSent: sent });
    }
    catch (error) {
        console.error('[Turnitin] Receipt error:', error);
        res.status(500).json({ error: 'Failed to send receipt' });
    }
});
/**
 * Helper: Format bytes to human-readable string
 */
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
/**
 * Helper: Send email via configured provider
 */
async function sendEmail(options) {
    const apiKey = process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || 'noreply@handywriterz.com';
    if (!apiKey) {
        console.log('[Email] No email service configured');
        return false;
    }
    try {
        // Try Resend first (preferred)
        if (process.env.RESEND_API_KEY) {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: fromEmail,
                    to: options.to,
                    subject: options.subject,
                    html: options.html,
                }),
            });
            if (!response.ok) {
                const error = await response.text();
                console.error('[Resend] Error:', error);
                return false;
            }
            return true;
        }
        // Fallback to SendGrid
        if (process.env.SENDGRID_API_KEY) {
            const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    personalizations: [{ to: [{ email: options.to }] }],
                    from: { email: fromEmail },
                    subject: options.subject,
                    content: [{ type: 'text/html', value: options.html }],
                }),
            });
            if (!response.ok) {
                const error = await response.text();
                console.error('[SendGrid] Error:', error);
                return false;
            }
            return true;
        }
        return false;
    }
    catch (error) {
        console.error('[Email] Send error:', error);
        return false;
    }
}
//# sourceMappingURL=turnitin.js.map