-- =====================================================
-- SAFEHIRE AI – Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- USERS TABLE (extends auth.users)
-- =====================================================
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SCANS TABLE
-- =====================================================
CREATE TABLE public.scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('url', 'message', 'pdf')),
  input_data TEXT NOT NULL,
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_analysis JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX idx_scans_user_id ON public.scans(user_id);
CREATE INDEX idx_scans_created_at ON public.scans(created_at DESC);
CREATE INDEX idx_scans_scan_type ON public.scans(scan_type);

-- =====================================================
-- REPORTS TABLE
-- =====================================================
CREATE TABLE public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE NOT NULL,
  pdf_url TEXT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX idx_reports_scan_id ON public.reports(scan_id);

-- =====================================================
-- BLACKLISTED DOMAINS TABLE
-- =====================================================
CREATE TABLE public.blacklisted_domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_name TEXT UNIQUE NOT NULL,
  threat_type TEXT NOT NULL CHECK (threat_type IN ('phishing', 'scam', 'malware', 'fake_jobs', 'other')),
  added_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX idx_blacklist_domain ON public.blacklisted_domains(domain_name);

-- =====================================================
-- AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blacklisted_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- USERS policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can insert users" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

-- SCANS policies
CREATE POLICY "Users can view own scans" ON public.scans
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own scans" ON public.scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans" ON public.scans
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- REPORTS policies
CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.scans
      WHERE scans.id = reports.scan_id AND (scans.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can insert own reports" ON public.reports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scans
      WHERE scans.id = scan_id AND scans.user_id = auth.uid()
    )
  );

-- BLACKLISTED DOMAINS policies
CREATE POLICY "Authenticated users can view blacklist" ON public.blacklisted_domains
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage blacklist" ON public.blacklisted_domains
  FOR ALL USING (public.is_admin());

-- AUDIT LOGS policies
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- =====================================================
-- SEED DATA: Initial blacklisted domains
-- =====================================================
INSERT INTO public.blacklisted_domains (domain_name, threat_type, notes) VALUES
  ('workfromhome-earn.xyz', 'scam', 'Known job scam domain'),
  ('hire-now-usa.net', 'fake_jobs', 'Fake recruiter portal'),
  ('jobs-apply-instantly.com', 'phishing', 'Credential harvesting site'),
  ('get-hired-fast.info', 'scam', 'Advance fee fraud scheme');
