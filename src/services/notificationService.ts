/**
 * Notification Service
 * Handles creation and management of notifications across the VAGIN system
 */

import { supabase } from "@/lib/supabase";

export interface CreateNotificationParams {
  notification_type: "low_inventory" | "payment_reminder" | "cycle_completion" | "alert" | "reminder" | "new_school" | "payment_received" | "distribution_complete";
  title: string;
  message: string;
  channel: "whatsapp" | "email" | "dashboard";
  recipient_type: "admin" | "matron" | "sponsor";
  school_id?: string;
  data?: Record<string, any>;
}

export class NotificationService {
  /**
   * Create a single notification
   */
  static async createNotification(params: CreateNotificationParams) {
    try {
      const { data, error } = await supabase
        .from("vagin_notifications")
        .insert({
          notification_type: params.notification_type,
          title: params.title,
          message: params.message,
          channel: params.channel,
          recipient_type: params.recipient_type,
          school_id: params.school_id,
          data: params.data || {},
          status: "pending",
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;
      return { success: true, data: data?.[0] };
    } catch (error) {
      console.error("Failed to create notification:", error);
      return { success: false, error };
    }
  }

  /**
   * Create multiple notifications (for batch operations)
   */
  static async createNotifications(
    notifications: CreateNotificationParams[]
  ) {
    try {
      const payload = notifications.map((n) => ({
        notification_type: n.notification_type,
        title: n.title,
        message: n.message,
        channel: n.channel,
        recipient_type: n.recipient_type,
        school_id: n.school_id,
        data: n.data || {},
        status: "pending",
        created_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from("vagin_notifications")
        .insert(payload)
        .select();

      if (error) throw error;
      return { success: true, data, count: data?.length || 0 };
    } catch (error) {
      console.error("Failed to create notifications:", error);
      return { success: false, error };
    }
  }

  /**
   * Trigger: Low Inventory Alert
   * Called when pad inventory falls below threshold
   */
  static async triggerLowInventoryAlert(schoolId: string, padCount: number, threshold: number = 50) {
    const { data: school } = await supabase
      .from("vagin_schools")
      .select("name")
      .eq("id", schoolId)
      .single();

    if (!school) return;

    return this.createNotifications([
      {
        notification_type: "low_inventory",
        title: "🚨 Inventory Alert: Low Pad Stock",
        message: `Pad inventory at ${school.name} is running low. Only ${padCount} pads remaining. Please reorder soon.`,
        channel: "dashboard",
        recipient_type: "admin",
        school_id: schoolId,
        data: { pad_count: padCount, threshold },
      },
      {
        notification_type: "low_inventory",
        title: "📦 Low Stock Warning",
        message: `Stock at your school is low (${padCount} units). Suggested reorder: ${Math.max(500 - padCount, 0)} units.`,
        channel: "whatsapp",
        recipient_type: "matron",
        school_id: schoolId,
        data: { pad_count: padCount, threshold },
      },
    ]);
  }

  /**
   * Trigger: Payment Reminder
   * Called when payment is overdue or due soon
   */
  static async triggerPaymentReminder(
    schoolId: string,
    outstandingAmount: number,
    daysOverdue?: number
  ) {
    const { data: school } = await supabase
      .from("vagin_schools")
      .select("name")
      .eq("id", schoolId)
      .single();

    if (!school) return;

    const isOverdue = daysOverdue && daysOverdue > 0;
    const dueText = isOverdue ? `${daysOverdue} days overdue` : "due by end of month";

    return this.createNotifications([
      {
        notification_type: "payment_reminder",
        title: "💰 Payment Reminder: Outstanding Balance",
        message: `Payment reminder for ${school.name}. Outstanding balance: ₦${outstandingAmount.toLocaleString()}. ${dueText}.`,
        channel: "email",
        recipient_type: "matron",
        school_id: schoolId,
        data: { outstanding_amount: outstandingAmount, days_overdue: daysOverdue },
      },
      {
        notification_type: "payment_reminder",
        title: "💳 Payment Alert",
        message: `${school.name} has outstanding payment: ₦${outstandingAmount.toLocaleString()}. Please process payment immediately.`,
        channel: "dashboard",
        recipient_type: "admin",
        school_id: schoolId,
        data: { outstanding_amount: outstandingAmount, days_overdue: daysOverdue },
      },
    ]);
  }

  /**
   * Trigger: Cycle Completion
   * Called when a 3-month cycle is completed
   */
  static async triggerCycleCompletion(
    schoolId: string,
    girlsParticipated: number,
    startDate: string,
    endDate: string
  ) {
    const { data: school } = await supabase
      .from("vagin_schools")
      .select("name")
      .eq("id", schoolId)
      .single();

    if (!school) return;

    return this.createNotifications([
      {
        notification_type: "cycle_completion",
        title: "✅ Cycle Completed: " + school.name,
        message: `Congratulations! Students at ${school.name} have completed their 3-month pad cycle. ${girlsParticipated} girls participated.`,
        channel: "dashboard",
        recipient_type: "admin",
        school_id: schoolId,
        data: { girls_participated: girlsParticipated, start_date: startDate, end_date: endDate },
      },
      {
        notification_type: "cycle_completion",
        title: "🎉 Cycle Complete",
        message: `Your school's 3-month cycle is complete! ${girlsParticipated} girls participated. Great work!`,
        channel: "whatsapp",
        recipient_type: "matron",
        school_id: schoolId,
        data: { girls_participated: girlsParticipated, start_date: startDate, end_date: endDate },
      },
    ]);
  }

  /**
   * Trigger: New School Registration
   * Called when a new school is added
   */
  static async triggerNewSchoolRegistration(
    schoolId: string,
    schoolName: string,
    country: string
  ) {
    return this.createNotification({
      notification_type: "alert",
      title: "🆕 New School Registered",
      message: `New school added: ${schoolName} (${country}). Assigned ID: ${schoolId}. Review and assign matron.`,
      channel: "dashboard",
      recipient_type: "admin",
      school_id: schoolId,
      data: { school_name: schoolName, country },
    });
  }

  /**
   * Trigger: Payment Received
   * Called when payment is successfully processed
   */
  static async triggerPaymentReceived(
    schoolId: string,
    amount: number,
    paymentMethod: string
  ) {
    const { data: school } = await supabase
      .from("vagin_schools")
      .select("name")
      .eq("id", schoolId)
      .single();

    if (!school) return;

    return this.createNotifications([
      {
        notification_type: "payment_received",
        title: "💳 Payment Processed",
        message: `Payment of ₦${amount.toLocaleString()} from ${school.name} has been successfully processed via ${paymentMethod}. Thank you!`,
        channel: "dashboard",
        recipient_type: "admin",
        school_id: schoolId,
        data: { amount, payment_method: paymentMethod },
      },
      {
        notification_type: "payment_received",
        title: "✅ Payment Confirmed",
        message: `We received your payment of ₦${amount.toLocaleString()}. Your account has been updated.`,
        channel: "whatsapp",
        recipient_type: "matron",
        school_id: schoolId,
        data: { amount, payment_method: paymentMethod },
      },
    ]);
  }

  /**
   * Trigger: Distribution Complete
   * Called when pad distribution is completed
   */
  static async triggerDistributionComplete(
    schoolId: string,
    girlsCount: number,
    padsDistributed: number
  ) {
    const { data: school } = await supabase
      .from("vagin_schools")
      .select("name")
      .eq("id", schoolId)
      .single();

    if (!school) return;

    return this.createNotifications([
      {
        notification_type: "reminder",
        title: "📦 Distribution Completed",
        message: `Pad distribution completed at ${school.name}. ${padsDistributed} pads distributed to ${girlsCount} girls.`,
        channel: "dashboard",
        recipient_type: "admin",
        school_id: schoolId,
        data: { girls_count: girlsCount, pads_distributed: padsDistributed },
      },
      {
        notification_type: "reminder",
        title: "🎁 Pads Distributed",
        message: `${padsDistributed} pads have been distributed at your school. Distribute to ${girlsCount} girls.`,
        channel: "whatsapp",
        recipient_type: "matron",
        school_id: schoolId,
        data: { girls_count: girlsCount, pads_distributed: padsDistributed },
      },
    ]);
  }

  /**
   * Trigger: System Alert
   * Called for critical system issues
   */
  static async triggerSystemAlert(
    title: string,
    message: string,
    severity: "low" | "medium" | "high" = "medium"
  ) {
    return this.createNotification({
      notification_type: "alert",
      title: `⚠️ ${title}`,
      message,
      channel: "dashboard",
      recipient_type: "admin",
      data: { severity },
    });
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from("vagin_notifications")
        .update({ status: "read" })
        .eq("id", notificationId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      return { success: false, error };
    }
  }

  /**
   * Mark notification as sent
   */
  static async markAsSent(notificationId: string) {
    try {
      const { error } = await supabase
        .from("vagin_notifications")
        .update({ status: "sent" })
        .eq("id", notificationId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Failed to mark notification as sent:", error);
      return { success: false, error };
    }
  }

  /**
   * Mark notification as failed
   */
  static async markAsFailed(notificationId: string, reason?: string) {
    try {
      const { error } = await supabase
        .from("vagin_notifications")
        .update({
          status: "failed",
          data: reason ? { failure_reason: reason } : undefined,
        })
        .eq("id", notificationId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Failed to mark notification as failed:", error);
      return { success: false, error };
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string) {
    try {
      const { error } = await supabase
        .from("vagin_notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Failed to delete notification:", error);
      return { success: false, error };
    }
  }
}
