import { redirect } from "next/navigation";
import { createServerComponentClient } from "@/lib/supabase/server";
import { DashboardClient } from "./DashboardClient";
import { computeVelocityScores } from "@/lib/utils/velocity";

export default async function DashboardPage() {
  const supabase = await createServerComponentClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Check onboarding
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.onboarded) {
    redirect("/dashboard/onboarding");
  }

  // Fetch posture snapshots (last 30 days)
  const { data: snapshots } = await supabase
    .from("posture_snapshots")
    .select("*")
    .eq("user_id", user.id)
    .order("snapshot_date", { ascending: false })
    .limit(30);

  // Fetch alerts (most recent 50, not dismissed)
  const { data: alerts } = await supabase
    .from("compliance_alerts")
    .select("*")
    .eq("user_id", user.id)
    .eq("dismissed", false)
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch latest digest
  const { data: digests } = await supabase
    .from("weekly_digests")
    .select("*")
    .eq("user_id", user.id)
    .order("period_end", { ascending: false })
    .limit(1);

  // Fetch regulation counts per jurisdiction
  const { data: regulations } = await supabase
    .from("regulations")
    .select("jurisdiction, status");

  // Count unread alerts
  const { count: unreadCount } = await supabase
    .from("compliance_alerts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false)
    .eq("dismissed", false);

  // Build jurisdiction regulation counts
  const regCounts: Record<string, number> = {};
  (regulations ?? []).forEach((r) => {
    regCounts[r.jurisdiction] = (regCounts[r.jurisdiction] || 0) + 1;
  });

  // Total tracked regulations for user's jurisdictions
  const trackedRegCount = profile.jurisdictions.reduce(
    (sum: number, j: string) => sum + (regCounts[j] || 0),
    0
  );

  // Compute velocity scores
  const velocityScores = await computeVelocityScores(supabase);

  return (
    <DashboardClient
      profile={profile}
      snapshots={snapshots ?? []}
      alerts={alerts ?? []}
      digest={digests?.[0] ?? null}
      regCounts={regCounts}
      trackedRegCount={trackedRegCount}
      unreadCount={unreadCount ?? 0}
      velocityScores={velocityScores}
    />
  );
}
