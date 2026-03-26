CREATE TABLE audit_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  config_hash TEXT NOT NULL,
  config_snippet TEXT,
  overall_risk_score INTEGER NOT NULL CHECK (overall_risk_score BETWEEN 0 AND 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('critical', 'high', 'medium', 'low')),
  findings_count INTEGER NOT NULL,
  critical_count INTEGER NOT NULL,
  high_count INTEGER NOT NULL,
  report_data JSONB NOT NULL,
  regulations_checked INTEGER NOT NULL,
  data_freshness TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_reports(user_id);
CREATE INDEX idx_audit_created ON audit_reports(created_at DESC);
CREATE INDEX idx_audit_hash ON audit_reports(config_hash);

ALTER TABLE audit_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create audits" ON audit_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Users read own audits" ON audit_reports FOR SELECT USING (auth.uid() = user_id);
