/**
 * Supabase Edge Function: Process Pending Notifications
 *
 * This function processes all pending notifications and sends them via
 * WhatsApp, Email, or Dashboard channels.
 *
 * Deployment:
 * supabase functions deploy process-notifications
 *
 * Scheduling:
 * Set up a cron job in Supabase to call this function every 5 minutes
 * supabase functions deploy process-notifications --create-schedule "0 */5 * * * *"
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const whatsappBotApiKey = Deno.env.get("WHATSAPP_BOT_API_KEY") || "";
const whatsappBotApiUrl = Deno.env.get("WHATSAPP_BOT_API_URL") || "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";

interface NotificationRecord {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  channel: "whatsapp" | "email" | "dashboard";
  recipient_type: string;
  school_id?: string;
  data?: Record<string, any>;
  created_at: string;
}

interface ProcessResult {
  success: boolean;
  processed: number;
  sent: number;
  failed: number;
  errors: string[];
  timestamp: string;
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Send WhatsApp notification
 */
async function sendWhatsApp(
  phone: string,
  title: string,
  message: string,
  notificationId: string
): Promise<boolean> {
  try {
    if (!whatsappBotApiUrl) {
      console.error("WhatsApp API URL not configured");
      return false;
    }

    const response = await fetch(whatsappBotApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${whatsappBotApiKey}`,
      },
      body: JSON.stringify({
        phone,
        message: `${title}\n\n${message}`,
        notificationId,
      }),
    });

    if (!response.ok) {
      console.error(
        `WhatsApp send failed for ${phone}:`,
        response.status,
        await response.text()
      );
      return false;
    }

    console.log(`WhatsApp sent to ${phone}`);
    return true;
  } catch (error) {
    console.error(`WhatsApp error for ${phone}:`, error);
    return false;
  }
}

/**
 * Send Email notification
 */
async function sendEmail(
  email: string,
  title: string,
  message: string,
  notificationId: string
): Promise<boolean> {
  try {
    if (!resendApiKey) {
      console.error("Resend API key not configured");
      return false;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "notifications@vagin.org",
        to: email,
        subject: title,
        html: `
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(message)}</p>
          <hr />
          <p style="font-size: 12px; color: #666;">
            Notification ID: ${notificationId}
          </p>
        `,
      }),
    });

    if (!response.ok) {
      console.error(
        `Email send failed for ${email}:`,
        response.status,
        await response.text()
      );
      return false;
    }

    console.log(`Email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`Email error for ${email}:`, error);
    return false;
  }
}

/**
 * Get phone/email for notification recipient
 */
async function getRecipientContact(
  notificationType: string,
  schoolId?: string
): Promise<{ phone?: string; email?: string } | null> {
  try {
    if (!schoolId) return null;

    // Get matron for the school
    const { data: matron, error } = await supabase
      .from("vagin_matrons")
      .select("phone, email")
      .eq("school_id", schoolId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching matron:", error);
      return null;
    }

    return matron || null;
  } catch (error) {
    console.error("Error getting recipient contact:", error);
    return null;
  }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Process a single notification
 */
async function processNotification(
  notification: NotificationRecord
): Promise<boolean> {
  try {
    // Get contact info for the recipient
    let sent = false;

    switch (notification.channel) {
      case "whatsapp": {
        const contact = await getRecipientContact(
          notification.notification_type,
          notification.school_id
        );
        if (contact?.phone) {
          sent = await sendWhatsApp(
            contact.phone,
            notification.title,
            notification.message,
            notification.id
          );
        }
        break;
      }

      case "email": {
        const contact = await getRecipientContact(
          notification.notification_type,
          notification.school_id
        );
        if (contact?.email) {
          sent = await sendEmail(
            contact.email,
            notification.title,
            notification.message,
            notification.id
          );
        }
        break;
      }

      case "dashboard": {
        // Dashboard notifications don't need to be sent, just mark as sent
        sent = true;
        break;
      }

      default:
        console.error(`Unknown channel: ${notification.channel}`);
    }

    // Update notification status
    if (sent) {
      await supabase
        .from("vagin_notifications")
        .update({
          status: "sent",
          updated_at: new Date().toISOString(),
        })
        .eq("id", notification.id);
    } else {
      // Increment retry count
      const retryCount = (notification.data?.retry_count || 0) + 1;
      await supabase
        .from("vagin_notifications")
        .update({
          status: "failed",
          data: {
            ...notification.data,
            retry_count: retryCount,
            last_error: "Send failed",
            last_attempt: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", notification.id);
    }

    return sent;
  } catch (error) {
    console.error(`Error processing notification ${notification.id}:`, error);
    return false;
  }
}

/**
 * Main handler
 */
serve(async (req) => {
  try {
    // Verify the request is from Supabase scheduler or authorized source
    const authHeader = req.headers.get("authorization") || "";
    if (authHeader && !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    console.log("🔔 Processing pending notifications...");

    // Fetch pending notifications (limit to 100 per run)
    const { data: notifications, error: fetchError } = await supabase
      .from("vagin_notifications")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(100);

    if (fetchError) {
      throw new Error(`Failed to fetch notifications: ${fetchError.message}`);
    }

    const result: ProcessResult = {
      success: true,
      processed: notifications?.length || 0,
      sent: 0,
      failed: 0,
      errors: [],
      timestamp: new Date().toISOString(),
    };

    // Process each notification
    if (notifications && notifications.length > 0) {
      for (const notification of notifications) {
        const sent = await processNotification(notification);
        if (sent) {
          result.sent++;
        } else {
          result.failed++;
          result.errors.push(`Failed to send notification ${notification.id}`);
        }
      }
    }

    console.log("✅ Notification processing complete:", {
      processed: result.processed,
      sent: result.sent,
      failed: result.failed,
    });

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Notification worker error:", errorMessage);

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
