/**
 * WhatsApp Webhook Handler - Full Production Bot
 * ═════════════════════════════════════════════════════════════════
 * Supabase Edge Function receiving WhatsApp messages from Meta.
 * Deployed at: https://xcwgethymuvxcalxukzy.supabase.co/functions/v1/whatsapp-webhook
 *
 * Verifies webhook authenticity, parses messages, executes bot commands,
 * and sends responses back via WhatsApp API.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const WEBHOOK_VERIFY_TOKEN = Deno.env.get("WHATSAPP_WEBHOOK_TOKEN") || "pad_kolo_webhook_2026_secure";
const ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
const PHONE_NUMBER_ID = Deno.env.get("VITE_WHATSAPP_PHONE_ID");
const APP_SECRET = Deno.env.get("VITE_WHATSAPP_APP_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

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

async function getMatronSchool(fromPhone: string): Promise<{ schoolId: string; matronName: string } | null> {
  try {
    const { data, error } = await supabase.from("teachers_matrons").select("school_id, name").eq("phone", fromPhone.replace(/^\+/, "")).single();
    if (error || !data) {
      console.log(`[Webhook] Matron not found for phone: ${fromPhone}`);
      return null;
    }
    return { schoolId: data.school_id, matronName: data.name };
  } catch (err) {
    console.error("[Webhook] Error fetching matron:", err);
    return null;
  }
}

async function sendWhatsAppMessage(toPhone: string, message: string): Promise<boolean> {
  try {
    // Ensure phone number has the + prefix for WhatsApp API
    const formattedPhone = toPhone.startsWith('+') ? toPhone : `+${toPhone}`;

    console.log(`[Webhook] DEBUG - Token length: ${ACCESS_TOKEN?.length}, Phone ID: ${PHONE_NUMBER_ID}`);
    console.log(`[Webhook] Attempting to send message to ${formattedPhone}`);

    // Calculate appsecret_proof (HMAC-SHA256 of access token using app secret)
    const encoder = new TextEncoder();
    const keyBuffer = encoder.encode(APP_SECRET!);
    const key = await crypto.subtle.importKey("raw", keyBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const messageBuffer = encoder.encode(ACCESS_TOKEN!);
    const hashBuffer = await crypto.subtle.sign("HMAC", key, messageBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const appsecretProof = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages?appsecret_proof=${appsecretProof}`;
    console.log(`[Webhook] API URL: ${url}`);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Authorization": `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to: formattedPhone, type: "text", text: { preview_url: false, body: message } }),
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
      default: return "❌ Command not recognized.\n\nTry: CHECK ID [student_id]\nISSUE PAD [student_id] [FREE|PAID]\nDEPOSIT [amount]\nREPORT [DAILY|CYCLE]";
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
  const messageText = message.text?.body;
  if (!messageText) return { statusCode: 200, body: "ok" };
  console.log(`[Webhook] Message from ${fromPhone}: ${messageText}`);
  const matronSchool = await getMatronSchool(fromPhone);
  if (!matronSchool) {
    await sendWhatsAppMessage(fromPhone, "❌ You are not registered as a PAD KÓLÓ matron. Please contact your administrator.");
    return { statusCode: 200, body: "ok" };
  }
  const command = parseCommand(messageText);
  if (!command) {
    await sendWhatsAppMessage(fromPhone, "❌ Command not recognized.\n\nTry:\nCHECK ID [student_id]\nISSUE PAD [student_id] [FREE|PAID]\nDEPOSIT [amount]\nREPORT [DAILY|CYCLE]");
    return { statusCode: 200, body: "ok" };
  }
  const response = await executeCommand(command, matronSchool.schoolId, fromPhone);
  await sendWhatsAppMessage(fromPhone, response);
  return { statusCode: 200, body: "ok" };
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
