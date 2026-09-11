import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WHATSAPP_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN")!;
const WHATSAPP_PHONE_ID = Deno.env.get("WHATSAPP_PHONE_ID")!;
const APP_SECRET = Deno.env.get("WHATSAPP_APP_SECRET")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface NotificationPayload {
  type: "low_inventory" | "payment_reminder" | "cycle_completion" | "admin_alert";
  school_id: string;
  school_name: string;
  matron_phone?: string;
  matron_email?: string;
  admin_email?: string;
  data: Record<string, any>;
}

// Send WhatsApp message
async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<boolean> {
  try {
    // Add + prefix if not present
    const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;

    // Calculate appsecret_proof
    const encoder = new TextEncoder();
    const keyBuffer = encoder.encode(APP_SECRET);
    const key = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const messageBuffer = encoder.encode(WHATSAPP_ACCESS_TOKEN);
    const hashBuffer = await crypto.subtle.sign("HMAC", key, messageBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const appsecretProof = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const url = `https://graph.instagram.com/v19.0/${WHATSAPP_PHONE_ID}/messages?appsecret_proof=${appsecretProof}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("WhatsApp error:", result);
      return false;
    }

    return true;
  } catch (error) {
    console.error("WhatsApp send failed:", error);
    return false;
  }
}

// Send email via Resend
async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string
): Promise<boolean> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "VAGIN Program <notifications@vagin-program.com>",
        to,
        subject,
        html: htmlContent,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Email send failed:", error);
    return false;
  }
}

// Create notification record
async function createNotification(
  type: string,
  recipientType: string,
  recipientPhone: string | null,
  recipientEmail: string | null,
  channel: string,
  schoolId: string,
  title: string,
  message: string,
  data: Record<string, any>
) {
  const { error } = await supabase.from("vagin_notifications").insert({
    notification_type: type,
    recipient_type: recipientType,
    recipient_phone: recipientPhone,
    recipient_email: recipientEmail,
    channel,
    school_id: schoolId,
    title,
    message,
    data,
    status: "pending",
  });

  if (error) console.error("Failed to create notification record:", error);
}

// Handle low inventory alerts
async function handleLowInventory(payload: NotificationPayload) {
  const { school_name, school_id, matron_phone, matron_email, data } = payload;
  const { current_pads, threshold } = data;

  // Matron WhatsApp notification
  if (matron_phone) {
    const message = `🚨 Low Pad Inventory Alert\n\n${school_name}: Only ${current_pads} pads remaining (threshold: ${threshold})\n\nPlease reorder immediately.\n\n- VAGIN Program`;
    const success = await sendWhatsAppMessage(matron_phone, message);

    await createNotification(
      "low_inventory",
      "matron",
      matron_phone,
      null,
      "whatsapp",
      school_id,
      "Low Pad Inventory",
      message,
      data
    );

    if (!success) {
      console.error(`Failed to send low inventory alert to ${matron_phone}`);
    }
  }

  // Admin email notification
  const adminEmail = await supabase.auth.admin.getUserById("admin");
  if (adminEmail) {
    const htmlContent = `
      <h2>Low Inventory Alert</h2>
      <p><strong>School:</strong> ${school_name}</p>
      <p><strong>Current Pads:</strong> ${current_pads}</p>
      <p><strong>Threshold:</strong> ${threshold}</p>
      <p>Please contact the school to reorder pads immediately.</p>
    `;

    await sendEmail(
      "admin@vagin-program.com",
      `Low Inventory Alert - ${school_name}`,
      htmlContent
    );

    await createNotification(
      "low_inventory",
      "admin",
      null,
      "admin@vagin-program.com",
      "email",
      school_id,
      "Low Pad Inventory Alert",
      `${school_name} has only ${current_pads} pads`,
      data
    );
  }
}

// Handle payment reminders
async function handlePaymentReminder(payload: NotificationPayload) {
  const { school_name, school_id, matron_phone, data } = payload;
  const { overdue_days, amount_due } = data;

  if (matron_phone) {
    const message = `💰 Payment Reminder\n\n${school_name}: Payment is ${overdue_days} days overdue.\n\nAmount Due: ₦${amount_due.toLocaleString()}\n\nPlease settle immediately.\n\n- VAGIN Program`;
    const success = await sendWhatsAppMessage(matron_phone, message);

    await createNotification(
      "payment_reminder",
      "matron",
      matron_phone,
      null,
      "whatsapp",
      school_id,
      "Payment Reminder",
      message,
      data
    );

    if (!success) {
      console.error(`Failed to send payment reminder to ${matron_phone}`);
    }
  }
}

// Handle cycle completion notifications
async function handleCycleCompletion(payload: NotificationPayload) {
  const { school_name, school_id, matron_phone, data } = payload;
  const { cycle_date, girls_count, pads_distributed } = data;

  if (matron_phone) {
    const message = `✅ Cycle Completion Recorded\n\n${school_name}\nDate: ${cycle_date}\nGirls: ${girls_count}\nPads Distributed: ${pads_distributed}\n\nThank you for your work!\n\n- VAGIN Program`;
    await sendWhatsAppMessage(matron_phone, message);

    await createNotification(
      "cycle_completion",
      "matron",
      matron_phone,
      null,
      "whatsapp",
      school_id,
      "Cycle Completed",
      message,
      data
    );
  }
}

// Handle admin alerts (dashboard)
async function handleAdminAlert(payload: NotificationPayload) {
  const { school_name, school_id, admin_email, data } = payload;
  const { alert_type, details } = data;

  // Create dashboard notification for admin
  await createNotification(
    "admin_alert",
    "admin",
    null,
    admin_email || "admin@vagin-program.com",
    "dashboard",
    school_id,
    `Alert: ${alert_type}`,
    `${school_name}: ${details}`,
    data
  );

  // Also send email for urgent alerts
  if (alert_type === "revenue_milestone" || alert_type === "enrollment_milestone") {
    const htmlContent = `
      <h2>${alert_type.replace(/_/g, " ")}</h2>
      <p><strong>School:</strong> ${school_name}</p>
      <p>${details}</p>
      <p><a href="https://vagin-dashboard.app/analytics">View Full Analytics</a></p>
    `;

    await sendEmail(
      admin_email || "admin@vagin-program.com",
      `${alert_type.replace(/_/g, " ")} - ${school_name}`,
      htmlContent
    );
  }
}

// Main handler
serve(async (req: Request) => {
  // Verify it's a POST request
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload: NotificationPayload = await req.json();

    console.log(`Processing notification: ${payload.type} for ${payload.school_name}`);

    // Route to appropriate handler
    switch (payload.type) {
      case "low_inventory":
        await handleLowInventory(payload);
        break;
      case "payment_reminder":
        await handlePaymentReminder(payload);
        break;
      case "cycle_completion":
        await handleCycleCompletion(payload);
        break;
      case "admin_alert":
        await handleAdminAlert(payload);
        break;
      default:
        console.warn(`Unknown notification type: ${payload.type}`);
    }

    return new Response(
      JSON.stringify({ success: true, type: payload.type }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Notification handler error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process notification" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
