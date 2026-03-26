export interface OpenClawConfig {
  raw: string;
  parsed: Record<string, unknown>;
  detected_capabilities: string[];
}

export interface AuditReport {
  id: string;
  config_hash: string;
  overall_risk_score: number; // 0-100
  risk_level: "critical" | "high" | "medium" | "low";
  jurisdiction_results: JurisdictionResult[];
  findings: AuditFinding[];
  recommendations: string[];
  generated_at: string;
  regulations_checked: number;
  data_freshness: string;
}

export interface JurisdictionResult {
  jurisdiction: string;
  jurisdiction_display: string;
  applicable_regulations: number;
  compliance_score: number; // 0-100
  critical_findings: number;
  status: "compliant" | "at_risk" | "non_compliant" | "review_needed";
}

export interface AuditFinding {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  regulation_id: string;
  regulation_title: string;
  jurisdiction: string;
  config_reference: string;
  requirement: string;
  remediation: string;
  source_url: string;
}
