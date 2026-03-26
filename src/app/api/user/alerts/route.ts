import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@/lib/supabase/server";

// GET: Returns user's alerts (paginated, filterable)
export async function GET(request: NextRequest) {
  const supabase = await createServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);
  const filterRead = searchParams.get("read"); // "true", "false", or null (all)
  const severity = searchParams.get("severity"); // "critical", "high", etc.
  const offset = (page - 1) * limit;

  let query = supabase
    .from("compliance_alerts")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .eq("dismissed", false)
    .order("created_at", { ascending: false });

  if (filterRead === "true") {
    query = query.eq("read", true);
  } else if (filterRead === "false") {
    query = query.eq("read", false);
  }

  if (severity) {
    query = query.eq("severity", severity);
  }

  query = query.range(offset, offset + limit - 1);

  const { data: alerts, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: alerts ?? [],
    total: count ?? 0,
    page,
    limit,
    total_pages: Math.ceil((count ?? 0) / limit),
  });
}

// PATCH: Mark alerts as read or dismissed (accepts array of alert IDs)
export async function PATCH(request: NextRequest) {
  const supabase = await createServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { alert_ids, action } = body as {
    alert_ids: string[];
    action: "mark_read" | "dismiss";
  };

  if (!alert_ids?.length || !["mark_read", "dismiss"].includes(action)) {
    return NextResponse.json(
      { error: "alert_ids (array) and action ('mark_read' | 'dismiss') are required" },
      { status: 400 }
    );
  }

  const updateField = action === "mark_read" ? { read: true } : { dismissed: true };

  const { error } = await supabase
    .from("compliance_alerts")
    .update(updateField)
    .in("id", alert_ids)
    .eq("user_id", user.id); // RLS + explicit check

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ updated: alert_ids.length, action });
}
