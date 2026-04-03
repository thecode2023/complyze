import { redirect } from "next/navigation";
import { createServerComponentClient } from "@/lib/supabase/server";
import { estimateMaxExposure } from "@/lib/utils/cost-estimator";
import { QuickStartClient } from "./QuickStartClient";

export default async function QuickStartPage() {
  const supabase = await createServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/dashboard/onboarding");

  const userJurisdictions = (profile.jurisdictions as string[]) || [];

  // Fetch regulations for tracked jurisdictions
  const { data: regulations } = await supabase
    .from("regulations")
    .select("id, title, jurisdiction, status, effective_date")
    .in("jurisdiction", userJurisdictions.length > 0 ? userJurisdictions : ["__none__"]);

  const regs = regulations || [];
  const totalRegs = regs.length;
  const enactedRegs = regs.filter(
    (r) => r.status === "enacted" || r.status === "in_effect"
  ).length;

  const now = new Date();
  const upcomingDeadlines = regs.filter(
    (r) => r.effective_date && new Date(r.effective_date) > now
  ).length;

  const costExposure = estimateMaxExposure(userJurisdictions);

  return (
    <QuickStartClient
      totalRegs={totalRegs}
      enactedRegs={enactedRegs}
      upcomingDeadlines={upcomingDeadlines}
      penaltyExposure={costExposure.total}
      hasCriminal={costExposure.hasCriminal}
      jurisdictionCount={userJurisdictions.length}
      industry={profile.industry || ""}
    />
  );
}
