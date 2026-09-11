import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  Bell,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Users,
  X,
  Filter,
  MoreVertical,
} from "lucide-react";

const VAGIN_PURPLE = "#62017F";
const PAD_KOLO_PINK = "#ED155D";
const GOLD = "#D97706";
const SUCCESS_GREEN = "#10B981";
const WARNING_ORANGE = "#F59E0B";
const DARK_BG = "rgba(26,26,26,0.6)";
const LIGHT_TEXT = "#F3F4F6";

interface Notification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  channel: "whatsapp" | "email" | "dashboard";
  status: "pending" | "sent" | "failed" | "read";
  school_id?: string;
  data: Record<string, any>;
  created_at: string;
  recipient_type: "admin" | "matron" | "sponsor";
}

type FilterType = "all" | "unread" | "alerts" | "reminders" | "completions";

export default function VAGINNotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await supabase
          .from("vagin_notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        setNotifications(data || []);
        const unread = (data || []).filter((n) => n.status === "pending").length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel("vagin_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "vagin_notifications" },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Mark as read
  const markAsRead = async (id: string) => {
    await supabase
      .from("vagin_notifications")
      .update({ status: "read" })
      .eq("id", id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "read" } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    await supabase.from("vagin_notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Filter notifications
  const filtered = notifications.filter((n) => {
    if (filter === "unread") return n.status === "pending";
    if (filter === "alerts") return n.notification_type === "low_inventory";
    if (filter === "reminders") return n.notification_type === "payment_reminder";
    if (filter === "completions") return n.notification_type === "cycle_completion";
    return true;
  });

  // Get icon and color for notification type
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "low_inventory":
        return {
          icon: AlertCircle,
          color: WARNING_ORANGE,
          bgColor: "rgba(245,158,11,0.1)",
          borderColor: WARNING_ORANGE,
          label: "🚨 Inventory Alert",
        };
      case "payment_reminder":
        return {
          icon: AlertCircle,
          color: PAD_KOLO_PINK,
          bgColor: "rgba(237,21,93,0.1)",
          borderColor: PAD_KOLO_PINK,
          label: "💰 Payment Reminder",
        };
      case "cycle_completion":
        return {
          icon: CheckCircle,
          color: SUCCESS_GREEN,
          bgColor: "rgba(16,185,129,0.1)",
          borderColor: SUCCESS_GREEN,
          label: "✅ Cycle Completed",
        };
      case "enrollment_milestone":
        return {
          icon: Users,
          color: VAGIN_PURPLE,
          bgColor: "rgba(98,1,127,0.1)",
          borderColor: VAGIN_PURPLE,
          label: "📈 Enrollment Milestone",
        };
      case "revenue_milestone":
        return {
          icon: TrendingUp,
          color: GOLD,
          bgColor: "rgba(217,119,6,0.1)",
          borderColor: GOLD,
          label: "💵 Revenue Milestone",
        };
      default:
        return {
          icon: Bell,
          color: LIGHT_TEXT,
          bgColor: "rgba(243,244,246,0.1)",
          borderColor: "rgba(243,244,246,0.3)",
          label: "📬 Notification",
        };
    }
  };

  if (loading) {
    return (
      <div
        style={{
          background: DARK_BG,
          backdropFilter: "blur(12px)",
          minHeight: "400px",
          padding: "40px 20px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: LIGHT_TEXT }}>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: DARK_BG,
        backdropFilter: "blur(12px)",
        borderRadius: "12px",
        padding: "20px",
        color: LIGHT_TEXT,
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          paddingBottom: "16px",
          borderBottom: `1px solid rgba(98,1,127,0.2)`,
        }}
      >
        <div>
          <h3 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
            🔔 Notifications
          </h3>
          <p style={{ fontSize: "12px", opacity: 0.6, margin: "4px 0 0 0" }}>
            {unreadCount} unread
          </p>
        </div>
        <div
          style={{
            background: PAD_KOLO_PINK,
            color: "white",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          {unreadCount}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          overflowX: "auto",
          paddingBottom: "8px",
        }}
      >
        {[
          { key: "all", label: "All" },
          { key: "unread", label: "Unread" },
          { key: "alerts", label: "Alerts" },
          { key: "reminders", label: "Reminders" },
          { key: "completions", label: "Completed" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as FilterType)}
            style={{
              padding: "6px 12px",
              background:
                filter === f.key
                  ? VAGIN_PURPLE
                  : "rgba(243,244,246,0.1)",
              border:
                filter === f.key
                  ? `1px solid ${VAGIN_PURPLE}`
                  : "1px solid rgba(243,244,246,0.2)",
              borderRadius: "20px",
              color: LIGHT_TEXT,
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {f.label}
          </button>
        ))}
      </motion.div>

      {/* Notifications List */}
      <AnimatePresence>
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              textAlign: "center",
              padding: "40px 20px",
              opacity: 0.6,
            }}
          >
            <Bell size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <p>No notifications in this category</p>
          </motion.div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.map((notif) => {
              const style = getNotificationStyle(notif.notification_type);
              const Icon = style.icon;

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => markAsRead(notif.id)}
                  style={{
                    background: style.bgColor,
                    border: `1px solid ${style.borderColor}`,
                    borderRadius: "8px",
                    padding: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    opacity: notif.status === "read" ? 0.6 : 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                    }}
                  >
                    {/* Icon */}
                    <div
                      style={{
                        color: style.color,
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    >
                      <Icon size={18} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "8px",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              margin: "0 0 4px 0",
                              color: style.color,
                            }}
                          >
                            {style.label}
                          </p>
                          <p
                            style={{
                              fontSize: "12px",
                              margin: 0,
                              opacity: 0.8,
                              wordBreak: "break-word",
                            }}
                          >
                            {notif.title}
                          </p>
                          <p
                            style={{
                              fontSize: "11px",
                              margin: "4px 0 0 0",
                              opacity: 0.6,
                            }}
                          >
                            {notif.message}
                          </p>
                        </div>

                        {/* Channel Badge + Timestamp */}
                        <div style={{ flexShrink: 0, textAlign: "right" }}>
                          <span
                            style={{
                              fontSize: "9px",
                              background: "rgba(243,244,246,0.1)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              display: "inline-block",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {notif.channel === "whatsapp" ? "📱" : "📧"}
                          </span>
                          <p style={{ fontSize: "10px", margin: "4px 0 0 0", opacity: 0.5 }}>
                            {new Date(notif.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {notif.status === "pending" && (
                        <div
                          style={{
                            marginTop: "8px",
                            fontSize: "10px",
                            color: WARNING_ORANGE,
                          }}
                        >
                          ⏳ Pending delivery
                        </div>
                      )}
                      {notif.status === "failed" && (
                        <div style={{ marginTop: "8px", fontSize: "10px", color: PAD_KOLO_PINK }}>
                          ⚠️ Failed to send
                        </div>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "rgba(243,244,246,0.5)",
                        cursor: "pointer",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = PAD_KOLO_PINK;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "rgba(243,244,246,0.5)";
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Stats */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: `1px solid rgba(98,1,127,0.2)`,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "12px",
            fontSize: "12px",
          }}
        >
          <div>
            <p style={{ opacity: 0.6, margin: 0 }}>Total</p>
            <p style={{ fontSize: "16px", fontWeight: 700, margin: "2px 0 0 0" }}>
              {notifications.length}
            </p>
          </div>
          <div>
            <p style={{ opacity: 0.6, margin: 0 }}>Sent</p>
            <p style={{ fontSize: "16px", fontWeight: 700, margin: "2px 0 0 0", color: SUCCESS_GREEN }}>
              {notifications.filter((n) => n.status === "sent").length}
            </p>
          </div>
          <div>
            <p style={{ opacity: 0.6, margin: 0 }}>Failed</p>
            <p style={{ fontSize: "16px", fontWeight: 700, margin: "2px 0 0 0", color: PAD_KOLO_PINK }}>
              {notifications.filter((n) => n.status === "failed").length}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
