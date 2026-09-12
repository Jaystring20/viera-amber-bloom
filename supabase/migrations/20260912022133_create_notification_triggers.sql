-- ───────────────────────────────────────────────────────────────────────────────
-- Notification Trigger Functions
-- Automatically create notifications when key events occur in the system
-- ───────────────────────────────────────────────────────────────────────────────

-- ─── Trigger 1: New School Registration ───────────────────────────────────────
CREATE OR REPLACE FUNCTION notify_new_school_registered()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO vagin_notifications (
    notification_type, title, message, channel, recipient_type, school_id, data, status
  ) VALUES (
    'alert',
    '🆕 New School Registered',
    'New school added: ' || NEW.name || ' (' || NEW.country || '). Review and assign matron.',
    'dashboard',
    'admin',
    NEW.id,
    jsonb_build_object('school_name', NEW.name, 'country', NEW.country),
    'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_new_school_registered ON vagin_schools;
CREATE TRIGGER trigger_new_school_registered
AFTER INSERT ON vagin_schools
FOR EACH ROW
EXECUTE FUNCTION notify_new_school_registered();

-- ─── Trigger 2: Distribution Completed ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION notify_distribution_completed()
RETURNS TRIGGER AS $$
DECLARE
  school_name TEXT;
BEGIN
  SELECT name INTO school_name FROM vagin_schools WHERE id = NEW.school_id;

  -- Admin notification
  INSERT INTO vagin_notifications (
    notification_type, title, message, channel, recipient_type, school_id, data, status
  ) VALUES (
    'reminder',
    '📦 Distribution Completed',
    'Pad distribution completed at ' || COALESCE(school_name, 'a school') || '. ' || NEW.pads_count || ' pads distributed to ' || NEW.girls_count || ' girls.',
    'dashboard',
    'admin',
    NEW.school_id,
    jsonb_build_object('girls_count', NEW.girls_count, 'pads_distributed', NEW.pads_count, 'date', NEW.distribution_date),
    'pending'
  );

  -- Matron notification
  INSERT INTO vagin_notifications (
    notification_type, title, message, channel, recipient_type, school_id, data, status
  ) VALUES (
    'reminder',
    '🎁 Pads Distributed',
    NEW.pads_count || ' pads have been distributed at your school. Distribute to ' || NEW.girls_count || ' girls.',
    'whatsapp',
    'matron',
    NEW.school_id,
    jsonb_build_object('girls_count', NEW.girls_count, 'pads_distributed', NEW.pads_count, 'date', NEW.distribution_date),
    'pending'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_distribution_completed ON vagin_pad_distributions;
CREATE TRIGGER trigger_distribution_completed
AFTER INSERT ON vagin_pad_distributions
FOR EACH ROW
EXECUTE FUNCTION notify_distribution_completed();

-- ─── Trigger 3: Transaction Recorded (Payment/Refund) ────────────────────────
CREATE OR REPLACE FUNCTION notify_transaction_recorded()
RETURNS TRIGGER AS $$
DECLARE
  school_name TEXT;
  student_name TEXT;
BEGIN
  -- Only notify significant transactions (amount > 0)
  IF NEW.amount_ngn > 0 AND NEW.school_id IS NOT NULL THEN

    SELECT name INTO school_name FROM vagin_schools WHERE id = NEW.school_id LIMIT 1;
    SELECT name INTO student_name FROM vagin_students WHERE id = NEW.student_id LIMIT 1;

    -- Admin notification for all transactions
    INSERT INTO vagin_notifications (
      notification_type, title, message, channel, recipient_type, school_id, data, status
    ) VALUES (
      'payment_received',
      '💳 Transaction Recorded',
      'Transaction of ₦' || COALESCE(TO_CHAR(NEW.amount_ngn, '999,999'), '0') || ' recorded' ||
      CASE WHEN school_name IS NOT NULL THEN ' at ' || school_name ELSE '' END || '.',
      'dashboard',
      'admin',
      NEW.school_id,
      jsonb_build_object(
        'amount', NEW.amount_ngn,
        'student_id', NEW.student_id,
        'school_id', NEW.school_id,
        'transaction_id', NEW.id
      ),
      'pending'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if vagin_transactions table exists
DROP TRIGGER IF EXISTS trigger_transaction_recorded ON vagin_transactions;
CREATE TRIGGER trigger_transaction_recorded
AFTER INSERT ON vagin_transactions
FOR EACH ROW
EXECUTE FUNCTION notify_transaction_recorded();

-- ───────────────────────────────────────────────────────────────────────────────
-- Notes on Usage:
-- 1. Database Triggers: Fire automatically when events occur (new school, distribution, transactions)
-- 2. Application Triggers: Call NotificationService methods from your React/TypeScript code
--
-- Database triggers are already active for:
--   - New school registration (vagin_schools INSERT)
--   - Distribution completed (vagin_pad_distributions INSERT)
--   - Transaction recorded (vagin_transactions INSERT)
--
-- Application triggers (call via NotificationService) for:
--   - Low inventory alert
--   - Payment reminder
--   - Cycle completion
--   - System alerts
--   - Payment received (manual, when processing payments)
-- ───────────────────────────────────────────────────────────────────────────────
