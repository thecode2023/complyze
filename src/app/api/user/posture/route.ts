import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@/lib/supabase/server";

// GET: Returns posture snapshots for charting (supports date range params)
export async function GET(request: NextRequest) {
  const supabase = await createServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from"); // ISO date string, e.g. "2026-01-01"
  const to = searchParams.get("to"); // ISO date string
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "90", 10), 365);

  let query = supabase
    .from("posture_snapshots")
    .select("*")
    .eq("user_id", user.id)
    .order("snapshot_date", { ascending: false })
    .limit(limit);

  if (from) {
    query = query.gte("snapshot_date", from);
  }
  if (to) {
    query = query.lte("snapshot_date", to);
  }

  const { data: snapshots, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(snapshots ?? []);
}
