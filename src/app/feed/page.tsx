import { Suspense } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { RegulationCard } from "@/components/feed/RegulationCard";
import { FeedFilters } from "@/components/feed/FeedFilters";
import { UpdateTimeline } from "@/components/feed/UpdateTimeline";
import { Separator } from "@/components/ui/separator";
import type { Regulation, RegulatoryUpdate } from "@/lib/types/regulation";

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

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const params = await searchParams;
  const [{ regulations, total, page, totalPages }, updates] = await Promise.all(
    [getRegulations(params), getRecentUpdates()]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Regulatory Intelligence Feed
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tracking {total} AI regulations across global jurisdictions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] gap-6">
        {/* Filters sidebar */}
        <aside className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Filters
          </h2>
          <Suspense fallback={null}>
            <FeedFilters />
          </Suspense>
        </aside>

        {/* Main feed */}
        <div className="space-y-4">
          {regulations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">No regulations found</p>
              <p className="text-sm mt-1">
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            <>
              {regulations.map((reg) => (
                <RegulationCard key={reg.id} regulation={reg} />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Updates timeline sidebar */}
        <aside className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Recent Updates
          </h2>
          <Separator />
          <UpdateTimeline updates={updates} />
        </aside>
      </div>
    </div>
  );
}
