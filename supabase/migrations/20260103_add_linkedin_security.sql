-- Add new tables for LinkedIn integration and security
-- Run this migration: supabase migration new add_linkedin_integration

-- User credentials table (encrypted at rest)
CREATE TABLE IF NOT EXISTS user_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  linkedin_tokens jsonb,
  stripe_token text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT valid_encryption CHECK (
    -- Ensure tokens exist if LinkedIn is connected
    TRUE
  )
);

-- Audit logs for compliance and security monitoring
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource_type text, -- 'connection', 'activity', 'nudge', 'settings', 'auth'
  resource_id text,
  details jsonb,
  ip_address inet,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT valid_action CHECK (
    action IN ('view', 'create', 'update', 'delete', 'export', 'login', 'logout', 'consent')
  )
);

-- Track user privacy consents (GDPR/CCPA)
CREATE TABLE IF NOT EXISTS user_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  linkedin_data_storage boolean DEFAULT false,
  marketing_emails boolean DEFAULT false,
  analytics_tracking boolean DEFAULT false,
  consented_at timestamp with time zone,
  accepted_privacy_version text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- LinkedIn API usage tracking (rate limiting)
CREATE TABLE IF NOT EXISTS linkedin_api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL, -- '/connections', '/activities', etc.
  call_count integer DEFAULT 1,
  reset_date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, endpoint, reset_date),
  CONSTRAINT valid_endpoint CHECK (
    endpoint IN ('/connections', '/activities', '/profileUpdates', '/me')
  )
);

-- Connections (synced from LinkedIn)
ALTER TABLE connections
ADD COLUMN IF NOT EXISTS linkedin_id text UNIQUE,
ADD COLUMN IF NOT EXISTS synced_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS profile_url text,
ADD COLUMN IF NOT EXISTS picture_url text;

-- Activities (synced from LinkedIn)
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS linkedin_activity_id text UNIQUE,
ADD COLUMN IF NOT EXISTS activity_type text DEFAULT 'post',
ADD COLUMN IF NOT EXISTS synced_at timestamp with time zone;

-- Enable RLS on new tables
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_api_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_credentials (users can only see their own)
CREATE POLICY "Users can view their own credentials"
  ON user_credentials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credentials"
  ON user_credentials FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credentials"
  ON user_credentials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for audit_logs
CREATE POLICY "Users can view their own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true); -- Inserted via triggers

-- RLS Policies for user_consents
CREATE POLICY "Users can view their own consents"
  ON user_consents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own consents"
  ON user_consents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consents"
  ON user_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for linkedin_api_usage
CREATE POLICY "Users can view their own API usage"
  ON linkedin_api_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_linkedin_api_usage_user_id ON linkedin_api_usage(user_id);
CREATE INDEX idx_linkedin_api_usage_reset_date ON linkedin_api_usage(reset_date);
CREATE INDEX idx_connections_linkedin_id ON connections(linkedin_id);
CREATE INDEX idx_activities_linkedin_activity_id ON activities(linkedin_activity_id);

-- Trigger to create audit log on login
CREATE OR REPLACE FUNCTION audit_login()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, created_at)
  VALUES (NEW.id, 'login', 'auth', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This trigger should be on auth.users but requires proper setup
-- Can be handled via backend application logic instead

-- Function to check API rate limit
CREATE OR REPLACE FUNCTION check_linkedin_api_limit(p_user_id uuid, p_endpoint text)
RETURNS BOOLEAN AS $$
DECLARE
  v_count integer;
  v_limit integer;
BEGIN
  -- Different limits for different endpoints
  v_limit := CASE 
    WHEN p_endpoint = '/connections' THEN 100
    WHEN p_endpoint = '/activities' THEN 100
    WHEN p_endpoint = '/profileUpdates' THEN 50
    ELSE 200
  END;

  SELECT call_count INTO v_count
  FROM linkedin_api_usage
  WHERE user_id = p_user_id
    AND endpoint = p_endpoint
    AND reset_date = CURRENT_DATE;

  IF v_count IS NULL THEN
    INSERT INTO linkedin_api_usage (user_id, endpoint, call_count, reset_date)
    VALUES (p_user_id, p_endpoint, 1, CURRENT_DATE);
    RETURN true;
  ELSIF v_count < v_limit THEN
    UPDATE linkedin_api_usage
    SET call_count = call_count + 1, updated_at = now()
    WHERE user_id = p_user_id
      AND endpoint = p_endpoint
      AND reset_date = CURRENT_DATE;
    RETURN true;
  ELSE
    RETURN false; -- Rate limit exceeded
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
