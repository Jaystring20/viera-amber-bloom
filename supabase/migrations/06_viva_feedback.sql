-- VIVA Feedback Carousel Table
-- Run this migration in Supabase SQL Editor to enable the feedback carousel

CREATE TABLE IF NOT EXISTS viva_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on created_at for performance
CREATE INDEX IF NOT EXISTS idx_viva_feedback_created_at ON viva_feedback(created_at DESC);

-- Enable Row Level Security
ALTER TABLE viva_feedback ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY IF NOT EXISTS "Allow public read access"
  ON viva_feedback
  FOR SELECT
  USING (true);

-- Create policy to allow public insert access
CREATE POLICY IF NOT EXISTS "Allow public insert access"
  ON viva_feedback
  FOR INSERT
  WITH CHECK (true);
