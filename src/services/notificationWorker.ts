/**
 * Notification Worker Service
 * Processes pending notifications and sends them via appropriate channels
 *
 * This can run as:
 * 1. A Supabase Edge Function (scheduled)
 * 2. A background job in your server
 * 3. A cron job that calls an endpoint
 */

import { supabase } from "@/lib/supabase";

export interface NotificationWorkerResult {
  success: boolean;
  processed: number;
  sent: number;
  failed: number;
  errors: Array<{ notificationId: string; error: string }>;
}

export class NotificationWorker {
  /**
   * Main worker function - process all pending notifications
   */
  static async processPendingNotifications(): Promise<NotificationWorkerResult> {
    const result: NotificationWorkerResult = {
      success: true,
      processed: 0,
      sent: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Fetch all pending notifications
      const { data: notifications, error } = await supabase
        .from("vagin_notifications")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true })
        .limit(100); // Process in batches

      if (error) throw error;
      if (!notifications || notifications.length === 0) {
        return result; // No pending notifications
      }

      result.processed = notifications.length;

      // Process each notification
      for (const notification of notifications) {
        try {
          const sendResult = await this.sendNotification(notification);

          if (sendResult.success) {
            // Mark as sent
            await this.markNotificationStatus(
              notification.id,
              "sent",
              sendResult.metadata
            );
            result.sent++;
          } else {
            // Mark as failed but keep it for retry
            await this.markNotificationStatus(
              notification.id,
              "failed",
              { reason: sendResult.error, retry_count: (notification.data?.retry_count || 0) + 1 }
            );
            result.failed++;
            result.errors.push({
              notificationId: notification.id,
              error: sendResult.error,
            });
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "Unknown error";
          result.failed++;
          result.errors.push({
            notificationId: notification.id,
            error: errorMsg,
          });
        }
      }

      return result;
    } catch (err) {
      result.success = false;
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      result.errors.push({ notificationId: "worker", error: errorMsg });
      return result;
    }
  }

  /**
   * Send a single notification via appropriate channel
   */
  private static async sendNotification(notification: any): Promise<{
    success: boolean;
    error?: string;
    metadata?: Record<string, any>;
  }> {
    try {
      switch (notification.channel) {
        case "whatsapp":
          return await this.sendWhatsAppNotification(notification);
        case "email":
          return await this.sendEmailNotification(notification);
        case "dashboard":
          // Dashboard notifications don't need to be "sent", just marked as created
          return { success: true, metadata: { channel: "dashboard" } };
        default:
          return {
            success: false,
            error: `Unknown channel: ${notification.channel}`,
          };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Send notification via WhatsApp Bot
   */
  private static async sendWhatsAppNotification(
    notification: any
  ): Promise<{ success: boolean; error?: string; metadata?: Record<string, any> }> {
    try {
      // Get recipient phone number (matron)
      let phoneNumber: string | null = null;

      if (notification.data?.phone) {
        phoneNumber = notification.data.phone;
      } else if (notification.school_id) {
        // Look up matron's phone for the school
        const { data: matron } = await supabase
          .from("vagin_matrons")
          .select("phone")
          .eq("school_id", notification.school_id)
          .maybeSingle();

        phoneNumber = matron?.phone || null;
      }

      if (!phoneNumber) {
        return {
          success: false,
          error: "No phone number found for WhatsApp recipient",
        };
      }

      // Send via WhatsApp API
      // This calls your WhatsApp bot endpoint
      const whatsappResponse = await this.callWhatsAppAPI(
        phoneNumber,
        notification.title,
        notification.message
      );

      if (!whatsappResponse.success) {
        return {
          success: false,
          error: whatsappResponse.error || "WhatsApp API failed",
        };
      }

      return {
        success: true,
        metadata: {
          channel: "whatsapp",
          phone: phoneNumber,
          message_id: whatsappResponse.messageId,
        },
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "WhatsApp error";
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Send notification via Email (Resend)
   */
  private static async sendEmailNotification(
    notification: any
  ): Promise<{ success: boolean; error?: string; metadata?: Record<string, any> }> {
    try {
      // Get recipient email
      let email: string | null = notification.data?.email || null;

      if (!email && notification.school_id) {
        // Look up matron's email for the school
        const { data: matron } = await supabase
          .from("vagin_matrons")
          .select("email")
          .eq("school_id", notification.school_id)
          .maybeSingle();

        email = matron?.email || null;
      }

      if (!email) {
        return {
          success: false,
          error: "No email address found for recipient",
        };
      }

      // Send via Resend API
      const emailResponse = await this.callResendAPI(
        email,
        notification.title,
        notification.message
      );

      if (!emailResponse.success) {
        return {
          success: false,
          error: emailResponse.error || "Email API failed",
        };
      }

      return {
        success: true,
        metadata: {
          channel: "email",
          recipient: email,
          message_id: emailResponse.messageId,
        },
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Email error";
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Call WhatsApp Bot API (placeholder - implement with your bot endpoint)
   */
  private static async callWhatsAppAPI(
    phoneNumber: string,
    title: string,
    message: string
  ): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
      // TODO: Replace with your actual WhatsApp bot API endpoint
      const botEndpoint = process.env.REACT_APP_WHATSAPP_BOT_API || "";
      const apiKey = process.env.WHATSAPP_BOT_API_KEY || "";

      if (!botEndpoint) {
        return {
          success: false,
          error: "WhatsApp bot endpoint not configured",
        };
      }

      const response = await fetch(botEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          phone: phoneNumber,
          message: `${title}\n\n${message}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        return {
          success: false,
          error: `WhatsApp API error: ${response.status} - ${errorData}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.messageId || data.id,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Request failed";
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Call Resend Email API (placeholder - implement with Resend)
   */
  private static async callResendAPI(
    email: string,
    title: string,
    message: string
  ): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
      // TODO: Replace with your actual Resend API implementation
      const resendApiKey = process.env.RESEND_API_KEY || "";

      if (!resendApiKey) {
        return {
          success: false,
          error: "Resend API key not configured",
        };
      }

      // Example: Call Resend API
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
          html: `<h1>${title}</h1><p>${message}</p>`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        return {
          success: false,
          error: `Resend API error: ${response.status} - ${errorData}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.id,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Request failed";
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Mark notification with new status and metadata
   */
  private static async markNotificationStatus(
    notificationId: string,
    status: "sent" | "failed",
    metadata?: Record<string, any>
  ) {
    const { error } = await supabase
      .from("vagin_notifications")
      .update({
        status,
        data: metadata ? metadata : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", notificationId);

    if (error) {
      console.error(`Failed to update notification ${notificationId}:`, error);
      throw error;
    }
  }

  /**
   * Retry failed notifications (configurable retry logic)
   */
  static async retryFailedNotifications(
    maxRetries: number = 3
  ): Promise<NotificationWorkerResult> {
    const result: NotificationWorkerResult = {
      success: true,
      processed: 0,
      sent: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Fetch failed notifications that haven't exceeded max retries
      const { data: notifications, error } = await supabase
        .from("vagin_notifications")
        .select("*")
        .eq("status", "failed")
        .lt("data->>'retry_count'", maxRetries.toString())
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) throw error;
      if (!notifications || notifications.length === 0) {
        return result;
      }

      result.processed = notifications.length;

      // Retry each failed notification
      for (const notification of notifications) {
        try {
          const sendResult = await this.sendNotification(notification);

          if (sendResult.success) {
            await this.markNotificationStatus(
              notification.id,
              "sent",
              sendResult.metadata
            );
            result.sent++;
          } else {
            // Increment retry count
            const retryCount = (notification.data?.retry_count || 0) + 1;
            if (retryCount < maxRetries) {
              await this.markNotificationStatus(
                notification.id,
                "failed",
                { reason: sendResult.error, retry_count: retryCount }
              );
            }
            result.failed++;
          }
        } catch (err) {
          result.failed++;
        }
      }

      return result;
    } catch (err) {
      result.success = false;
      return result;
    }
  }

  /**
   * Get worker statistics
   */
  static async getWorkerStats() {
    try {
      const { data, error } = await supabase
        .from("vagin_notifications")
        .select("status, COUNT(*)")
        .group_by("status");

      if (error) throw error;

      const stats = {
        pending: 0,
        sent: 0,
        failed: 0,
        read: 0,
      };

      data?.forEach((row: any) => {
        stats[row.status as keyof typeof stats] = row.count || 0;
      });

      return stats;
    } catch (err) {
      console.error("Failed to get worker stats:", err);
      return null;
    }
  }
}
