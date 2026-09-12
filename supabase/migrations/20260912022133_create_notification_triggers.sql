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

-- ─── Trigger 3: Payment Received ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION notify_payment_received()
RETURNS TRIGGER AS $$
DECLARE
  school_name TEXT;
BEGIN
  -- Only notify if payment just transitioned to 'completed' or 'confirmed'
  IF (NEW.status = 'completed' OR NEW.status = 'confirmed')
     AND (OLD.status IS NULL OR (OLD.status != 'completed' AND OLD.status != 'confirmed')) THEN

    SELECT name INTO school_name FROM vagin_schools WHERE id = NEW.school_id;

    -- Admin notification
    INSERT INTO vagin_notifications (
      notification_type, title, message, channel, recipient_type, school_id, data, status
    ) VALUES (
      'payment_received',
      '💳 Payment Processed',
      'Payment of ₦' || TO_CHAR(NEW.amount, '999,999,999') || ' from ' || COALESCE(school_name, 'a school') || ' has been successfully processed. Thank you!',
      'dashboard',
      'admin',
      NEW.school_id,
      jsonb_build_object('amount', NEW.amount, 'payment_method', COALESCE(NEW.payment_method, 'unknown')),
      'pending'
    );

    -- Matron notification
    INSERT INTO vagin_notifications (
      notification_type, title, message, channel, recipient_type, school_id, data, status
    ) VALUES (
      'payment_received',
      '✅ Payment Confirmed',
      'We received your payment of ₦' || TO_CHAR(NEW.amount, '999,999,999') || '. Your account has been updated.',
      'whatsapp',
      'matron',
      NEW.school_id,
      jsonb_build_object('amount', NEW.amount, 'payment_method', COALESCE(NEW.payment_method, 'unknown')),
      'pending'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_payment_received ON vagin_payments;
CREATE TRIGGER trigger_payment_received
AFTER INSERT OR UPDATE ON vagin_payments
FOR EACH ROW
EXECUTE FUNCTION notify_payment_received();

-- ───────────────────────────────────────────────────────────────────────────────
-- Notes on Usage:
-- 1. Database Triggers: Fire automatically when events occur (new school, distribution, payment)
-- 2. Application Triggers: Call NotificationService methods from your React/TypeScript code
--
-- Database triggers are already active for:
--   - New school registration
--   - Distribution completed
--   - Payment received
--
-- Application triggers (call via NotificationService) for:
--   - Low inventory alert
--   - Payment reminder
--   - Cycle completion
--   - System alerts
-- ───────────────────────────────────────────────────────────────────────────────
