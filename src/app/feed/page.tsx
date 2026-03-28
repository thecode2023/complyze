import { createAdminClient } from "@/lib/supabase/admin";
import { FeedClient } from "@/components/feed/FeedClient";
import { computeVelocityScores } from "@/lib/utils/velocity";
import type { Regulation, RegulatoryUpdate } from "@/lib/types/regulation";

export const dynamic = "force-dynamic";

interface FeedPageProps {
  searchParams: Promise<{
    jurisdiction?: string;
    status?: string;
    category?: string;
    search?: string;
    page?: string;
  }>;
}

async function getRegulations(params: {
  jurisdiction?: string;
  status?: string;
  category?: string;
  search?: string;
  page?: string;
}) {
  const supabase = createAdminClient();
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = supabase.from("regulations").select("*", { count: "exact" });

  if (params.jurisdiction) {
    query = query.eq("jurisdiction", params.jurisdiction);
  }
  if (params.status) {
    query = query.eq("status", params.status);
  }
  if (params.category) {
    query = query.eq("category", params.category);
  }
  if (params.search) {
    query = query.or(
      `title.ilike.%${params.search}%,summary.ilike.%${params.search}%,jurisdiction_display.ilike.%${params.search}%`
    );
  }

  query = query.order("updated_at", { ascending: false });
  query = query.range(offset, offset + limit - 1);

  const { data, count } = await query;

  return {
    regulations: (data || []) as Regulation[],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

async function getRecentUpdates() {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("regulatory_updates")
    .select("*")
    .order("detected_at", { ascending: false })
    .limit(10);

  return (data || []) as RegulatoryUpdate[];
}

async function getDistinctJurisdictions() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("regulations")
    .select("jurisdiction, jurisdiction_display");

  if (!data) return [];

  const seen = new Map<string, string>();
  for (const r of data) {
    if (!seen.has(r.jurisdiction)) {
      seen.set(r.jurisdiction, r.jurisdiction_display);
    }
  }

  return Array.from(seen.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const params = await searchParams;
  const supabase = createAdminClient();
  const [
    { regulations, total, page, totalPages },
    updates,
    velocityScores,
    jurisdictionOptions,
  ] = await Promise.all([
    getRegulations(params),
    getRecentUpdates(),
    computeVelocityScores(supabase),
    getDistinctJurisdictions(),
  ]);

  return (
    <FeedClient
      regulations={regulations}
      total={total}
      page={page}
      totalPages={totalPages}
      updates={updates}
      velocityScores={velocityScores}
      jurisdictionOptions={jurisdictionOptions}
    />
  );
}
