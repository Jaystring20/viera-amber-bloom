-- WhatsApp Bot Conversational Session & Matron Intake
-- ═════════════════════════════════════════════════════════════════

-- Tracks per-phone conversation state for the WhatsApp bot: the VAGIN
-- intro/matron confirmation, the unregistered-matron intake flow, and the
-- active command session once a registered matron is recognized.
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  phone TEXT PRIMARY KEY,
  state TEXT NOT NULL DEFAULT 'NEW',
  intake_name TEXT,
  last_message_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);

-- Self-service registration requests from numbers not yet in
-- teachers_matrons that claim to be a matron. An admin reviews these and
-- creates the real teachers_matrons record once verified — this table
-- itself never grants transactional access.
CREATE TABLE IF NOT EXISTS matron_registration_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  claimed_name TEXT,
  claimed_school TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- Enable RLS
-- ─────────────────────────────────────────────────────────────

ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE matron_registration_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "enable_all_authenticated_whatsapp_sessions" ON whatsapp_sessions;
DROP POLICY IF EXISTS "enable_all_authenticated_matron_registration_requests" ON matron_registration_requests;

CREATE POLICY "enable_all_authenticated_whatsapp_sessions" ON whatsapp_sessions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "enable_all_authenticated_matron_registration_requests" ON matron_registration_requests
  FOR ALL USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_last_message_at ON whatsapp_sessions(last_message_at);
CREATE INDEX IF NOT EXISTS idx_matron_registration_requests_phone ON matron_registration_requests(phone);
CREATE INDEX IF NOT EXISTS idx_matron_registration_requests_status ON matron_registration_requests(status);
