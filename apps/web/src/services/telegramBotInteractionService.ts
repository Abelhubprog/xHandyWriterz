/**
 * Telegram Bot Interaction Service
 * Handles communication with Telegram bot for notifications and interactions
 */

export interface TelegramMessage {
  chatId: string | number;
  text: string;
  parseMode?: 'Markdown' | 'HTML';
  disableWebPagePreview?: boolean;
  disableNotification?: boolean;
}

export interface TelegramPhoto {
  chatId: string | number;
  photo: string; // File ID or URL
  caption?: string;
  parseMode?: 'Markdown' | 'HTML';
}

export interface TelegramDocument {
  chatId: string | number;
  document: string; // File ID or URL
  caption?: string;
  parseMode?: 'Markdown' | 'HTML';
}

export interface TelegramResponse {
  ok: boolean;
  result?: any;
  error?: string;
}

export class TelegramBotInteractionService {
  private botToken: string;
  private apiUrl: string;
  private adminChatId: string;

  constructor(
    botToken?: string,
    adminChatId?: string
  ) {
    this.botToken = botToken || import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
    this.adminChatId = adminChatId || import.meta.env.VITE_TELEGRAM_ADMIN_CHAT_ID || '';
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  /**
   * Send text message
   */
  async sendMessage(message: TelegramMessage): Promise<TelegramResponse> {
    if (!this.botToken) {
      console.warn('Telegram bot token not configured');
      return { ok: false, error: 'Bot token not configured' };
    }

    try {
      const response = await fetch(`${this.apiUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: message.chatId,
          text: message.text,
          parse_mode: message.parseMode,
          disable_web_page_preview: message.disableWebPagePreview,
          disable_notification: message.disableNotification,
        }),
      });

      const data = await response.json();
      return {
        ok: data.ok,
        result: data.result,
        error: data.description,
      };
    } catch (error) {
      console.error('Telegram sendMessage error:', error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send photo
   */
  async sendPhoto(photo: TelegramPhoto): Promise<TelegramResponse> {
    if (!this.botToken) {
      console.warn('Telegram bot token not configured');
      return { ok: false, error: 'Bot token not configured' };
    }

    try {
      const response = await fetch(`${this.apiUrl}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: photo.chatId,
          photo: photo.photo,
          caption: photo.caption,
          parse_mode: photo.parseMode,
        }),
      });

      const data = await response.json();
      return {
        ok: data.ok,
        result: data.result,
        error: data.description,
      };
    } catch (error) {
      console.error('Telegram sendPhoto error:', error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send document
   */
  async sendDocument(document: TelegramDocument): Promise<TelegramResponse> {
    if (!this.botToken) {
      console.warn('Telegram bot token not configured');
      return { ok: false, error: 'Bot token not configured' };
    }

    try {
      const response = await fetch(`${this.apiUrl}/sendDocument`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: document.chatId,
          document: document.document,
          caption: document.caption,
          parse_mode: document.parseMode,
        }),
      });

      const data = await response.json();
      return {
        ok: data.ok,
        result: data.result,
        error: data.description,
      };
    } catch (error) {
      console.error('Telegram sendDocument error:', error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Notify admin with message
   */
  async notifyAdmin(
    message: string,
    parseMode: 'Markdown' | 'HTML' = 'Markdown'
  ): Promise<TelegramResponse> {
    if (!this.adminChatId) {
      console.warn('Telegram admin chat ID not configured');
      return { ok: false, error: 'Admin chat ID not configured' };
    }

    return this.sendMessage({
      chatId: this.adminChatId,
      text: message,
      parseMode,
    });
  }

  /**
   * Notify admin about new order
   */
  async notifyAdminNewOrder(orderDetails: {
    orderId: string;
    userId: string;
    subject: string;
    amount?: number;
  }): Promise<TelegramResponse> {
    const message = `
🆕 *New Order Received*

📋 Order ID: \`${orderDetails.orderId}\`
👤 User ID: \`${orderDetails.userId}\`
📝 Subject: ${orderDetails.subject}
${orderDetails.amount ? `💰 Amount: $${orderDetails.amount}` : ''}

Please check the admin dashboard for details.
    `.trim();

    return this.notifyAdmin(message);
  }

  /**
   * Notify admin about payment
   */
  async notifyAdminPayment(paymentDetails: {
    paymentId: string;
    userId: string;
    amount: number;
    status: string;
  }): Promise<TelegramResponse> {
    const statusEmoji = paymentDetails.status === 'completed' ? '✅' : '⏳';
    const message = `
${statusEmoji} *Payment ${paymentDetails.status}*

💳 Payment ID: \`${paymentDetails.paymentId}\`
👤 User ID: \`${paymentDetails.userId}\`
💰 Amount: $${paymentDetails.amount}
📊 Status: ${paymentDetails.status}
    `.trim();

    return this.notifyAdmin(message);
  }

  /**
   * Notify admin about support request
   */
  async notifyAdminSupport(supportDetails: {
    userId: string;
    userName: string;
    subject: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }): Promise<TelegramResponse> {
    const priorityEmoji = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      urgent: '🔴',
    };
    const emoji = priorityEmoji[supportDetails.priority || 'medium'];

    const message = `
${emoji} *New Support Request*

👤 User: ${supportDetails.userName} (\`${supportDetails.userId}\`)
📝 Subject: ${supportDetails.subject}
⚡ Priority: ${supportDetails.priority || 'medium'}

Please respond via the messaging system.
    `.trim();

    return this.notifyAdmin(message);
  }

  /**
   * Notify admin about file upload
   */
  async notifyAdminFileUpload(uploadDetails: {
    userId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  }): Promise<TelegramResponse> {
    const message = `
📁 *File Uploaded*

👤 User ID: \`${uploadDetails.userId}\`
📄 File: ${uploadDetails.fileName}
📦 Size: ${this.formatBytes(uploadDetails.fileSize)}
📋 Type: ${uploadDetails.fileType}
    `.trim();

    return this.notifyAdmin(message);
  }

  /**
   * Format bytes for display
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get bot info
   */
  async getBotInfo(): Promise<TelegramResponse> {
    if (!this.botToken) {
      return { ok: false, error: 'Bot token not configured' };
    }

    try {
      const response = await fetch(`${this.apiUrl}/getMe`);
      const data = await response.json();

      return {
        ok: data.ok,
        result: data.result,
        error: data.description,
      };
    } catch (error) {
      console.error('Telegram getBotInfo error:', error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if bot is configured
   */
  isConfigured(): boolean {
    return !!(this.botToken && this.adminChatId);
  }
}

// Export singleton instance
export const telegramBotService = new TelegramBotInteractionService();

// Export for direct usage
export default telegramBotService;
