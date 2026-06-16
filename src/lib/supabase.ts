import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://xcwgethymuvxcalxukzy.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database types for type safety
export interface User {
  id: string;
  email: string;
  user_type: "girl" | "sponsor" | "admin";
  name: string;
  country?: string;
  school?: string;
  age?: number;
  created_at: string;
  updated_at: string;
}

export interface VaginARTModule {
  id: string;
  title: string;
  description: string;
  topic: "puberty" | "hygiene" | "safety" | "mental_health";
  content_url: string;
  thumbnail_url: string;
  order: number;
  created_at: string;
}

export interface PadKoloTracking {
  id: string;
  girl_id: string;
  school_id: string;
  pads_received: number;
  savings_balance: number;
  attendance_days: number;
  month: string;
  year: number;
  created_at: string;
  updated_at: string;
}

export interface SponsorImpact {
  id: string;
  sponsor_id: string;
  girls_supported: number;
  pads_donated: number;
  total_contributed: number;
  impact_stories: string[];
  created_at: string;
  updated_at: string;
}
