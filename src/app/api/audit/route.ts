import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { callGeminiWithRetry } from "@/lib/ai/client";
import { buildAuditConfigPrompt } from "@/lib/ai/prompts/audit-config";
import type { Regulation } from "@/lib/types/regulation";
import type { AuditReport, AuditFinding } from "@/lib/types/audit";

export async function POST(request: NextRequest) {
  let configText: string;

  try {
    const body = await request.json();
    configText = body.config;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Expected JSON with a 'config' field." },
      { status: 400 }
    );
  }

  if (!configText || typeof configText !== "string") {
    return NextResponse.json(
      { error: "Missing 'config' field. Provide the OpenClaw config as a string." },
      { status: 400 }
    );
  }

  // Validate that the config is parseable JSON
  let parsedConfig: Record<string, unknown>;
  try {
    parsedConfig = JSON.parse(configText);
  } catch {
    return NextResponse.json(
      { error: "Invalid config format. Must be valid JSON." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Fetch current regulations (enacted + in_effect for primary audit, all for context)
  const { data: regulations, error: regError } = await supabase
    .from("regulations")
    .select("*")
    .order("updated_at", { ascending: false });

  if (regError || !regulations || regulations.length === 0) {
    return NextResponse.json(
      {
        error:
          "No regulations found in database. Please seed the database first.",
      },
      { status: 500 }
    );
  }

  const typedRegulations = regulations as Regulation[];

  // Find the most recent last_verified_at for data freshness
  const dataFreshness = typedRegulations.reduce((latest, reg) => {
    const regDate = new Date(reg.last_verified_at);
    return regDate > latest ? regDate : latest;
  }, new Date(0));

  // Build the audit prompt and call Gemini
  const prompt = buildAuditConfigPrompt(configText, typedRegulations);

  let auditResponse: string;
  try {
    auditResponse = await callGeminiWithRetry(prompt, 3);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `AI audit engine unavailable: ${msg}` },
      { status: 503 }
    );
  }

  // Parse the response
  let auditData: {
    overall_risk_score: number;
    risk_level: string;
    jurisdiction_results: AuditReport["jurisdiction_results"];
    findings: AuditFinding[];
    recommendations: string[];
  };

  try {
    const cleaned = auditResponse
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    auditData = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse audit response from AI engine." },
      { status: 500 }
    );
  }

  // Validate grounding: ensure all cited regulation_ids exist in our database
  const regulationIdSet = new Set(typedRegulations.map((r) => r.id));
  const groundedFindings = auditData.findings.filter((f) =>
    regulationIdSet.has(f.regulation_id)
  );

  const removedCount = auditData.findings.length - groundedFindings.length;

  // Build the final report
  const configHash = await hashString(configText);
  const report: AuditReport = {
    id: crypto.randomUUID(),
    config_hash: configHash,
    overall_risk_score: clamp(auditData.overall_risk_score, 0, 100),
    risk_level: validateRiskLevel(auditData.risk_level),
    jurisdiction_results: auditData.jurisdiction_results || [],
    findings: groundedFindings,
    recommendations: auditData.recommendations || [],
    generated_at: new Date().toISOString(),
    regulations_checked: typedRegulations.length,
    data_freshness: dataFreshness.toISOString(),
  };

  // Store the report in Supabase (anonymous — no user_id)
  const criticalCount = groundedFindings.filter(
    (f) => f.severity === "critical"
  ).length;
  const highCount = groundedFindings.filter(
    (f) => f.severity === "high"
  ).length;

  await supabase.from("audit_reports").insert({
    config_hash: configHash,
    config_snippet: configText.substring(0, 500),
    overall_risk_score: report.overall_risk_score,
    risk_level: report.risk_level,
    findings_count: groundedFindings.length,
    critical_count: criticalCount,
    high_count: highCount,
    report_data: report,
    regulations_checked: typedRegulations.length,
    data_freshness: dataFreshness.toISOString(),
  });

  return NextResponse.json({
    ...report,
    _meta: {
      ungrounded_findings_removed: removedCount,
      total_regulations_in_db: typedRegulations.length,
    },
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function validateRiskLevel(
  level: string
): "critical" | "high" | "medium" | "low" {
  const valid = ["critical", "high", "medium", "low"];
  return valid.includes(level)
    ? (level as "critical" | "high" | "medium" | "low")
    : "medium";
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
