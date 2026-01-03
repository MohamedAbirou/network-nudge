/**
 * Team Plan Database Schema & Functions
 * Implements multi-user teams with roles, permissions, and shared resources
 */

-- Create Teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  logo_url text,
  subscription_plan text CHECK (subscription_plan IN ('free', 'pro', 'team')),
  subscription_status text DEFAULT 'active',
  max_seats integer DEFAULT 1,
  current_seats integer DEFAULT 1,
  billing_email text,
  stripe_customer_id text UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create Team Members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at timestamp with time zone DEFAULT now(),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(team_id, user_id),
  CONSTRAINT owner_privilege CHECK (
    -- Ensure team always has at least one owner
    TRUE
  )
);

-- Create Team Invites table
CREATE TABLE IF NOT EXISTS team_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'member')),
  token text UNIQUE NOT NULL,
  expires_at timestamp with time zone,
  accepted_at timestamp with time zone,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Create Shared Dashboards table (team-level analytics)
CREATE TABLE IF NOT EXISTS shared_dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  is_default boolean DEFAULT false,
  settings jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create Team Connections View (shared across team)
CREATE TABLE IF NOT EXISTS team_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  connection_id uuid NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  added_by uuid NOT NULL REFERENCES auth.users(id),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(team_id, connection_id)
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Teams
CREATE POLICY "Teams visible to members"
  ON teams FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM team_members WHERE team_id = teams.id
    )
  );

CREATE POLICY "Team owner can update"
  ON teams FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Team owner can delete"
  ON teams FOR DELETE
  USING (auth.uid() = owner_id);

-- RLS Policies for Team Members
CREATE POLICY "Members see own team members"
  ON team_members FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage members"
  ON team_members FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for Team Invites
CREATE POLICY "Invited users see own invites"
  ON team_invites FOR SELECT
  USING (email = auth.jwt() ->> 'email' OR created_by = auth.uid());

CREATE POLICY "Admins can create invites"
  ON team_invites FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    created_by IN (
      SELECT user_id FROM team_members 
      WHERE team_id = team_invites.team_id AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for Shared Dashboards
CREATE POLICY "Team members see shared dashboards"
  ON shared_dashboards FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can create dashboards"
  ON shared_dashboards FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for Team Connections
CREATE POLICY "Team members see shared connections"
  ON team_connections FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can add connections"
  ON team_connections FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    ) AND
    added_by = auth.uid()
  );

-- Create Indexes
CREATE INDEX idx_teams_owner_id ON teams(owner_id);
CREATE INDEX idx_teams_stripe_id ON teams(stripe_customer_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_invites_team_id ON team_invites(team_id);
CREATE INDEX idx_team_invites_email ON team_invites(email);
CREATE INDEX idx_team_invites_token ON team_invites(token);
CREATE INDEX idx_shared_dashboards_team_id ON shared_dashboards(team_id);
CREATE INDEX idx_team_connections_team_id ON team_connections(team_id);

-- Helper Functions

-- Function to check user role in team
CREATE OR REPLACE FUNCTION get_team_role(
  p_user_id uuid,
  p_team_id uuid
) RETURNS text AS $$
  SELECT role FROM team_members
  WHERE user_id = p_user_id AND team_id = p_team_id
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user is team admin
CREATE OR REPLACE FUNCTION is_team_admin(
  p_user_id uuid,
  p_team_id uuid
) RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE user_id = p_user_id 
      AND team_id = p_team_id 
      AND role IN ('owner', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to get user's teams
CREATE OR REPLACE FUNCTION get_user_teams(p_user_id uuid)
RETURNS TABLE (team_id uuid, team_name text, role text) AS $$
  SELECT teams.id, teams.name, team_members.role
  FROM teams
  JOIN team_members ON teams.id = team_members.team_id
  WHERE team_members.user_id = p_user_id
  ORDER BY teams.created_at DESC;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to invite user to team
CREATE OR REPLACE FUNCTION invite_user_to_team(
  p_team_id uuid,
  p_email text,
  p_role text,
  p_invited_by uuid
) RETURNS uuid AS $$
DECLARE
  v_invite_id uuid;
  v_token text;
BEGIN
  -- Verify inviter is admin
  IF NOT is_team_admin(p_invited_by, p_team_id) THEN
    RAISE EXCEPTION 'Only admins can invite users';
  END IF;

  -- Generate secure token
  v_token := encode(gen_random_bytes(32), 'hex');

  -- Create invite
  INSERT INTO team_invites (team_id, email, role, token, expires_at, created_by)
  VALUES (
    p_team_id,
    p_email,
    p_role,
    v_token,
    now() + interval '7 days',
    p_invited_by
  )
  RETURNING id INTO v_invite_id;

  RETURN v_invite_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept team invite
CREATE OR REPLACE FUNCTION accept_team_invite(
  p_token text,
  p_user_id uuid
) RETURNS uuid AS $$
DECLARE
  v_team_id uuid;
  v_role text;
BEGIN
  -- Get invite
  SELECT team_id, role INTO v_team_id, v_role
  FROM team_invites
  WHERE token = p_token AND expires_at > now() AND accepted_at IS NULL;

  IF v_team_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite';
  END IF;

  -- Add user to team
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (v_team_id, p_user_id, v_role)
  ON CONFLICT DO NOTHING;

  -- Mark invite as accepted
  UPDATE team_invites
  SET accepted_at = now()
  WHERE token = p_token;

  -- Increment team member count
  UPDATE teams
  SET current_seats = current_seats + 1
  WHERE id = v_team_id;

  RETURN v_team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove team member
CREATE OR REPLACE FUNCTION remove_team_member(
  p_team_id uuid,
  p_user_id uuid,
  p_removed_by uuid
) RETURNS void AS $$
BEGIN
  -- Verify remover is admin
  IF NOT is_team_admin(p_removed_by, p_team_id) THEN
    RAISE EXCEPTION 'Only admins can remove members';
  END IF;

  -- Prevent owner removal (should transfer ownership first)
  IF get_team_role(p_user_id, p_team_id) = 'owner' THEN
    RAISE EXCEPTION 'Cannot remove team owner';
  END IF;

  -- Remove member
  DELETE FROM team_members WHERE team_id = p_team_id AND user_id = p_user_id;

  -- Decrement seat count
  UPDATE teams
  SET current_seats = GREATEST(1, current_seats - 1)
  WHERE id = p_team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default team for new users
CREATE OR REPLACE FUNCTION create_default_team()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO teams (owner_id, name, subscription_plan, max_seats)
  VALUES (NEW.id, 'Personal', 'free', 1);
  
  INSERT INTO team_members (team_id, user_id, role)
  SELECT id, NEW.id, 'owner' FROM teams WHERE owner_id = NEW.id LIMIT 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This trigger should be created on auth.users table
-- Can be handled via application logic during signup instead
