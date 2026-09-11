-- VAGIN Notifications System
-- Tracks all notifications sent to admins, matrons, and stakeholders
-- ═════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS vagin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('admin', 'matron', 'sponsor')),
  recipient_id uuid,
  recipient_phone TEXT,
  recipient_email TEXT,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'low_inventory',
    'payment_reminder',
    'cycle_completion',
    'enrollment_milestone',
    'revenue_milestone',
    'admin_alert',
    'system_update'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'dashboard')),
  school_id uuid REFERENCES vagin_schools(id) ON DELETE CASCADE,
  data JSONB,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Notification preferences (user can opt in/out)
CREATE TABLE IF NOT EXISTS vagin_notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('admin', 'matron')),
  low_inventory_whatsapp BOOLEAN DEFAULT true,
  payment_reminder_whatsapp BOOLEAN DEFAULT true,
  cycle_completion_whatsapp BOOLEAN DEFAULT true,
  admin_alerts_email BOOLEAN DEFAULT true,
  weekly_digest_email BOOLEAN DEFAULT true,
  daily_digest_email BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Notification triggers (automation rules)
CREATE TABLE IF NOT EXISTS vagin_notification_triggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES vagin_schools(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'low_pad_inventory',
    'payment_overdue',
    'cycle_completion',
    'enrollment_target',
    'revenue_target'
  )),
  threshold_value INTEGER,
  is_active BOOLEAN DEFAULT true,
  notify_admin BOOLEAN DEFAULT true,
  notify_matron BOOLEAN DEFAULT true,
  last_triggered TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Daily digest queue
CREATE TABLE IF NOT EXISTS vagin_digest_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('admin', 'matron')),
  recipient_id uuid,
  recipient_email TEXT,
  digest_type TEXT NOT NULL CHECK (digest_type IN ('daily', 'weekly')),
  school_id uuid REFERENCES vagin_schools(id) ON DELETE CASCADE,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE vagin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vagin_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE vagin_notification_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vagin_digest_queue ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "admin_view_all_notifications" ON vagin_notifications
  FOR SELECT USING (true);

CREATE POLICY "admin_manage_notifications" ON vagin_notifications
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "users_view_own_preferences" ON vagin_notification_preferences
  FOR SELECT USING (true);

CREATE POLICY "users_manage_own_preferences" ON vagin_notification_preferences
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "enable_triggers_all" ON vagin_notification_triggers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "enable_digest_queue_all" ON vagin_digest_queue
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_vagin_notifications_recipient_type ON vagin_notifications(recipient_type);
CREATE INDEX idx_vagin_notifications_notification_type ON vagin_notifications(notification_type);
CREATE INDEX idx_vagin_notifications_status ON vagin_notifications(status);
CREATE INDEX idx_vagin_notifications_school_id ON vagin_notifications(school_id);
CREATE INDEX idx_vagin_notifications_created_at ON vagin_notifications(created_at DESC);
CREATE INDEX idx_vagin_notification_preferences_user_id ON vagin_notification_preferences(user_id);
CREATE INDEX idx_vagin_notification_triggers_school_id ON vagin_notification_triggers(school_id);
CREATE INDEX idx_vagin_notification_triggers_active ON vagin_notification_triggers(is_active);
CREATE INDEX idx_vagin_digest_queue_recipient_email ON vagin_digest_queue(recipient_email);
CREATE INDEX idx_vagin_digest_queue_sent ON vagin_digest_queue(sent);
