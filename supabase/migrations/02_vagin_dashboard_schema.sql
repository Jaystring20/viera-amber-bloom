-- VAGIN Dashboard Tables and RLS Policies
-- ═════════════════════════════════════════════════════════════════

-- Schools table
CREATE TABLE IF NOT EXISTS vagin_schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL DEFAULT 'Nigeria',
  city TEXT,
  state_region TEXT,
  contact_name TEXT,
  girls_reached INTEGER DEFAULT 0,
  current_balance NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Students table
CREATE TABLE IF NOT EXISTS vagin_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  school_id uuid REFERENCES vagin_schools(id) ON DELETE CASCADE,
  class TEXT,
  balance_ngn NUMERIC DEFAULT 0,
  free_pads_used INTEGER DEFAULT 0,
  paid_pads_used INTEGER DEFAULT 0,
  pads_received INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Matrons/Teachers table
CREATE TABLE IF NOT EXISTS vagin_matrons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  school_id uuid REFERENCES vagin_schools(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Teachers/Matrons for bot
CREATE TABLE IF NOT EXISTS teachers_matrons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  school_id uuid REFERENCES vagin_schools(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Pad distributions table
CREATE TABLE IF NOT EXISTS vagin_pad_distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES vagin_schools(id) ON DELETE CASCADE,
  distribution_date DATE NOT NULL,
  girls_count INTEGER NOT NULL,
  pads_count INTEGER NOT NULL,
  savings_collected_ngn NUMERIC DEFAULT 0,
  distributed_by TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS vagin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES vagin_schools(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  topic TEXT NOT NULL,
  girls_attended INTEGER NOT NULL,
  facilitator TEXT,
  delivery_format TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Savings table
CREATE TABLE IF NOT EXISTS vagin_savings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES vagin_schools(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  contributors INTEGER DEFAULT 0,
  total_ngn NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS vagin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES vagin_students(id) ON DELETE CASCADE,
  school_id uuid REFERENCES vagin_schools(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  paid_amount NUMERIC,
  amount_ngn NUMERIC,
  source TEXT,
  notes TEXT,
  voided BOOLEAN DEFAULT false,
  voided_reason TEXT,
  flagged BOOLEAN DEFAULT false,
  issued_date DATE,
  issued_by TEXT,
  pads_issued INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- Enable RLS on all tables
-- ─────────────────────────────────────────────────────────────

ALTER TABLE vagin_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE vagin_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE vagin_matrons ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers_matrons ENABLE ROW LEVEL SECURITY;
ALTER TABLE vagin_pad_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vagin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vagin_savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vagin_transactions ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────
-- Drop existing policies to avoid conflicts
-- ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "authenticated_all" ON vagin_schools;
DROP POLICY IF EXISTS "authenticated_all" ON vagin_students;
DROP POLICY IF EXISTS "authenticated_all" ON vagin_matrons;
DROP POLICY IF EXISTS "authenticated_all" ON teachers_matrons;
DROP POLICY IF EXISTS "authenticated_all" ON vagin_pad_distributions;
DROP POLICY IF EXISTS "authenticated_all" ON vagin_sessions;
DROP POLICY IF EXISTS "authenticated_all" ON vagin_savings;
DROP POLICY IF EXISTS "authenticated_all" ON vagin_transactions;

-- ─────────────────────────────────────────────────────────────
-- Create RLS Policies - Allow all operations for authenticated users
-- ─────────────────────────────────────────────────────────────

CREATE POLICY "enable_all_authenticated_vagin_schools" ON vagin_schools
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "enable_all_authenticated_vagin_students" ON vagin_students
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "enable_all_authenticated_vagin_matrons" ON vagin_matrons
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "enable_all_authenticated_teachers_matrons" ON teachers_matrons
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "enable_all_authenticated_vagin_pad_distributions" ON vagin_pad_distributions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "enable_all_authenticated_vagin_sessions" ON vagin_sessions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "enable_all_authenticated_vagin_savings" ON vagin_savings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "enable_all_authenticated_vagin_transactions" ON vagin_transactions
  FOR ALL USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- Create Indexes for better performance
-- ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_vagin_schools_code ON vagin_schools(code);
CREATE INDEX IF NOT EXISTS idx_vagin_schools_country ON vagin_schools(country);
CREATE INDEX IF NOT EXISTS idx_vagin_students_school_id ON vagin_students(school_id);
CREATE INDEX IF NOT EXISTS idx_vagin_students_student_id ON vagin_students(student_id);
CREATE INDEX IF NOT EXISTS idx_vagin_matrons_school_id ON vagin_matrons(school_id);
CREATE INDEX IF NOT EXISTS idx_vagin_matrons_phone ON vagin_matrons(phone);
CREATE INDEX IF NOT EXISTS idx_teachers_matrons_school_id ON teachers_matrons(school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_matrons_phone ON teachers_matrons(phone);
CREATE INDEX IF NOT EXISTS idx_vagin_pad_distributions_school_id ON vagin_pad_distributions(school_id);
CREATE INDEX IF NOT EXISTS idx_vagin_sessions_school_id ON vagin_sessions(school_id);
-- CREATE INDEX IF NOT EXISTS idx_vagin_transactions_school_id ON vagin_transactions(school_id);
-- CREATE INDEX IF NOT EXISTS idx_vagin_transactions_student_id ON vagin_transactions(student_id);
