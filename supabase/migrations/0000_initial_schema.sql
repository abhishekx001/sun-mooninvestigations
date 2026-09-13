-- Drop existing tables to ensure a clean slate for the initial schema
DROP TABLE IF EXISTS case_status_log CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS case_progress CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'agent')),
  location TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cases table
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT NOT NULL,
  company TEXT,
  claim_no TEXT,
  investigation_type TEXT,
  case_name TEXT,
  fir_no_police_station TEXT,
  documents_enclosed TEXT,
  tat_target TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'unassigned' CHECK (status IN ('unassigned', 'assigned', 'in_progress', 'submitted', 'closed')),
  assigned_agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  date_of_allocation TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create case_progress table
CREATE TABLE case_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL UNIQUE REFERENCES cases(id) ON DELETE CASCADE,
  accept_reject TEXT DEFAULT 'pending' CHECK (accept_reject IN ('pending', 'accepted', 'rejected')),
  status TEXT,
  commit_date DATE,
  reason_for_pending TEXT,
  date_of_final_submission DATE,
  tat TEXT,
  qc TEXT DEFAULT 'pending' CHECK (qc IN ('pending', 'passed', 'failed')),
  qc_remarks TEXT,
  final_qc_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  update_text TEXT,
  is_final BOOLEAN DEFAULT FALSE,
  attachment_urls TEXT[],
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create case_status_log table
CREATE TABLE case_status_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security (RLS)

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_status_log ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert profiles" ON profiles FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (is_admin());
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Cases Policies
CREATE POLICY "Admins have full access to cases" ON cases FOR ALL USING (is_admin());
CREATE POLICY "Agents can view assigned cases" ON cases FOR SELECT USING (assigned_agent_id = auth.uid());
CREATE POLICY "Agents can update their own cases" ON cases FOR UPDATE USING (assigned_agent_id = auth.uid());

-- Case Progress Policies
CREATE POLICY "Admins have full access to case progress" ON case_progress FOR ALL USING (is_admin());
CREATE POLICY "Agents can view and update their own case progress" ON case_progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM cases WHERE cases.id = case_progress.case_id AND cases.assigned_agent_id = auth.uid())
);
CREATE POLICY "Agents can update their own case progress" ON case_progress FOR UPDATE USING (
  EXISTS (SELECT 1 FROM cases WHERE cases.id = case_progress.case_id AND cases.assigned_agent_id = auth.uid())
);

-- Reports Policies
CREATE POLICY "Admins have full access to reports" ON reports FOR ALL USING (is_admin());
CREATE POLICY "Agents can view their own reports" ON reports FOR SELECT USING (agent_id = auth.uid());
CREATE POLICY "Agents can insert reports for their cases" ON reports FOR INSERT WITH CHECK (
  agent_id = auth.uid() AND EXISTS (SELECT 1 FROM cases WHERE cases.id = reports.case_id AND cases.assigned_agent_id = auth.uid())
);

-- Case Status Log Policies
CREATE POLICY "Admins can view status logs" ON case_status_log FOR SELECT USING (is_admin());
CREATE POLICY "Agents can view status logs for their cases" ON case_status_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM cases WHERE cases.id = case_status_log.case_id AND cases.assigned_agent_id = auth.uid())
);
CREATE POLICY "Admins can insert status logs" ON case_status_log FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Agents can insert status logs for their cases" ON case_status_log FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM cases WHERE cases.id = case_status_log.case_id AND cases.assigned_agent_id = auth.uid())
);
