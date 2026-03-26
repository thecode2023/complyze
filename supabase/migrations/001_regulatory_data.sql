-- Core regulations table
CREATE TABLE regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  jurisdiction_display TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('enacted', 'proposed', 'in_effect', 'under_review', 'repealed')),
  category TEXT NOT NULL CHECK (category IN ('legislation', 'executive_order', 'framework', 'guidance', 'standard')),
  summary TEXT NOT NULL,
  key_requirements JSONB DEFAULT '[]',
  compliance_implications JSONB DEFAULT '[]',
  effective_date DATE,
  source_url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ai_classified BOOLEAN DEFAULT FALSE,
  ai_confidence FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Regulatory updates / changelog
CREATE TABLE regulatory_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regulation_id UUID REFERENCES regulations(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL CHECK (update_type IN ('new_regulation', 'amendment', 'status_change', 'enforcement_action', 'guidance_update')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  source_url TEXT,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  raw_source_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ingestion logs for pipeline observability
CREATE TABLE ingestion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL,
  source_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'skipped')),
  items_processed INTEGER DEFAULT 0,
  items_created INTEGER DEFAULT 0,
  items_updated INTEGER DEFAULT 0,
  items_skipped INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for feed queries
CREATE INDEX idx_regulations_jurisdiction ON regulations(jurisdiction);
CREATE INDEX idx_regulations_status ON regulations(status);
CREATE INDEX idx_regulations_category ON regulations(category);
CREATE INDEX idx_regulations_updated ON regulations(updated_at DESC);
CREATE INDEX idx_updates_detected ON regulatory_updates(detected_at DESC);
CREATE INDEX idx_updates_regulation ON regulatory_updates(regulation_id);
CREATE INDEX idx_updates_verified ON regulatory_updates(verified);
CREATE INDEX idx_ingestion_run ON ingestion_logs(run_id);
CREATE INDEX idx_ingestion_status ON ingestion_logs(status);

-- Enable RLS
ALTER TABLE regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_logs ENABLE ROW LEVEL SECURITY;

-- Public read access (regulations are public data)
CREATE POLICY "Public read access" ON regulations FOR SELECT USING (true);
CREATE POLICY "Public read updates" ON regulatory_updates FOR SELECT USING (true);

-- Only service role can write (used by ingestion pipeline)
CREATE POLICY "Service role insert regulations" ON regulations FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role update regulations" ON regulations FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Service role insert updates" ON regulatory_updates FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role update updates" ON regulatory_updates FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Service role manage ingestion_logs" ON ingestion_logs FOR ALL USING (auth.role() = 'service_role');
