/* Meta WhatsApp Cloud API adapter.
   Swapping providers later = replace this file only; index.ts and the engine
   never change. */

export interface OutboundMessage {
  to: string;      // E.164 without leading + for Meta
  text: string;
}

const GRAPH_VERSION = "v21.0";

// Meta requires appsecret_proof (HMAC-SHA256 of the access token, keyed by
// the app secret) on every server-side Graph API call for this app —
// without it every send fails with "API calls from the server require an
// appsecret_proof argument", regardless of how valid the token itself is.
async function computeAppSecretProof(token: string, appSecret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(appSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const hashBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(token));
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function sendWhatsApp(msg: OutboundMessage): Promise<void> {
  // WHATSAPP_PHONE_NUMBER_ID is this function's own expected secret name;
  // VITE_WHATSAPP_PHONE_ID is the one whatsapp-webhook already has set, so
  // this falls back to it rather than requiring a duplicate secret.
  const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") || Deno.env.get("VITE_WHATSAPP_PHONE_ID");
  const token = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
  const appSecret = Deno.env.get("VITE_WHATSAPP_APP_SECRET");
  if (!phoneNumberId || !token) {
    console.error("WhatsApp credentials missing (WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN)");
    return;
  }
  if (!appSecret) {
    console.error("WhatsApp app secret missing (VITE_WHATSAPP_APP_SECRET) — send will fail appsecret_proof check");
    return;
  }

  const appsecretProof = await computeAppSecretProof(token, appSecret);
  const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages?appsecret_proof=${appsecretProof}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: msg.to.replace(/^\+/, ""),
      type: "text",
      text: { body: msg.text },
    }),
  });

  if (!res.ok) {
    console.error(`Meta send failed ${res.status}: ${await res.text()}`);
  }
}

/** Extract inbound text messages from a Meta webhook payload.
    Returns [{ from: "+234...", text: "..." }] — empty for statuses/media. */
export function parseInbound(payload: unknown): { from: string; text: string }[] {
  const out: { from: string; text: string }[] = [];
  try {
    const entries = (payload as { entry?: unknown[] })?.entry ?? [];
    for (const entry of entries as { changes?: unknown[] }[]) {
      for (const change of (entry.changes ?? []) as { value?: { messages?: unknown[] } }[]) {
        for (const m of (change.value?.messages ?? []) as { from?: string; type?: string; text?: { body?: string } }[]) {
          if (m.type === "text" && m.from && m.text?.body) {
            out.push({ from: `+${m.from.replace(/^\+/, "")}`, text: m.text.body });
          }
        }
      }
    }
  } catch (err) {
    console.error("parseInbound failed:", err);
  }
  return out;
}
