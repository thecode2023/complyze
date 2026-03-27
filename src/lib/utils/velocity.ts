import type { SupabaseClient } from "@supabase/supabase-js";

export interface VelocityResult {
  score: number; // 0-100
  level: "high" | "medium" | "low";
}

export type VelocityMap = Record<string, VelocityResult>;

// In-memory cache with 1-hour TTL
let cachedResult: { data: VelocityMap; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Compute regulatory velocity scores for all jurisdictions.
 *
 * Scoring (0-100):
 *  - Number of regulations: 20% weight
 *  - Number of regulatory_updates in last 90 days: 30% weight
 *  - Ratio of enacted/in_effect vs proposed/voluntary: 25% weight
 *  - Whether enforcement actions exist: 25% weight
 */
export async function computeVelocityScores(
  supabase: SupabaseClient
): Promise<VelocityMap> {
  // Return cached if fresh
  if (cachedResult && Date.now() < cachedResult.expiresAt) {
    return cachedResult.data;
  }

  // 1. Get all regulations grouped by jurisdiction
  const { data: regulations } = await supabase
    .from("regulations")
    .select("jurisdiction, status");

  // 2. Get regulatory updates from last 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const { data: updates } = await supabase
    .from("regulatory_updates")
    .select("regulation_id, update_type")
    .gte("detected_at", ninetyDaysAgo.toISOString());

  // 3. Get regulation jurisdiction mapping for updates
  const { data: regJurisdictions } = await supabase
    .from("regulations")
    .select("id, jurisdiction");

  const regToJurisdiction: Record<string, string> = {};
  (regJurisdictions ?? []).forEach((r) => {
    regToJurisdiction[r.id] = r.jurisdiction;
  });

  // Build per-jurisdiction stats
  const stats: Record<
    string,
    {
      regCount: number;
      enactedCount: number;
      proposedCount: number;
      updateCount: number;
      hasEnforcement: boolean;
    }
  > = {};

  function ensureJurisdiction(j: string) {
    if (!stats[j]) {
      stats[j] = {
        regCount: 0,
        enactedCount: 0,
        proposedCount: 0,
        updateCount: 0,
        hasEnforcement: false,
      };
    }
  }

  // Count regulations
  (regulations ?? []).forEach((r) => {
    ensureJurisdiction(r.jurisdiction);
    stats[r.jurisdiction].regCount++;
    if (r.status === "enacted" || r.status === "in_effect") {
      stats[r.jurisdiction].enactedCount++;
    } else {
      stats[r.jurisdiction].proposedCount++;
    }
  });

  // Count updates and enforcement actions
  (updates ?? []).forEach((u) => {
    const j = regToJurisdiction[u.regulation_id];
    if (!j) return;
    ensureJurisdiction(j);
    stats[j].updateCount++;
    if (u.update_type === "enforcement_action") {
      stats[j].hasEnforcement = true;
    }
  });

  // Find maxes for normalization
  const allStats = Object.values(stats);
  const maxRegCount = Math.max(1, ...allStats.map((s) => s.regCount));
  const maxUpdateCount = Math.max(1, ...allStats.map((s) => s.updateCount));

  // Compute scores
  const result: VelocityMap = {};

  for (const [jurisdiction, s] of Object.entries(stats)) {
    // Component 1: Regulation count (20%)
    const regScore = (s.regCount / maxRegCount) * 100;

    // Component 2: Update count in last 90 days (30%)
    const updateScore = (s.updateCount / maxUpdateCount) * 100;

    // Component 3: Ratio of enacted/in_effect (25%)
    const totalRegs = s.enactedCount + s.proposedCount;
    const enactedRatio = totalRegs > 0 ? s.enactedCount / totalRegs : 0;
    const ratioScore = enactedRatio * 100;

    // Component 4: Enforcement actions (25%)
    const enforcementScore = s.hasEnforcement ? 100 : 0;

    const finalScore = Math.round(
      regScore * 0.2 +
        updateScore * 0.3 +
        ratioScore * 0.25 +
        enforcementScore * 0.25
    );

    const clampedScore = Math.min(100, Math.max(0, finalScore));

    result[jurisdiction] = {
      score: clampedScore,
      level: clampedScore >= 66 ? "high" : clampedScore >= 33 ? "medium" : "low",
    };
  }

  // Cache result
  cachedResult = { data: result, expiresAt: Date.now() + CACHE_TTL_MS };

  return result;
}
