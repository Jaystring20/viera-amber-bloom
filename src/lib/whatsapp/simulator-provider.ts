/**
 * Simulator Provider
 * ═════════════════════════════════════════════════════════════════
 * Local development harness: captures outbound messages, accepts simulated
 * inbound input. Zero Meta setup, zero cost, permanent QA tool.
 */

import {
  WhatsAppProvider,
  InboundMessage,
  MessageResult,
  TemplateVars,
  InteractivePayload,
  WebhookRequest,
} from './types';

export interface SimulatedMessage {
  direction: 'inbound' | 'outbound';
  timestamp: number;
  phone: string;
  content: string | TemplateVars;
  type: 'text' | 'template' | 'interactive';
  status: 'sent' | 'pending' | 'failed';
}

export class SimulatorProvider implements WhatsAppProvider {
  private messageLog: SimulatedMessage[] = [];
  private messageIdCounter = 1000;
  private lastInboundPhone = '+2347079505314'; // Default test number

  getName(): string {
    return 'SimulatorProvider';
  }

  /**
   * Send text message (simulated)
   */
  async sendText(to: string, body: string): Promise<MessageResult> {
    const messageId = `SIM-${this.messageIdCounter++}`;

    this.messageLog.push({
      direction: 'outbound',
      timestamp: Date.now(),
      phone: to,
      content: body,
      type: 'text',
      status: 'sent',
    });

    console.log(`[SimulatorProvider] Text to ${to}: ${body}`);
    return { success: true, messageId, timestamp: Date.now() };
  }

  /**
   * Send template message (simulated)
   */
  async sendTemplate(
    to: string,
    name: string,
    vars: TemplateVars
  ): Promise<MessageResult> {
    const messageId = `SIM-${this.messageIdCounter++}`;

    this.messageLog.push({
      direction: 'outbound',
      timestamp: Date.now(),
      phone: to,
      content: vars,
      type: 'template',
      status: 'sent',
    });

    console.log(`[SimulatorProvider] Template "${name}" to ${to}:`, vars);
    return { success: true, messageId, timestamp: Date.now() };
  }

  /**
   * Send interactive message (simulated)
   */
  async sendInteractive(
    to: string,
    payload: InteractivePayload
  ): Promise<MessageResult> {
    const messageId = `SIM-${this.messageIdCounter++}`;

    this.messageLog.push({
      direction: 'outbound',
      timestamp: Date.now(),
      phone: to,
      content: JSON.stringify(payload),
      type: 'interactive',
      status: 'sent',
    });

    console.log(`[SimulatorProvider] Interactive to ${to}:`, payload);
    return { success: true, messageId, timestamp: Date.now() };
  }

  /**
   * Parse inbound webhook (simulated)
   * In simulator mode, we inject test messages manually
   */
  parseInbound(rawWebhook: unknown): InboundMessage | null {
    // If it's already an InboundMessage-shaped object, return it
    if (
      rawWebhook &&
      typeof rawWebhook === 'object' &&
      'fromPhone' in rawWebhook &&
      'text' in rawWebhook
    ) {
      const msg = rawWebhook as InboundMessage;

      this.messageLog.push({
        direction: 'inbound',
        timestamp: msg.timestamp,
        phone: msg.fromPhone,
        content: msg.text,
        type: 'text',
        status: 'sent',
      });

      this.lastInboundPhone = msg.fromPhone;
      console.log(
        `[SimulatorProvider] Inbound from ${msg.fromPhone}: ${msg.text}`
      );

      return msg;
    }

    return null;
  }

  /**
   * Verify webhook (simulator always trusts)
   */
  verifyWebhook(req: WebhookRequest): boolean {
    // Simulator always accepts
    return true;
  }

  /**
   * Get message log (for UI display)
   */
  getMessageLog(): SimulatedMessage[] {
    return [...this.messageLog];
  }

  /**
   * Clear message log
   */
  clearLog(): void {
    this.messageLog = [];
  }

  /**
   * Inject a test inbound message (for testing)
   */
  simulateInbound(text: string, fromPhone?: string): InboundMessage {
    const phone = fromPhone || this.lastInboundPhone;
    const message: InboundMessage = {
      fromPhone: phone,
      messageId: `SIM-${this.messageIdCounter++}`,
      text,
      timestamp: Date.now(),
      type: 'text',
    };

    this.parseInbound(message);
    return message;
  }

  /**
   * Get the last phone that sent a message (for UI convenience)
   */
  getLastSenderPhone(): string {
    return this.lastInboundPhone;
  }
}

// Export singleton instance
export const simulatorProvider = new SimulatorProvider();
