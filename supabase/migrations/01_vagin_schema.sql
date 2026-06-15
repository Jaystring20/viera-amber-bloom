-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (links to Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('girl', 'sponsor', 'admin')),
  country TEXT,
  school TEXT,
  age INTEGER CHECK (age >= 8 AND age <= 25),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- VaginART modules (curriculum content)
CREATE TABLE IF NOT EXISTS vaginart_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  topic TEXT NOT NULL CHECK (topic IN ('puberty', 'hygiene', 'safety', 'mental_health')),
  content_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_minutes INTEGER,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User module progress tracking
CREATE TABLE IF NOT EXISTS user_module_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES vaginart_modules(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  progress_percent INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- PAD KOLO tracking (menstrual health & micro-savings)
CREATE TABLE IF NOT EXISTS pad_kolo_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  girl_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID,
  pads_received INTEGER DEFAULT 0,
  savings_balance DECIMAL(10, 2) DEFAULT 0.00,
  attendance_days INTEGER DEFAULT 0,
  month TEXT, -- "January", "February", etc.
  year INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sponsor profiles
CREATE TABLE IF NOT EXISTS sponsor_profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  organization_name TEXT,
  impact_level TEXT CHECK (impact_level IN ('bronze', 'silver', 'gold', 'platinum')),
  girls_supported INTEGER DEFAULT 0,
  pads_donated INTEGER DEFAULT 0,
  total_contributed DECIMAL(15, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sponsorship links (which girls each sponsor supports)
CREATE TABLE IF NOT EXISTS sponsorships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsor_id UUID NOT NULL REFERENCES sponsor_profiles(id) ON DELETE CASCADE,
  girl_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  monthly_contribution DECIMAL(10, 2),
  start_date DATE,
  end_date DATE,
  status TEXT CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(sponsor_id, girl_id)
);

-- Impact stories
CREATE TABLE IF NOT EXISTS impact_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  girl_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  story_text TEXT NOT NULL,
  image_url TEXT,
  story_date DATE,
  impact_category TEXT CHECK (impact_category IN ('education', 'health', 'savings', 'confidence', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Resources library (downloadable materials)
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT CHECK (resource_type IN ('guide', 'worksheet', 'infographic', 'video', 'article')),
  file_url TEXT NOT NULL,
  topic TEXT,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);
CREATE INDEX IF NOT EXISTS idx_user_module_progress_user_id ON user_module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_module_progress_completed ON user_module_progress(completed);
CREATE INDEX IF NOT EXISTS idx_pad_kolo_girl_id ON pad_kolo_tracking(girl_id);
CREATE INDEX IF NOT EXISTS idx_pad_kolo_month_year ON pad_kolo_tracking(month, year);
CREATE INDEX IF NOT EXISTS idx_sponsorships_sponsor_id ON sponsorships(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_girl_id ON sponsorships(girl_id);
CREATE INDEX IF NOT EXISTS idx_impact_stories_girl_id ON impact_stories(girl_id);
CREATE INDEX IF NOT EXISTS idx_impact_stories_category ON impact_stories(impact_category);
CREATE INDEX IF NOT EXISTS idx_resources_topic ON resources(topic);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaginart_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE pad_kolo_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can see their own profile
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Everyone can view VaginART modules
CREATE POLICY "Anyone can view modules"
  ON vaginart_modules FOR SELECT
  USING (true);

-- Girls can see their own progress
CREATE POLICY "Users can view their own module progress"
  ON user_module_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Girls can update their own progress
CREATE POLICY "Users can update their own module progress"
  ON user_module_progress FOR INSERT
  USING (auth.uid() = user_id);

-- Girls can view their own PAD KOLO tracking
CREATE POLICY "Girls can view their own pad kolo data"
  ON pad_kolo_tracking FOR SELECT
  USING (auth.uid() = girl_id);

-- Sponsors can view their own profile
CREATE POLICY "Sponsors can view their profile"
  ON sponsor_profiles FOR SELECT
  USING (auth.uid() = id);

-- Sponsors can see girls they sponsor
CREATE POLICY "Sponsors can see sponsored girls"
  ON sponsorships FOR SELECT
  USING (auth.uid() = sponsor_id);

-- Everyone can view impact stories
CREATE POLICY "Anyone can view impact stories"
  ON impact_stories FOR SELECT
  USING (true);

-- Everyone can view resources
CREATE POLICY "Anyone can view resources"
  ON resources FOR SELECT
  USING (true);
