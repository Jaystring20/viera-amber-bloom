/**
 * Meta Cloud Provider
 * ═════════════════════════════════════════════════════════════════
 * Production integration with Meta WhatsApp Cloud API (v19.0)
 * Requires: WHATSAPP_ACCESS_TOKEN, VITE_WHATSAPP_PHONE_ID, VITE_WHATSAPP_WABA_ID
 */

import {
  WhatsAppProvider,
  InboundMessage,
  MessageResult,
  TemplateVars,
  InteractivePayload,
  WebhookRequest,
} from './types';
import * as crypto from 'crypto';

const API_VERSION = 'v19.0';
const GRAPH_API_URL = 'https://graph.instagram.com';

export interface MetaInboundPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text?: { body: string };
          type: string;
        }>;
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

export class MetaCloudProvider implements WhatsAppProvider {
  private phoneNumberId: string;
  private accessToken: string;
  private appSecret: string;
  private wabaId: string;

  constructor(
    phoneNumberId: string,
    accessToken: string,
    appSecret: string,
    wabaId: string
  ) {
    this.phoneNumberId = phoneNumberId;
    this.accessToken = accessToken;
    this.appSecret = appSecret;
    this.wabaId = wabaId;
  }

  getName(): string {
    return 'MetaCloudProvider';
  }

  /**
   * Send plain text message via Meta API
   */
  async sendText(to: string, body: string): Promise<MessageResult> {
    try {
      const response = await fetch(
        `${GRAPH_API_URL}/${API_VERSION}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'text',
            text: { preview_url: false, body },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error(`[MetaCloudProvider] sendText failed:`, error);
        return {
          success: false,
          error: `Meta API error: ${response.status}`,
        };
      }

      const data = (await response.json()) as { messages: Array<{ id: string }> };
      return {
        success: true,
        messageId: data.messages[0].id,
        timestamp: Date.now(),
      };
    } catch (err) {
      console.error(`[MetaCloudProvider] sendText exception:`, err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  /**
   * Send template message via Meta API
   * Template must be pre-approved in Meta Business Manager
   */
  async sendTemplate(
    to: string,
    name: string,
    vars: TemplateVars
  ): Promise<MessageResult> {
    try {
      const response = await fetch(
        `${GRAPH_API_URL}/${API_VERSION}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'template',
            template: {
              name,
              language: { code: 'en' },
              parameters: {
                body: {
                  parameters: Object.values(vars),
                },
              },
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error(`[MetaCloudProvider] sendTemplate failed:`, error);
        return {
          success: false,
          error: `Meta API error: ${response.status}`,
        };
      }

      const data = (await response.json()) as { messages: Array<{ id: string }> };
      return {
        success: true,
        messageId: data.messages[0].id,
        timestamp: Date.now(),
      };
    } catch (err) {
      console.error(`[MetaCloudProvider] sendTemplate exception:`, err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  /**
   * Send interactive message (buttons, list)
   */
  async sendInteractive(
    to: string,
    payload: InteractivePayload
  ): Promise<MessageResult> {
    try {
      const response = await fetch(
        `${GRAPH_API_URL}/${API_VERSION}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'interactive',
            interactive: payload,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error(`[MetaCloudProvider] sendInteractive failed:`, error);
        return {
          success: false,
          error: `Meta API error: ${response.status}`,
        };
      }

      const data = (await response.json()) as { messages: Array<{ id: string }> };
      return {
        success: true,
        messageId: data.messages[0].id,
        timestamp: Date.now(),
      };
    } catch (err) {
      console.error(`[MetaCloudProvider] sendInteractive exception:`, err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  /**
   * Parse Meta webhook payload into normalized InboundMessage
   */
  parseInbound(rawWebhook: unknown): InboundMessage | null {
    try {
      const payload = rawWebhook as MetaInboundPayload;

      if (
        !payload.entry ||
        !Array.isArray(payload.entry) ||
        payload.entry.length === 0
      ) {
        return null;
      }

      const entry = payload.entry[0];
      if (!entry.changes || entry.changes.length === 0) return null;

      const change = entry.changes[0];
      const value = change.value;

      // Only process message events, skip status updates
      if (!value.messages || value.messages.length === 0) {
        return null;
      }

      const message = value.messages[0];
      if (!message.text || !message.text.body) return null;

      return {
        fromPhone: message.from,
        messageId: message.id,
        text: message.text.body,
        timestamp: parseInt(message.timestamp) * 1000,
        type: 'text',
      };
    } catch (err) {
      console.error(`[MetaCloudProvider] parseInbound exception:`, err);
      return null;
    }
  }

  /**
   * Verify webhook authenticity using HMAC-SHA256
   * Meta sends X-Hub-Signature header with the webhook
   */
  verifyWebhook(req: WebhookRequest): boolean {
    try {
      const signature = req.headers['x-hub-signature-256'];
      if (!signature || typeof signature !== 'string') {
        console.warn(`[MetaCloudProvider] Missing X-Hub-Signature-256`);
        return false;
      }

      // Body should be the raw request body (not parsed JSON)
      const bodyString =
        typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

      const hash = crypto
        .createHmac('sha256', this.appSecret)
        .update(bodyString)
        .digest('hex');

      const expectedSignature = `sha256=${hash}`;

      // Constant-time comparison to prevent timing attacks
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (err) {
      console.error(`[MetaCloudProvider] verifyWebhook exception:`, err);
      return false;
    }
  }
}

/**
 * Factory function to create a Meta provider with env vars
 */
export function createMetaProvider(): MetaCloudProvider {
  const phoneNumberId = process.env.VITE_WHATSAPP_PHONE_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const appSecret = process.env.VITE_WHATSAPP_APP_SECRET;
  const wabaId = process.env.VITE_WHATSAPP_WABA_ID;

  if (!phoneNumberId || !accessToken || !appSecret || !wabaId) {
    throw new Error(
      'Missing required WhatsApp environment variables. Ensure VITE_WHATSAPP_PHONE_ID, WHATSAPP_ACCESS_TOKEN, VITE_WHATSAPP_APP_SECRET, and VITE_WHATSAPP_WABA_ID are set.'
    );
  }

  return new MetaCloudProvider(
    phoneNumberId,
    accessToken,
    appSecret,
    wabaId
  );
}
