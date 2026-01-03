import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  linkedin_connected: boolean;
  notification_email: boolean;
  notification_frequency: string;
  timezone: string;
  created_at: string;
}

export interface Connection {
  id: string;
  user_id: string;
  linkedin_id: string | null;
  name: string;
  headline: string | null;
  profile_url: string | null;
  avatar_url: string | null;
  last_activity_date: string | null;
  last_activity_type: string | null;
  last_activity_content: string | null;
  engagement_count: number;
  last_engagement_date: string | null;
  created_at: string;
}

export interface Nudge {
  id: string;
  user_id: string;
  connection_id: string;
  type: string;
  activity_description: string | null;
  suggestions: string[];
  status: string;
  scheduled_for: string | null;
  sent_at: string | null;
  acted_at: string | null;
  created_at: string;
  connection?: Connection;
}

export interface Engagement {
  id: string;
  user_id: string;
  nudge_id: string | null;
  connection_id: string;
  engagement_type: string;
  response_received: boolean;
  response_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  nudges_limit: number;
  current_period_end: string | null;
}

export interface NetworkMetrics {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  total_connections: number;
  new_connections: number;
  engagements_sent: number;
  responses_received: number;
  response_rate: number;
  network_health_score: number;
  created_at: string;
}
