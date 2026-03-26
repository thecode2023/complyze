import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const jurisdiction = searchParams.get("jurisdiction");
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
  );
  const offset = (page - 1) * limit;

  const supabase = createAdminClient();

  let query = supabase.from("regulations").select("*", { count: "exact" });

  if (jurisdiction) {
    query = query.eq("jurisdiction", jurisdiction);
  }
  if (status) {
    query = query.eq("status", status);
  }
  if (category) {
    query = query.eq("category", category);
  }
  if (search) {
    query = query.or(
      `title.ilike.%${search}%,summary.ilike.%${search}%,jurisdiction_display.ilike.%${search}%`
    );
  }

  query = query.order("updated_at", { ascending: false });
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch regulations" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: data || [],
    total: count || 0,
    page,
    limit,
    total_pages: Math.ceil((count || 0) / limit),
  });
}
