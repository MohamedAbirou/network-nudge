/*
  # NetWork Nudge Database Schema

  ## Overview
  Complete database schema for NetWork Nudge SaaS platform - a LinkedIn networking tool
  that helps users maintain warm professional networks through AI-generated engagement suggestions.

  ## New Tables
  
  ### 1. `user_profiles`
  Extended user profile information beyond auth.users
  - `id` (uuid, primary key, references auth.users)
  - `full_name` (text)
  - `avatar_url` (text)
  - `linkedin_connected` (boolean) - Whether LinkedIn is connected
  - `linkedin_access_token` (text, encrypted) - LinkedIn OAuth token
  - `linkedin_refresh_token` (text, encrypted) - LinkedIn refresh token
  - `linkedin_token_expires_at` (timestamptz) - Token expiration
  - `linkedin_profile_id` (text) - LinkedIn user ID
  - `notification_email` (boolean) - Email notifications enabled
  - `notification_frequency` (text) - daily, weekly, etc.
  - `timezone` (text) - User timezone
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `subscriptions`
  User subscription and billing information
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `stripe_customer_id` (text)
  - `stripe_subscription_id` (text)
  - `plan_type` (text) - free, individual, team
  - `status` (text) - active, cancelled, past_due
  - `current_period_start` (timestamptz)
  - `current_period_end` (timestamptz)
  - `nudges_limit` (integer) - Weekly nudge limit
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `connections`
  LinkedIn connections/contacts
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `linkedin_id` (text) - Connection's LinkedIn ID
  - `name` (text)
  - `headline` (text)
  - `profile_url` (text)
  - `avatar_url` (text)
  - `last_activity_date` (timestamptz)
  - `last_activity_type` (text) - post, job_change, anniversary, etc.
  - `last_activity_content` (text)
  - `engagement_count` (integer) - Total engagements
  - `last_engagement_date` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `nudges`
  Generated engagement suggestions
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `connection_id` (uuid, references connections)
  - `type` (text) - post_comment, job_congrats, anniversary, general
  - `activity_description` (text) - What triggered the nudge
  - `suggestions` (jsonb) - Array of AI-generated suggestions
  - `status` (text) - pending, acted, dismissed, scheduled
  - `scheduled_for` (timestamptz) - When to send this nudge
  - `sent_at` (timestamptz)
  - `acted_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 5. `engagements`
  Tracked user engagements and responses
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `nudge_id` (uuid, references nudges)
  - `connection_id` (uuid, references connections)
  - `engagement_type` (text) - comment, message, like, share
  - `response_received` (boolean)
  - `response_date` (timestamptz)
  - `notes` (text)
  - `created_at` (timestamptz)

  ### 6. `network_metrics`
  Weekly/monthly aggregated network health metrics
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `period_start` (date)
  - `period_end` (date)
  - `total_connections` (integer)
  - `new_connections` (integer)
  - `engagements_sent` (integer)
  - `responses_received` (integer)
  - `response_rate` (decimal)
  - `network_health_score` (integer) - 0-100
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Secure token storage with encryption

  ## Notes
  - LinkedIn tokens should be encrypted at application level
  - Network health score calculated based on engagement rate and network growth
  - Nudges are generated via Edge Functions on schedule
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  linkedin_connected boolean DEFAULT false,
  linkedin_access_token text,
  linkedin_refresh_token text,
  linkedin_token_expires_at timestamptz,
  linkedin_profile_id text,
  notification_email boolean DEFAULT true,
  notification_frequency text DEFAULT 'weekly',
  timezone text DEFAULT 'UTC',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_type text DEFAULT 'free',
  status text DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  nudges_limit integer DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create connections table
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  linkedin_id text,
  name text NOT NULL,
  headline text,
  profile_url text,
  avatar_url text,
  last_activity_date timestamptz,
  last_activity_type text,
  last_activity_content text,
  engagement_count integer DEFAULT 0,
  last_engagement_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connections"
  ON connections FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own connections"
  ON connections FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own connections"
  ON connections FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own connections"
  ON connections FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create nudges table
CREATE TABLE IF NOT EXISTS nudges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  connection_id uuid REFERENCES connections(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  activity_description text,
  suggestions jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'pending',
  scheduled_for timestamptz,
  sent_at timestamptz,
  acted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE nudges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own nudges"
  ON nudges FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own nudges"
  ON nudges FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own nudges"
  ON nudges FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own nudges"
  ON nudges FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create engagements table
CREATE TABLE IF NOT EXISTS engagements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  nudge_id uuid REFERENCES nudges(id) ON DELETE CASCADE,
  connection_id uuid REFERENCES connections(id) ON DELETE CASCADE NOT NULL,
  engagement_type text NOT NULL,
  response_received boolean DEFAULT false,
  response_date timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own engagements"
  ON engagements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own engagements"
  ON engagements FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own engagements"
  ON engagements FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create network_metrics table
CREATE TABLE IF NOT EXISTS network_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_connections integer DEFAULT 0,
  new_connections integer DEFAULT 0,
  engagements_sent integer DEFAULT 0,
  responses_received integer DEFAULT 0,
  response_rate decimal(5,2) DEFAULT 0,
  network_health_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE network_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metrics"
  ON network_metrics FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own metrics"
  ON network_metrics FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON connections(user_id);
CREATE INDEX IF NOT EXISTS idx_nudges_user_id ON nudges(user_id);
CREATE INDEX IF NOT EXISTS idx_nudges_status ON nudges(status);
CREATE INDEX IF NOT EXISTS idx_nudges_scheduled_for ON nudges(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_engagements_user_id ON engagements(user_id);
CREATE INDEX IF NOT EXISTS idx_network_metrics_user_id ON network_metrics(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();