/* ═══════════════════════════════════════════════════════════════════════════
   notify-admin — Supabase Edge Function

   Every form on the site (homepage contact, VIVA enquiry, VIVA launch-list
   signup) already calls this as a fire-and-forget side effect after its own
   database write succeeds:

     supabase.functions.invoke("notify-admin", { body: { type, data } })
       .catch(() => {});

   It did not exist anywhere in this repo before now — every one of those
   calls has been failing silently (a CORS-blocked 404, confirmed live) since
   there was nothing deployed to answer them. This is what answers them.

   Rather than adding a new email service and a new secret to manage, this
   reuses the WhatsApp send path the project already has working
   (whatsapp-bot/provider.ts, Meta Cloud API) — the business already lives in
   WhatsApp for every other channel (orders, pre-orders, customer support),
   so an admin notification lands in the same inbox instead of a second one
   nobody's watching.

   Required secrets (already needed by whatsapp-bot, not new):
     WHATSAPP_ACCESS_TOKEN
     WHATSAPP_PHONE_NUMBER_ID
   Optional:
     ADMIN_WHATSAPP_NUMBER — overrides the default recipient below.

   Deploy:  supabase functions deploy notify-admin
   ═══════════════════════════════════════════════════════════════════════════ */

import { sendWhatsApp } from "../whatsapp-bot/provider.ts";

// The business's own public WhatsApp number (same one every "Enquire" /
// "Pre-order" button on the site already sends customers to — see
// src/config/contact.ts). Not a secret; it's printed on the site itself.
// ADMIN_WHATSAPP_NUMBER exists as an escape hatch if notifications should
// ever route somewhere else without a redeploy.
const DEFAULT_ADMIN_NUMBER = "2348143425141";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

// Every caller sends free-form `data`, and new callers will show up later
// (this function has to survive types it doesn't know about yet) — hence
// the generic fallback branch rather than only handling the two known
// shapes and dropping anything else silently.
function formatMessage(type: string, data: Record<string, unknown>): string {
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

  if (type === "contact") {
    const lines = [
      "📩 New enquiry",
      "",
      `Name: ${str(data.name) ?? "—"}`,
      `Email: ${str(data.email) ?? "—"}`,
      `Subject: ${str(data.subject) ?? "—"}`,
    ];
    // VIVA's enquiry form carries this extra field; the homepage contact
    // form does not — included only when actually present.
    if (str(data.interest)) lines.push(`Interest: ${str(data.interest)}`);
    lines.push("", str(data.message) ?? "(no message)");
    return lines.join("\n");
  }

  if (type === "viva_launch_signup") {
    return [
      "🎉 New Batya launch signup",
      "",
      `Phone: ${str(data.phone) ?? "—"}`,
    ].join("\n");
  }

  // Unknown type: still deliver something useful rather than silently
  // dropping it. A future caller that ships a new `type` shows up here
  // instead of vanishing the way every call to this function did before
  // it existed.
  const fields = Object.entries(data)
    .map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
    .join("\n");
  return [`🔔 ${type || "Notification"}`, "", fields || "(no data)"].join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: { type?: string; data?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Malformed request body." }, 400);
  }

  const type = typeof body.type === "string" ? body.type : "";
  const data = body.data && typeof body.data === "object" ? body.data : {};

  // sendWhatsApp() itself swallows missing credentials — it logs and
  // returns undefined rather than throwing, which is the right call for
  // whatsapp-bot (a bad send there must never crash inbound message
  // handling). It means this function can't rely on a catch block to
  // notice that case, so it's checked explicitly here instead: without
  // this, a missing secret would silently no-op and still report
  // { sent: true } to every caller.
  if (!Deno.env.get("WHATSAPP_ACCESS_TOKEN") || !Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")) {
    console.error("notify-admin: WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID not set — nothing sent.");
    return json({ error: "Server not configured: WhatsApp credentials missing." }, 500);
  }

  const adminNumber = Deno.env.get("ADMIN_WHATSAPP_NUMBER") || DEFAULT_ADMIN_NUMBER;
  const text = formatMessage(type, data);

  try {
    await sendWhatsApp({ to: adminNumber, text });
  } catch (err) {
    // Every caller already invokes this with .catch(() => {}) — a failure
    // here must never surface as a broken form for the customer. Logged
    // for whoever next checks `supabase functions logs notify-admin`,
    // returned as a 500 so that log entry is easy to find, but the HTTP
    // response is irrelevant to the caller by design.
    console.error("notify-admin: sendWhatsApp failed", err);
    return json({ error: "Failed to send notification." }, 500);
  }

  return json({ sent: true });
});
