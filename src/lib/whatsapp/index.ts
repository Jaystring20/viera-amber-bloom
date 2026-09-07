/**
 * WhatsApp Bot - Public Exports
 * ═════════════════════════════════════════════════════════════════
 */

// Types
export {
  type InboundMessage,
  type MessageResult,
  type TemplateVars,
  type InteractivePayload,
  type WebhookRequest,
  type BotCommand,
  type BotResponse,
  type WhatsAppProvider,
} from './types';

// Providers
export { SimulatorProvider, type SimulatedMessage, simulatorProvider } from './simulator-provider';
export { MetaCloudProvider, createMetaProvider, type MetaInboundPayload } from './meta-provider';

// Bot Logic
export {
  parseCommand,
  executeCommand,
  getHelpMessage,
} from './bot-handler';
