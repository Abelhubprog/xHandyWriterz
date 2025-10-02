/**
 * Email Service using Resend API
 * Handles all email notifications for Turnitin submissions and payments
 */

interface EmailConfig {
  from: string;
  adminEmail: string;
  resendApiKey: string;
}

interface TurnitinSubmissionEmail {
  userEmail: string;
  orderId: string;
  files: Array<{ filename: string; size: number }>;
  notes?: string;
  amount: number;
  currency: string;
}

interface PaymentConfirmationEmail {
  userEmail: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId?: string;
  serviceType: string;
}

interface AdminReportNotification {
  userEmail: string;
  orderId: string;
  reportUrls: string[];
}

class EmailService {
  private config: EmailConfig;

  constructor() {
    // Admin email is permanently configured here (not visible to public)
    this.config = {
      from: 'HandyWriterz <noreply@handywriterz.com>',
      adminEmail: 'admin@handywriterz.com', // ✅ Permanently configured admin email
      resendApiKey: import.meta.env.VITE_RESEND_API_KEY || '',
    };
  }

  /**
   * Send email via Resend API
   */
  private async sendEmail(to: string | string[], subject: string, html: string, replyTo?: string) {
    if (!this.config.resendApiKey) {
      console.warn('[EmailService] Resend API key not configured. Logging email instead.');
      console.log({ to, subject, html: html.substring(0, 200) + '...' });
      return { success: true, messageId: 'local-dev-no-api-key' };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.resendApiKey}`,
        },
        body: JSON.stringify({
          from: this.config.from,
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
          ...(replyTo && { reply_to: replyTo }),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Resend API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      return { success: true, messageId: data.id };
    } catch (error: any) {
      console.error('[EmailService] Failed to send email:', error);
      throw new Error(error.message || 'Failed to send email');
    }
  }

  /**
   * Notify admin about new Turnitin submission
   */
  async notifyAdminTurnitinSubmission(data: TurnitinSubmissionEmail): Promise<void> {
    const filesList = data.files
      .map((f, i) => `${i + 1}. ${f.filename} (${(f.size / 1024).toFixed(2)} KB)`)
      .join('\n');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
            .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
            .label { font-weight: bold; color: #4F46E5; }
            .files-list { background: white; padding: 15px; border-radius: 4px; white-space: pre-line; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">🎓 New Turnitin Submission</h2>
            </div>
            <div class="content">
              <div class="info-row">
                <span class="label">Order ID:</span> ${data.orderId}
              </div>
              <div class="info-row">
                <span class="label">User Email:</span> ${data.userEmail}
              </div>
              <div class="info-row">
                <span class="label">Amount:</span> ${data.currency} ${data.amount.toFixed(2)}
              </div>
              ${data.notes ? `
              <div class="info-row">
                <span class="label">Notes:</span><br/>
                ${data.notes}
              </div>
              ` : ''}
              <div class="info-row">
                <span class="label">Uploaded Files (${data.files.length}):</span>
                <div class="files-list">${filesList}</div>
              </div>
            </div>
            <div class="footer">
              <p>Please process this submission and upload the reports via the Admin Dashboard.</p>
              <p><strong>HandyWriterz Admin System</strong></p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail(
      this.config.adminEmail,
      `Turnitin Check - Order ${data.orderId}`,
      html,
      data.userEmail
    );
  }

  /**
   * Send submission confirmation to user
   */
  async sendUserSubmissionConfirmation(data: TurnitinSubmissionEmail): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
            .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
            .info-box { background: white; padding: 15px; border-radius: 4px; margin: 10px 0; }
            .highlight { color: #4F46E5; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">✅ Submission Received</h2>
            </div>
            <div class="content">
              <div class="success-icon">📄</div>
              <p>Thank you for submitting your document for Turnitin plagiarism check!</p>
              <div class="info-box">
                <p><strong>Order ID:</strong> <span class="highlight">${data.orderId}</span></p>
                <p><strong>Files Uploaded:</strong> ${data.files.length}</p>
                <p><strong>Status:</strong> Awaiting payment</p>
              </div>
              <p>Your documents have been received and will be processed once payment is confirmed.</p>
              <p><strong>What happens next?</strong></p>
              <ul>
                <li>Complete your payment to begin processing</li>
                <li>You'll receive a payment confirmation email</li>
                <li>Our team will run the plagiarism check</li>
                <li>You'll receive 2 PDF reports within 24-48 hours</li>
              </ul>
            </div>
            <div class="footer">
              <p>Questions? Contact us at ${this.config.adminEmail}</p>
              <p><strong>HandyWriterz</strong> - Academic Excellence Delivered</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail(
      data.userEmail,
      `Document Submission Confirmed - Order ${data.orderId}`,
      html
    );
  }

  /**
   * Send payment confirmation to user
   */
  async sendUserPaymentConfirmation(data: PaymentConfirmationEmail): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
            .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
            .receipt { background: white; padding: 20px; border-radius: 4px; border: 2px solid #10b981; }
            .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .receipt-total { font-size: 18px; font-weight: bold; color: #4F46E5; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">💳 Payment Successful</h2>
            </div>
            <div class="content">
              <div class="success-icon">✅</div>
              <p>Your payment has been received and confirmed!</p>
              <div class="receipt">
                <h3 style="margin-top: 0;">Payment Receipt</h3>
                <div class="receipt-row">
                  <span>Order ID:</span>
                  <span><strong>${data.orderId}</strong></span>
                </div>
                <div class="receipt-row">
                  <span>Service:</span>
                  <span>${data.serviceType}</span>
                </div>
                <div class="receipt-row">
                  <span>Payment Method:</span>
                  <span>${data.paymentMethod}</span>
                </div>
                ${data.transactionId ? `
                <div class="receipt-row">
                  <span>Transaction ID:</span>
                  <span><small>${data.transactionId}</small></span>
                </div>
                ` : ''}
                <div class="receipt-row" style="border-bottom: none;">
                  <span>Amount Paid:</span>
                  <span class="receipt-total">${data.currency} ${data.amount.toFixed(2)}</span>
                </div>
              </div>
              <p style="margin-top: 20px;"><strong>What's next?</strong></p>
              <ul>
                <li>Our team is now processing your documents</li>
                <li>Turnitin plagiarism check in progress</li>
                <li>You'll receive 2 detailed PDF reports</li>
                <li>Expected delivery: 24-48 hours</li>
              </ul>
              <p>You will receive another email when your reports are ready!</p>
            </div>
            <div class="footer">
              <p>Questions? Contact us at ${this.config.adminEmail}</p>
              <p><strong>HandyWriterz</strong> - Academic Excellence Delivered</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail(
      data.userEmail,
      `Payment Confirmed - Order ${data.orderId}`,
      html
    );
  }

  /**
   * Notify admin about payment
   */
  async notifyAdminPaymentReceived(data: PaymentConfirmationEmail): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
            .label { font-weight: bold; color: #10b981; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">💰 Payment Received</h2>
            </div>
            <div class="content">
              <div class="info-row">
                <span class="label">Order ID:</span> ${data.orderId}
              </div>
              <div class="info-row">
                <span class="label">Customer:</span> ${data.userEmail}
              </div>
              <div class="info-row">
                <span class="label">Amount:</span> ${data.currency} ${data.amount.toFixed(2)}
              </div>
              <div class="info-row">
                <span class="label">Method:</span> ${data.paymentMethod}
              </div>
              ${data.transactionId ? `
              <div class="info-row">
                <span class="label">Transaction:</span> ${data.transactionId}
              </div>
              ` : ''}
              <p style="margin-top: 20px;"><strong>Action required:</strong> Process the Turnitin check and upload reports.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail(
      this.config.adminEmail,
      `Payment Received - Order ${data.orderId}`,
      html
    );
  }

  /**
   * Notify user that reports are ready
   */
  async sendReportsReady(data: AdminReportNotification): Promise<void> {
    const reportLinks = data.reportUrls.map((url, i) => 
      `<li><a href="${url}" style="color: #4F46E5;">Report ${i + 1} - Download PDF</a></li>`
    ).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
            .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
            .reports-box { background: white; padding: 20px; border-radius: 4px; border: 2px solid #4F46E5; }
            .reports-box ul { list-style: none; padding: 0; }
            .reports-box li { padding: 10px; margin: 5px 0; background: #f3f4f6; border-radius: 4px; }
            .cta-button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">📊 Your Reports Are Ready!</h2>
            </div>
            <div class="content">
              <div class="success-icon">🎉</div>
              <p>Great news! Your Turnitin plagiarism check is complete.</p>
              <div class="reports-box">
                <h3 style="margin-top: 0;">Download Your Reports</h3>
                <p><strong>Order ID:</strong> ${data.orderId}</p>
                <p>You have <strong>${data.reportUrls.length} PDF reports</strong> ready for download:</p>
                <ul>
                  ${reportLinks}
                </ul>
                <p style="margin-top: 15px; font-size: 12px; color: #6b7280;">
                  <em>Note: Download links are valid for 30 days. Please save your reports.</em>
                </p>
              </div>
              <p style="margin-top: 20px;">If you have any questions about your reports, feel free to contact us!</p>
            </div>
            <div class="footer">
              <p>Questions? Contact us at ${this.config.adminEmail}</p>
              <p><strong>HandyWriterz</strong> - Academic Excellence Delivered</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail(
      data.userEmail,
      `Your Turnitin Reports Are Ready - Order ${data.orderId}`,
      html
    );
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
