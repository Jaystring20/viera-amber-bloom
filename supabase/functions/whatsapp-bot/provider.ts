/* Meta WhatsApp Cloud API adapter.
   Swapping providers later = replace this file only; index.ts and the engine
   never change. */

export interface OutboundMessage {
  to: string;      // E.164 without leading + for Meta
  text: string;
}

const GRAPH_VERSION = "v21.0";

export async function sendWhatsApp(msg: OutboundMessage): Promise<void> {
  const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  const token = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
  if (!phoneNumberId || !token) {
    console.error("WhatsApp credentials missing (WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN)");
    return;
  }

  const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`, {
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
