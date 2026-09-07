/**
 * WhatsApp Provider Interface
 * ═════════════════════════════════════════════════════════════════
 * Abstract interface that any WhatsApp provider (Meta, Twilio, Simulator)
 * must implement. This decouples bot logic from the transport layer.
 */

// ── Inbound Message ──────────────────────────────────────────────────
export interface InboundMessage {
  fromPhone: string;        // E.g. +2347079505314
  messageId: string;        // Unique ID from provider
  text: string;             // Message content
  timestamp: number;        // Unix timestamp
  type: 'text' | 'button' | 'interactive';
}

// ── Outbound Response ────────────────────────────────────────────────
export interface MessageResult {
  success: boolean;
  messageId?: string;       // Provider's message ID
  error?: string;           // Error message if failed
  timestamp?: number;
}

// ── Template Variables ───────────────────────────────────────────────
export interface TemplateVars {
  [key: string]: string | number;
}

// ── Interactive Payload (buttons, quick replies) ─────────────────────
export interface InteractivePayload {
  type: 'button' | 'list';
  header?: string;
  body: string;
  footer?: string;
  action: {
    buttons?: Array<{
      type: 'reply';
      reply: { id: string; title: string };
    }>;
    sections?: Array<{
      title: string;
      rows: Array<{
        id: string;
        title: string;
        description?: string;
      }>;
    }>;
  };
}

// ── Webhook Request (for verification) ───────────────────────────────
export interface WebhookRequest {
  headers: Record<string, string>;
  body: unknown;
}

// ── Provider Interface ───────────────────────────────────────────────
export interface WhatsAppProvider {
  /**
   * Send a plain text message
   */
  sendText(to: string, body: string): Promise<MessageResult>;

  /**
   * Send a pre-approved template message
   * @param to Phone number (with country code)
   * @param name Template name (e.g., "pad_issuance_confirmation")
   * @param vars Variables to interpolate into template
   */
  sendTemplate(to: string, name: string, vars: TemplateVars): Promise<MessageResult>;

  /**
   * Send interactive message (buttons, list, etc.)
   */
  sendInteractive(to: string, payload: InteractivePayload): Promise<MessageResult>;

  /**
   * Parse inbound webhook payload into normalized InboundMessage
   * Provider-specific payload → standard format
   */
  parseInbound(rawWebhook: unknown): InboundMessage | null;

  /**
   * Verify webhook authenticity (for Meta: HMAC-SHA256)
   * Returns true if webhook is from trusted provider
   */
  verifyWebhook(req: WebhookRequest): boolean;

  /**
   * Get provider name for logging/debugging
   */
  getName(): string;
}

// ── Bot Command Types ────────────────────────────────────────────────
export type BotCommand =
  | { type: 'CHECK_ID'; studentId: string }
  | { type: 'ISSUE_PAD'; studentId: string; padType: 'FREE' | 'PAID' }
  | { type: 'DEPOSIT'; amount: number }
  | { type: 'REPORT'; reportType: 'DAILY' | 'CYCLE' };

// ── Bot Response ─────────────────────────────────────────────────────
export interface BotResponse {
  success: boolean;
  message: string;           // Human-readable response
  data?: Record<string, unknown>;
  error?: string;
}
