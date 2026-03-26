-- ============================================================
-- Migration 003: User Profiles, Compliance Alerts, Posture
--                Snapshots, and Weekly Digests
-- ============================================================
-- Run this manually in the Supabase SQL Editor.
-- Depends on: 001_regulatory_data.sql, 002_audit_history.sql
-- ============================================================

-- =========================
-- 1. user_profiles
-- =========================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  organization TEXT,
  industry TEXT CHECK (industry IN (
    'financial_services', 'healthcare', 'technology', 'retail',
    'manufacturing', 'government', 'education', 'legal',
    'insurance', 'media', 'other'
  )),
  jurisdictions TEXT[] NOT NULL DEFAULT '{}',
  ai_use_cases TEXT[] DEFAULT '{}',
  notification_prefs JSONB DEFAULT '{"email_alerts": false, "dashboard_alerts": true}',
  onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- 2. compliance_alerts
-- =========================
CREATE TABLE compliance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  regulation_id UUID REFERENCES regulations(id) ON DELETE CASCADE,
  update_id UUID REFERENCES regulatory_updates(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'new_regulation', 'regulation_changed', 'new_requirement',
    'deadline_approaching', 'enforcement_action'
  )),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  read BOOLEAN DEFAULT FALSE,
  dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- 3. posture_snapshots
-- =========================
CREATE TABLE posture_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  jurisdiction_scores JSONB NOT NULL,
  active_regulations INTEGER NOT NULL,
  open_findings INTEGER NOT NULL,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

-- =========================
-- 4. weekly_digests
-- =========================
CREATE TABLE weekly_digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  digest_content JSONB NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- =========================
-- 5. Indexes
-- =========================

-- GIN index for array overlap queries on user jurisdictions
CREATE INDEX idx_profiles_jurisdictions ON user_profiles USING GIN (jurisdictions);

-- Alerts: fetch by user, most recent first
CREATE INDEX idx_alerts_user ON compliance_alerts(user_id, created_at DESC);

-- Alerts: fast unread count/fetch per user
CREATE INDEX idx_alerts_unread ON compliance_alerts(user_id) WHERE read = FALSE;

-- Posture: trend charting per user
CREATE INDEX idx_posture_user_date ON posture_snapshots(user_id, snapshot_date DESC);

-- Digests: most recent digest per user
CREATE INDEX idx_digests_user ON weekly_digests(user_id, period_end DESC);

-- =========================
-- 6. Row Level Security
-- =========================

-- Enable RLS on all new tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posture_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_digests ENABLE ROW LEVEL SECURITY;

-- ---- user_profiles ----
-- Users can read and update their own profile
CREATE POLICY "Users read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (during onboarding)
CREATE POLICY "Users insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Service role can manage all profiles (for admin/cron operations)
CREATE POLICY "Service role manage profiles"
  ON user_profiles FOR ALL
  USING (auth.role() = 'service_role');

-- ---- compliance_alerts ----
-- Users can read their own alerts
CREATE POLICY "Users read own alerts"
  ON compliance_alerts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own alerts (mark read/dismissed)
CREATE POLICY "Users update own alerts"
  ON compliance_alerts FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can insert alerts (ingestion pipeline / cron)
CREATE POLICY "Service role insert alerts"
  ON compliance_alerts FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Service role full access for maintenance
CREATE POLICY "Service role manage alerts"
  ON compliance_alerts FOR ALL
  USING (auth.role() = 'service_role');

-- ---- posture_snapshots ----
-- Users can read their own posture snapshots
CREATE POLICY "Users read own posture"
  ON posture_snapshots FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert/manage snapshots (daily cron)
CREATE POLICY "Service role manage posture"
  ON posture_snapshots FOR ALL
  USING (auth.role() = 'service_role');

-- ---- weekly_digests ----
-- Users can read their own digests
CREATE POLICY "Users read own digests"
  ON weekly_digests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own digests (mark as read)
CREATE POLICY "Users update own digests"
  ON weekly_digests FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can insert/manage digests (weekly cron)
CREATE POLICY "Service role manage digests"
  ON weekly_digests FOR ALL
  USING (auth.role() = 'service_role');
