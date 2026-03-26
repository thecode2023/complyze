import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { format } from "date-fns";

// POST: Generates posture snapshots for all onboarded users (protected by CRON_SECRET)
export async function POST(request: NextRequest) {
  const cronSecret =
    request.headers.get("x-cron-secret") ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = format(new Date(), "yyyy-MM-dd");

  // Get all onboarded users with their jurisdictions
  const { data: users, error: usersError } = await supabase
    .from("user_profiles")
    .select("id, jurisdictions")
    .eq("onboarded", true);

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  // Get all regulations with their jurisdiction and status
  const { data: regulations } = await supabase
    .from("regulations")
    .select("id, jurisdiction, status");

  // Get the count of open (unread, undismissed) alerts per user
  const { data: alertCounts } = await supabase
    .from("compliance_alerts")
    .select("user_id")
    .eq("read", false)
    .eq("dismissed", false);

  const alertsByUser: Record<string, number> = {};
  (alertCounts ?? []).forEach((a) => {
    alertsByUser[a.user_id] = (alertsByUser[a.user_id] || 0) + 1;
  });

  // Get the most recent audit for each user (if any)
  const { data: audits } = await supabase
    .from("audit_reports")
    .select("user_id, overall_risk_score, findings_count")
    .order("created_at", { ascending: false });

  // Latest audit per user
  const latestAudit: Record<string, { risk_score: number; findings: number }> = {};
  (audits ?? []).forEach((a) => {
    if (a.user_id && !latestAudit[a.user_id]) {
      latestAudit[a.user_id] = {
        risk_score: a.overall_risk_score,
        findings: a.findings_count,
      };
    }
  });

  let snapshotsCreated = 0;

  for (const user of users ?? []) {
    // Count regulations in user's jurisdictions
    const userRegs = (regulations ?? []).filter((r) =>
      user.jurisdictions.includes(r.jurisdiction)
    );
    const activeRegCount = userRegs.length;
    const openFindings = alertsByUser[user.id] ?? 0;

    // Calculate per-jurisdiction scores
    // Base score starts at 75, reduced by open alerts and risk factors
    const audit = latestAudit[user.id];
    const baseScore = audit ? Math.max(0, 100 - audit.risk_score) : 65;

    const jurisdictionScores: Record<string, number> = {};
    for (const jurisdiction of user.jurisdictions) {
      const jurisdictionRegs = userRegs.filter(
        (r) => r.jurisdiction === jurisdiction
      );
      // Simple heuristic: base score adjusted by coverage
      const coverage = jurisdictionRegs.length > 0 ? 1 : 0.5;
      const enactedRatio = jurisdictionRegs.length > 0
        ? jurisdictionRegs.filter((r) =>
            ["enacted", "in_effect"].includes(r.status)
          ).length / jurisdictionRegs.length
        : 0;

      // Higher enacted ratio = more regulatory pressure = slightly lower score unless audited
      const pressurePenalty = enactedRatio * 10;
      const score = Math.round(
        Math.max(0, Math.min(100, baseScore * coverage - pressurePenalty))
      );
      jurisdictionScores[jurisdiction] = score;
    }

    // Overall score = average of jurisdiction scores
    const scores = Object.values(jurisdictionScores);
    const overallScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : baseScore;

    // Upsert snapshot (unique per user + date)
    const { error: insertError } = await supabase
      .from("posture_snapshots")
      .upsert(
        {
          user_id: user.id,
          overall_score: overallScore,
          jurisdiction_scores: jurisdictionScores,
          active_regulations: activeRegCount,
          open_findings: openFindings,
          snapshot_date: today,
        },
        { onConflict: "user_id,snapshot_date" }
      );

    if (!insertError) {
      snapshotsCreated++;
    }
  }

  return NextResponse.json({
    status: "completed",
    snapshot_date: today,
    users_processed: (users ?? []).length,
    snapshots_created: snapshotsCreated,
  });
}

// GET for Vercel Cron (sends GET requests)
export async function GET(request: NextRequest) {
  return POST(request);
}
