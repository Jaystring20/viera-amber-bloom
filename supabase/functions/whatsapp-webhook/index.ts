/**
 * WhatsApp Webhook Handler - Full Production Bot
 * ═════════════════════════════════════════════════════════════════
 * Supabase Edge Function receiving WhatsApp messages from Meta.
 * Deployed at: https://xcwgethymuvxcalxukzy.supabase.co/functions/v1/whatsapp-webhook
 *
 * Verifies webhook authenticity, runs a small conversational flow
 * (VAGIN intro → matron check → intake or command session), executes
 * bot commands, and sends responses back via WhatsApp API.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const WEBHOOK_VERIFY_TOKEN = Deno.env.get("WHATSAPP_WEBHOOK_TOKEN") || "pad_kolo_webhook_2026_secure";
const ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
const PHONE_NUMBER_ID = Deno.env.get("VITE_WHATSAPP_PHONE_ID");
const APP_SECRET = Deno.env.get("VITE_WHATSAPP_APP_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

// A session goes stale after this long with no message — the next message
// re-starts the conversation from the VAGIN intro rather than assuming
// context nobody remembers anymore. Mirrors WhatsApp's own 24h customer
// service window.
const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000;

const VAGIN_INTRO = `👋 Welcome to *Viera Amber*!

*VAGIN* — the Viera Amber Girls Initiative — supports girls' menstrual health through pad distribution, education and community impact in schools across Nigeria.

To learn more, visit: www.vieraamber.com/vagin

Are you a School Matron with PAD KÓLÓ?`;

const VAGIN_INTRO_NUDGE = `Sorry, I didn't quite catch that — please tap one of the buttons below 👇

Are you a School Matron with PAD KÓLÓ?`;

const CLOSING_MESSAGE = `Thanks so much for your interest in VAGIN! 💛

Learn more anytime at www.vieraamber.com/vagin, or reach us directly at admin@vieraamber.com.

Have a wonderful day! 🌸`;

const COMMANDS_BLOCK = `📋 *CHECK ID* [student_id]
   Check a student's balance & free pad status
   e.g. CHECK ID FAADSS2

📦 *ISSUE PAD* [student_id] [FREE|PAID]
   Issue a pad to a student
   e.g. ISSUE PAD FAADSS2 FREE

💰 *DEPOSIT* [amount]
   Record a deposit for your school
   e.g. DEPOSIT 5000

📊 *REPORT* [DAILY|CYCLE]
   Get an activity summary
   e.g. REPORT DAILY`;

function buildActiveGreeting(name: string, schoolName: string): string {
  return `Great to hear from you, ${name}! 👋

I see you're registered with *${schoolName}*.

Here's what I can do:

${COMMANDS_BLOCK}

Send a command whenever you're ready, ${name}. 💛`;
}

function buildActiveReminder(name: string): string {
  return `Hi ${name}, I didn't quite catch that. Here's what I can help with:

${COMMANDS_BLOCK}`;
}

interface WebhookPayload {
  object?: string;
  entry?: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product?: string;
        metadata?: {
          display_phone_number: string;
          phone_number_id: string;
        };
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text?: { body: string };
          type: string;
          interactive?: {
            type: string;
            button_reply?: { id: string; title: string };
          };
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

interface Session {
  phone: string;
  state: string;
  intake_name: string | null;
  last_message_at: string;
}

async function verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const keyBuffer = encoder.encode(APP_SECRET!);
    const key = await crypto.subtle.importKey("raw", keyBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const messageBuffer = encoder.encode(payload);
    const hashBuffer = await crypto.subtle.sign("HMAC", key, messageBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    const expectedSignature = `sha256=${hash}`;
    return signature === expectedSignature;
  } catch (err) {
    console.error("[Webhook] Verification error:", err);
    return false;
  }
}

function parseCommand(text: string): { type: string; data: Record<string, unknown> } | null {
  const normalized = text.trim().toUpperCase();
  const checkMatch = normalized.match(/^CHECK\s+ID\s+([A-Z0-9-]+)$/);
  if (checkMatch) return { type: "CHECK_ID", data: { studentId: checkMatch[1] } };
  const issueMatch = normalized.match(/^ISSUE\s+PAD\s+([A-Z0-9-]+)\s+(FREE|PAID)$/);
  if (issueMatch) return { type: "ISSUE_PAD", data: { studentId: issueMatch[1], padType: issueMatch[2] } };
  const depositMatch = normalized.match(/^DEPOSIT\s+(\d+)$/);
  if (depositMatch) return { type: "DEPOSIT", data: { amount: parseInt(depositMatch[1]) } };
  const reportMatch = normalized.match(/^REPORT\s+(DAILY|CYCLE)$/);
  if (reportMatch) return { type: "REPORT", data: { reportType: reportMatch[1] } };
  return null;
}

async function getMatronSchool(fromPhone: string): Promise<{ schoolId: string; matronName: string; schoolName: string } | null> {
  try {
    const { data, error } = await supabase
      .from("teachers_matrons")
      .select("school_id, name, vagin_schools(name)")
      .eq("phone", fromPhone.replace(/^\+/, ""))
      .single();
    if (error || !data) {
      console.log(`[Webhook] Matron not found for phone: ${fromPhone}`);
      return null;
    }
    const school = data.vagin_schools as unknown as { name?: string } | null;
    return { schoolId: data.school_id, matronName: data.name, schoolName: school?.name || "your school" };
  } catch (err) {
    console.error("[Webhook] Error fetching matron:", err);
    return null;
  }
}

async function getSession(phone: string): Promise<Session | null> {
  try {
    const { data, error } = await supabase.from("whatsapp_sessions").select("*").eq("phone", phone).single();
    if (error || !data) return null;
    return data as Session;
  } catch (err) {
    console.error("[Webhook] Error fetching session:", err);
    return null;
  }
}

async function upsertSession(phone: string, state: string, intakeName: string | null = null): Promise<void> {
  try {
    await supabase.from("whatsapp_sessions").upsert(
      { phone, state, intake_name: intakeName, last_message_at: new Date().toISOString() },
      { onConflict: "phone" },
    );
  } catch (err) {
    console.error("[Webhook] Error upserting session:", err);
  }
}

function isSessionExpired(session: Session): boolean {
  return Date.now() - new Date(session.last_message_at).getTime() > SESSION_TIMEOUT_MS;
}

async function notifyAdmin(type: string, data: Record<string, unknown>): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/notify-admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({ type, data }),
    });
  } catch (err) {
    console.error("[Webhook] notify-admin call failed:", err);
  }
}

async function sendWhatsAppPayload(toPhone: string, messagePayload: Record<string, unknown>): Promise<boolean> {
  try {
    const formattedPhone = toPhone.startsWith("+") ? toPhone : `+${toPhone}`;

    // Calculate appsecret_proof (HMAC-SHA256 of access token using app secret)
    const encoder = new TextEncoder();
    const keyBuffer = encoder.encode(APP_SECRET!);
    const key = await crypto.subtle.importKey("raw", keyBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const messageBuffer = encoder.encode(ACCESS_TOKEN!);
    const hashBuffer = await crypto.subtle.sign("HMAC", key, messageBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const appsecretProof = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages?appsecret_proof=${appsecretProof}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Authorization": `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to: formattedPhone, ...messagePayload }),
    });

    console.log(`[Webhook] Response status: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[Webhook] Send message failed - Status: ${response.status}, Response: ${errorBody}`);
      return false;
    }

    const responseBody = await response.text();
    console.log(`[Webhook] Message sent successfully to ${formattedPhone}, Response: ${responseBody}`);
    return true;
  } catch (err) {
    console.error("[Webhook] Send message error:", err);
    return false;
  }
}

async function sendWhatsAppMessage(toPhone: string, message: string): Promise<boolean> {
  return sendWhatsAppPayload(toPhone, { type: "text", text: { preview_url: false, body: message } });
}

async function sendVaginIntroButtons(toPhone: string, nudge = false): Promise<boolean> {
  return sendWhatsAppPayload(toPhone, {
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: nudge ? VAGIN_INTRO_NUDGE : VAGIN_INTRO },
      action: {
        buttons: [
          { type: "reply", reply: { id: "MATRON_YES", title: "Yes, I'm a Matron" } },
          { type: "reply", reply: { id: "MATRON_NO", title: "No, just inquiring" } },
        ],
      },
    },
  });
}

async function executeCommand(command: { type: string; data: Record<string, unknown> }, schoolId: string, fromPhone: string): Promise<string> {
  try {
    switch (command.type) {
      case "CHECK_ID": {
        const studentId = command.data.studentId as string;
        const { data: students, error } = await supabase.from("vagin_students").select("id, name, balance_ngn, free_pads_used").eq("school_id", schoolId).eq("student_id", studentId).single();
        if (error || !students) return `❌ Student ID "${studentId}" not found.`;
        const freePadsRemaining = Math.max(0, 1 - (students.free_pads_used || 0));
        const balance = students.balance_ngn || 0;
        return `📊 Student: ${students.name}\nBalance: ₦${balance.toLocaleString("en-NG")}\nFree pads: ${freePadsRemaining}/1 remaining`;
      }
      case "ISSUE_PAD": {
        const studentId = command.data.studentId as string;
        const padType = command.data.padType as string;
        const { data: students, error: studentError } = await supabase.from("vagin_students").select("id, name, balance_ngn, free_pads_used").eq("school_id", schoolId).eq("student_id", studentId).single();
        if (studentError || !students) return `❌ Student ID "${studentId}" not found.`;
        if (padType === "FREE" && (students.free_pads_used || 0) >= 1) return `❌ Cannot issue free pad to ${students.name}.\nFree pads used: ${students.free_pads_used}/1\nShe must pay ₦200 for the next pad.`;
        const { error: txError } = await supabase.from("vagin_transactions").insert({ student_id: students.id, school_id: schoolId, transaction_type: padType === "FREE" ? "free_pad" : "paid_pad", pads_issued: 1, amount_ngn: padType === "PAID" ? 200 : null, source: "whatsapp_bot", issued_date: new Date().toISOString().split("T")[0], issued_by: `WhatsApp Bot (${fromPhone})` });
        if (txError) return `⚠️ Error recording pad: ${txError.message}`;
        const newBalance = padType === "PAID" ? Math.max(0, students.balance_ngn - 200) : students.balance_ngn;
        const newFreeUsed = (students.free_pads_used || 0) + (padType === "FREE" ? 1 : 0);
        await supabase.from("vagin_students").update({ balance_ngn: newBalance, free_pads_used: newFreeUsed }).eq("id", students.id);
        return `✓ Pad issued to ${students.name}\nType: ${padType === "FREE" ? "Free" : "₦200"}\nNew balance: ₦${newBalance.toLocaleString("en-NG")}\nFree pads remaining: ${Math.max(0, 1 - newFreeUsed)}/1`;
      }
      case "DEPOSIT": {
        const amount = command.data.amount as number;
        const { data: school } = await supabase.from("vagin_schools").select("name, current_balance").eq("id", schoolId).single();
        const schoolName = school?.name || "School";
        const previousBalance = school?.current_balance || 0;
        await supabase.from("vagin_transactions").insert({ school_id: schoolId, transaction_type: "deposit", pads_issued: 0, amount_ngn: amount, source: "matron_deposit", notes: `Via WhatsApp from ${fromPhone}` });
        const newBalance = previousBalance + amount;
        await supabase.from("vagin_schools").update({ current_balance: newBalance }).eq("id", schoolId);
        return `✓ Deposit recorded\nAmount: ₦${amount.toLocaleString("en-NG")}\nSchool: ${schoolName}\nNew balance: ₦${newBalance.toLocaleString("en-NG")}`;
      }
      case "REPORT": {
        const reportType = command.data.reportType as string;
        const today = new Date().toISOString().split("T")[0];
        let query = supabase.from("vagin_transactions").select("transaction_type, pads_issued, amount_ngn").eq("school_id", schoolId);
        if (reportType === "DAILY") query = query.eq("issued_date", today);
        const { data: transactions } = await query;
        const freeIssued = transactions?.filter((t) => t.transaction_type === "free_pad").reduce((sum: number, t: any) => sum + (t.pads_issued || 0), 0) || 0;
        const paidIssued = transactions?.filter((t) => t.transaction_type === "paid_pad").reduce((sum: number, t: any) => sum + (t.pads_issued || 0), 0) || 0;
        const revenue = transactions?.filter((t) => t.transaction_type === "paid_pad").reduce((sum: number, t: any) => sum + (t.amount_ngn || 0), 0) || 0;
        const totalPads = freeIssued + paidIssued;
        return reportType === "DAILY" ? `📈 Today's Report\nPads issued: ${totalPads}\nFree: ${freeIssued}\nPaid: ${paidIssued}\nRevenue: ₦${revenue.toLocaleString("en-NG")}` : `📊 Cycle Report\nTotal pads issued: ${totalPads}\nRevenue: ₦${revenue.toLocaleString("en-NG")}`;
      }
      default: return buildActiveReminder("there");
    }
  } catch (err) {
    console.error("[Webhook] Command execution error:", err);
    return "⚠️ System error. Please try again later.";
  }
}

function handleVerification(verifyToken: string, challenge: string): { statusCode: number; body: string } {
  if (verifyToken === WEBHOOK_VERIFY_TOKEN) {
    console.log("[Webhook] Verification successful");
    return { statusCode: 200, body: challenge };
  }
  console.warn("[Webhook] Invalid verification token");
  return { statusCode: 403, body: "Forbidden" };
}

async function handleMessage(payload: WebhookPayload, signature: string): Promise<{ statusCode: number; body: string }> {
  const payloadString = JSON.stringify(payload);
  if (!(await verifyWebhookSignature(payloadString, signature))) {
    console.warn("[Webhook] Invalid signature");
    return { statusCode: 403, body: "Forbidden" };
  }
  if (!payload.entry || payload.entry.length === 0) return { statusCode: 200, body: "ok" };
  const entry = payload.entry[0];
  if (!entry.changes || entry.changes.length === 0) return { statusCode: 200, body: "ok" };
  const change = entry.changes[0];
  const value = change.value;
  if (!value.messages || value.messages.length === 0) return { statusCode: 200, body: "ok" };
  const message = value.messages[0];
  const fromPhone = message.from;

  let messageText: string | null = null;
  let buttonReplyId: string | null = null;
  if (message.type === "text" && message.text?.body) {
    messageText = message.text.body;
  } else if (message.type === "interactive" && message.interactive?.type === "button_reply" && message.interactive.button_reply) {
    buttonReplyId = message.interactive.button_reply.id;
    messageText = message.interactive.button_reply.title;
  }
  if (!messageText && !buttonReplyId) return { statusCode: 200, body: "ok" };
  console.log(`[Webhook] Message from ${fromPhone}: ${messageText ?? buttonReplyId}`);

  const existingSession = await getSession(fromPhone);
  const inFlow = existingSession
    && !isSessionExpired(existingSession)
    && existingSession.state !== "NEW"
    && existingSession.state !== "ENDED";

  if (!inFlow) {
    await sendVaginIntroButtons(fromPhone);
    await upsertSession(fromPhone, "AWAITING_MATRON_CONFIRM");
    return { statusCode: 200, body: "ok" };
  }

  const session = existingSession as Session;

  switch (session.state) {
    case "AWAITING_MATRON_CONFIRM": {
      const trimmed = (messageText || "").trim();
      const isYes = buttonReplyId === "MATRON_YES" || /^y(es)?$/i.test(trimmed);
      const isNo = buttonReplyId === "MATRON_NO" || /^no?$/i.test(trimmed);
      if (isYes) {
        const matronSchool = await getMatronSchool(fromPhone);
        if (matronSchool) {
          await sendWhatsAppMessage(fromPhone, buildActiveGreeting(matronSchool.matronName, matronSchool.schoolName));
          await upsertSession(fromPhone, "ACTIVE");
        } else {
          await sendWhatsAppMessage(fromPhone, "No problem! Let's get you set up.\n\nWhat's your full name?");
          await upsertSession(fromPhone, "AWAITING_INTAKE_NAME");
        }
      } else if (isNo) {
        await sendWhatsAppMessage(fromPhone, CLOSING_MESSAGE);
        await upsertSession(fromPhone, "ENDED");
      } else {
        await sendVaginIntroButtons(fromPhone, true);
      }
      return { statusCode: 200, body: "ok" };
    }
    case "AWAITING_INTAKE_NAME": {
      const name = (messageText || "").trim();
      await upsertSession(fromPhone, "AWAITING_INTAKE_SCHOOL", name);
      await sendWhatsAppMessage(fromPhone, `Thanks, ${name}! Which school are you representing?\n\n(Please share the full school name)`);
      return { statusCode: 200, body: "ok" };
    }
    case "AWAITING_INTAKE_SCHOOL": {
      const school = (messageText || "").trim();
      const name = session.intake_name || "there";
      await supabase.from("matron_registration_requests").insert({ phone: fromPhone, claimed_name: name, claimed_school: school });
      await notifyAdmin("matron_registration_request", { phone: fromPhone, claimed_name: name, claimed_school: school });
      await sendWhatsAppMessage(fromPhone, `Thank you, ${name}! 💛 We've received your details for *${school}* and our team will reach out shortly to complete your registration.\n\nIn the meantime, feel free to explore more about VAGIN at www.vieraamber.com/vagin`);
      await upsertSession(fromPhone, "ENDED");
      return { statusCode: 200, body: "ok" };
    }
    case "ACTIVE": {
      const matronSchool = await getMatronSchool(fromPhone);
      if (!matronSchool) {
        // Matron record was removed/deactivated since the session started.
        await sendVaginIntroButtons(fromPhone);
        await upsertSession(fromPhone, "AWAITING_MATRON_CONFIRM");
        return { statusCode: 200, body: "ok" };
      }
      const command = messageText ? parseCommand(messageText) : null;
      if (!command) {
        await sendWhatsAppMessage(fromPhone, buildActiveReminder(matronSchool.matronName));
      } else {
        const response = await executeCommand(command, matronSchool.schoolId, fromPhone);
        await sendWhatsAppMessage(fromPhone, response);
      }
      await upsertSession(fromPhone, "ACTIVE");
      return { statusCode: 200, body: "ok" };
    }
    default: {
      await sendVaginIntroButtons(fromPhone);
      await upsertSession(fromPhone, "AWAITING_MATRON_CONFIRM");
      return { statusCode: 200, body: "ok" };
    }
  }
}

Deno.serve(async (req: Request) => {
  console.log(`[Webhook] ${req.method} request received`);
  try {
    if (req.method === "GET") {
      const url = new URL(req.url);
      const verifyToken = url.searchParams.get("hub.verify_token") || "";
      const challenge = url.searchParams.get("hub.challenge") || "";
      const result = handleVerification(verifyToken, challenge);
      return new Response(result.body, { status: result.statusCode });
    }
    if (req.method === "POST") {
      const signature = req.headers.get("x-hub-signature-256") || "";
      const payload = await req.json() as WebhookPayload;
      const result = await handleMessage(payload, signature);
      return new Response(JSON.stringify({ message: result.body }), { status: result.statusCode, headers: { "Content-Type": "application/json" } });
    }
    return new Response("Method not allowed", { status: 405 });
  } catch (err) {
    console.error("[Webhook] Handler error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
