import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { callGeminiWithRetry } from "@/lib/ai/client";
import { buildAuditConfigPrompt } from "@/lib/ai/prompts/audit-config";
import type { Regulation } from "@/lib/types/regulation";
import type { AuditReport, AuditFinding } from "@/lib/types/audit";

/* ------------------------------------------------------------------ */
/* Rate limiter: 10 requests per IP per hour (in-memory)               */
/* ------------------------------------------------------------------ */

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_TRACKED_IPS = 10000; // prevent unbounded growth

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, recent);
    return false;
  }
  recent.push(now);
  rateLimitMap.set(ip, recent);

  // Periodic cleanup: if map exceeds max, prune stale entries
  if (rateLimitMap.size > MAX_TRACKED_IPS) {
    for (const [key, ts] of rateLimitMap.entries()) {
      if (ts.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) {
        rateLimitMap.delete(key);
      }
    }
  }
  return true;
}

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const MAX_CONFIG_SIZE = 50 * 1024; // 50KB

/* ------------------------------------------------------------------ */
/* Route handler                                                       */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Maximum 10 audits per hour." },
      { status: 429 }
    );
  }

  // Parse request body
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
      { error: "Missing 'config' field. Provide the agent config as a string." },
      { status: 400 }
    );
  }

  // Server-side size limit
  if (new TextEncoder().encode(configText).length > MAX_CONFIG_SIZE) {
    return NextResponse.json(
      { error: `Config exceeds maximum size of ${MAX_CONFIG_SIZE / 1024}KB.` },
      { status: 400 }
    );
  }

  // Parse config JSON and RE-SERIALIZE to strip any raw text/injection attempts
  let parsedConfig: Record<string, unknown>;
  try {
    parsedConfig = JSON.parse(configText);
  } catch {
    return NextResponse.json(
      { error: "Invalid config format. Must be valid JSON." },
      { status: 400 }
    );
  }

  // Re-serialize: only the data structure reaches Gemini, not raw user text
  const sanitizedConfig = JSON.stringify(parsedConfig, null, 2);

  const supabase = createAdminClient();

  // Fetch regulations
  const { data: regulations, error: regError } = await supabase
    .from("regulations")
    .select("*")
    .order("updated_at", { ascending: false });

  if (regError || !regulations || regulations.length === 0) {
    return NextResponse.json(
      { error: "No regulations found in database. Please seed the database first." },
      { status: 500 }
    );
  }

  const typedRegulations = regulations as Regulation[];

  const dataFreshness = typedRegulations.reduce((latest, reg) => {
    const regDate = new Date(reg.last_verified_at);
    return regDate > latest ? regDate : latest;
  }, new Date(0));

  // Build prompt with sanitized (re-serialized) config
  const prompt = buildAuditConfigPrompt(sanitizedConfig, typedRegulations);

  let auditResponse: string;
  try {
    auditResponse = await callGeminiWithRetry(prompt, 3);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Gemini audit call failed:", msg);
    return NextResponse.json(
      { error: "The audit engine is temporarily busy. Please try again in a few minutes." },
      { status: 503 }
    );
  }

  // Parse Gemini response
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

  // Validate response schema
  if (
    typeof auditData.overall_risk_score !== "number" ||
    auditData.overall_risk_score < 0 ||
    auditData.overall_risk_score > 100 ||
    !Array.isArray(auditData.findings) ||
    !Array.isArray(auditData.jurisdiction_results)
  ) {
    return NextResponse.json(
      { error: "Audit engine returned an invalid response. Please try again." },
      { status: 500 }
    );
  }

  // Validate grounding: strip ungrounded findings
  const regulationIdSet = new Set(typedRegulations.map((r) => r.id));
  const groundedFindings = auditData.findings.filter((f) =>
    regulationIdSet.has(f.regulation_id)
  );
  const removedCount = auditData.findings.length - groundedFindings.length;

  // Build report
  const configHash = await hashString(sanitizedConfig);
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

  // Store report
  const criticalCount = groundedFindings.filter((f) => f.severity === "critical").length;
  const highCount = groundedFindings.filter((f) => f.severity === "high").length;

  await supabase.from("audit_reports").insert({
    config_hash: configHash,
    config_snippet: sanitizedConfig.substring(0, 500),
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

function validateRiskLevel(level: string): "critical" | "high" | "medium" | "low" {
  const valid = ["critical", "high", "medium", "low"];
  return valid.includes(level) ? (level as "critical" | "high" | "medium" | "low") : "medium";
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
