/* ═══════════════════════════════════════════════════════════════════════════════
   PAD KOLO WhatsApp Bot — Supabase Edge Function
   Spec: https://github.com/Jaystring20/viera-amber-bloom/issues/1

   GET  → Meta webhook verification (hub.challenge echo)
   POST → inbound messages: HMAC-verified, run through the shared bot engine
          (src/lib/botEngine.ts — same file the dashboard Simulator uses),
          replies sent via the Meta adapter (provider.ts).

   Required secrets (supabase secrets set …):
     WHATSAPP_VERIFY_TOKEN     — any string; must match the value entered in Meta
     WHATSAPP_APP_SECRET       — Meta app secret, used for X-Hub-Signature-256
     WHATSAPP_ACCESS_TOKEN     — permanent system-user token
     WHATSAPP_PHONE_NUMBER_ID  — the business number's phone-number-id
   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically.

   Deploy:  supabase functions deploy whatsapp-bot --no-verify-jwt
   (--no-verify-jwt because Meta calls this endpoint, not an authed user;
    security = verify token on GET + HMAC signature on POST.)
   ═══════════════════════════════════════════════════════════════════════════════ */

import { createClient } from "npm:@supabase/supabase-js@2";
import { processMessage } from "../../../src/lib/botEngine.ts";
import { sendWhatsApp, parseInbound } from "./provider.ts";

const encoder = new TextEncoder();

async function verifySignature(body: string, signatureHeader: string | null): Promise<boolean> {
  const secret = Deno.env.get("WHATSAPP_APP_SECRET");
  if (!secret) return false;
  if (!signatureHeader?.startsWith("sha256=")) return false;

  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const expected = "sha256=" + Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, "0")).join("");

  // constant-time compare
  const a = encoder.encode(expected);
  const b = encoder.encode(signatureHeader);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);

  // ── Meta webhook verification handshake ─────────────────────────────────────
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    if (mode === "subscribe" && token === Deno.env.get("WHATSAPP_VERIFY_TOKEN") && challenge) {
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  // ── Signature check on the raw body ──────────────────────────────────────────
  const rawBody = await req.text();
  const ok = await verifySignature(rawBody, req.headers.get("x-hub-signature-256"));
  if (!ok) {
    console.error("Rejected webhook: bad signature");
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: unknown;
  try { payload = JSON.parse(rawBody); } catch { return new Response("Bad JSON", { status: 400 }); }

  const messages = parseInbound(payload);
  if (messages.length === 0) return new Response("OK", { status: 200 }); // statuses etc.

  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  for (const msg of messages) {
    try {
      const result = await processMessage(db, msg.from, msg.text);
      for (const reply of result.replies) {
        await sendWhatsApp({ to: msg.from, text: reply });
      }
      // Stock requests also forward to the admin phone (the only paid template path in v1)
      if (result.stockRequest) {
        const { data: cfg } = await db.from("vagin_bot_config").select("admin_phone").eq("id", 1).maybeSingle();
        if (cfg?.admin_phone) {
          await sendWhatsApp({
            to: cfg.admin_phone,
            text: `📦 Stock request: ${result.stockRequest.qty} pack(s) for ${result.stockRequest.schoolName} — from ${result.stockRequest.matronName}${result.stockRequest.reason ? ` ("${result.stockRequest.reason}")` : ""}. See dashboard → Transactions.`,
          });
        }
      }
    } catch (err) {
      console.error(`Engine error for ${msg.from}:`, err);
    }
  }

  // Always 200 so Meta doesn't retry-storm us; failures are logged internally.
  return new Response("OK", { status: 200 });
});
