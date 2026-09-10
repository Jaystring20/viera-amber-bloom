-- Quarterly pad-cycle reset. The dashboard has always promised "1 free + 2
-- paid pads per 3-month cycle", but nothing ever reset free_pads_used /
-- paid_pads_used — once a student hit the cap she was permanently blocked.
-- This makes that promise real: cycles are fixed calendar quarters
-- (Jan-Mar, Apr-Jun, Jul-Sep, Oct-Dec), matching what the WhatsApp bot's
-- REPORT CYCLE now computes on its own (see whatsapp-webhook/index.ts).

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

CREATE OR REPLACE FUNCTION reset_pad_cycle() RETURNS void AS $$
BEGIN
  UPDATE vagin_students
  SET free_pads_used = 0, paid_pads_used = 0, updated_at = now()
  WHERE active = true AND (free_pads_used > 0 OR paid_pads_used > 0);
END;
$$ LANGUAGE plpgsql;

-- Idempotent: drop any existing job with this name before (re)scheduling,
-- so re-running this migration never creates a duplicate cron job.
DO $$
BEGIN
  PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'reset-pad-cycle-quarterly';
EXCEPTION WHEN OTHERS THEN
  NULL; -- no existing job / pg_cron not yet warmed up on first run — fine
END $$;

SELECT cron.schedule('reset-pad-cycle-quarterly', '0 0 1 1,4,7,10 *', 'SELECT reset_pad_cycle();');
