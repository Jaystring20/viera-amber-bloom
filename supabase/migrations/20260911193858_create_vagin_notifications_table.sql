-- Create vagin_notifications table
CREATE TABLE IF NOT EXISTS vagin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('low_inventory', 'payment_reminder', 'cycle_completion', 'alert', 'reminder')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('whatsapp', 'email', 'dashboard')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),
  school_id UUID REFERENCES vagin_schools(id) ON DELETE SET NULL,
  recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('admin', 'matron', 'sponsor')),
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_vagin_notifications_created_at ON vagin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vagin_notifications_status ON vagin_notifications(status);
CREATE INDEX IF NOT EXISTS idx_vagin_notifications_recipient_type ON vagin_notifications(recipient_type);

-- Add sample notification data
INSERT INTO vagin_notifications (notification_type, title, message, channel, status, recipient_type, created_at)
VALUES
  ('low_inventory', '🚨 Inventory Alert: Low Pad Stock', 'Pad inventory at Lagos Comprehensive School is running low. Only 45 pads remaining. Please reorder soon.', 'dashboard', 'pending', 'admin', NOW() - INTERVAL '2 hours'),
  ('payment_reminder', '💰 Payment Reminder: Outstanding Balance', 'Payment reminder for Abuja High School. Outstanding balance: ₦45,000. Payment due by end of month.', 'email', 'sent', 'matron', NOW() - INTERVAL '1 day'),
  ('cycle_completion', '✅ Cycle Completed: Umuahia School', 'Congratulations! Students at Umuahia Secondary School have completed their 3-month pad cycle. 42 girls participated.', 'dashboard', 'read', 'admin', NOW() - INTERVAL '3 days'),
  ('alert', '⚠️ System Alert: Data Sync Failed', 'Failed to sync data from Ibadan school. Please check internet connection and retry.', 'dashboard', 'failed', 'admin', NOW() - INTERVAL '5 days'),
  ('reminder', '🔔 Monthly Report Due', 'Monthly impact report for Port Harcourt location is due tomorrow. Current status: 156 girls reached, ₦78,400 collected.', 'email', 'pending', 'matron', NOW() - INTERVAL '4 hours'),
  ('low_inventory', '📦 Low Stock Warning: Kampala Center', 'Pad inventory at Kampala Community Center is low (28 units). Suggested reorder: 500 units.', 'dashboard', 'pending', 'admin', NOW() - INTERVAL '6 hours'),
  ('cycle_completion', '✅ Another Cycle Completed', 'The March-May cycle at Accra Academy has been marked complete with excellent participation (67 girls).', 'dashboard', 'read', 'admin', NOW() - INTERVAL '2 days'),
  ('payment_reminder', '💳 Payment Processed', 'Payment of ₦22,500 from Kano School has been successfully processed. Thank you!', 'dashboard', 'read', 'admin', NOW() - INTERVAL '1 day');
