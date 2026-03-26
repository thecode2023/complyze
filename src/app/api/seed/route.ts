import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { seedRegulations, seedUpdates } from "@/lib/seed/regulations";

export async function POST(request: NextRequest) {
  const cronSecret = request.headers.get("x-cron-secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  try {
    // Check if data already exists
    const { count } = await supabase
      .from("regulations")
      .select("*", { count: "exact", head: true });

    if (count && count > 0) {
      return NextResponse.json({
        message: `Database already seeded with ${count} regulations. Delete existing data first to re-seed.`,
      });
    }

    // Insert regulations
    const { data: insertedRegulations, error: regError } = await supabase
      .from("regulations")
      .insert(
        seedRegulations.map((reg) => ({
          title: reg.title,
          jurisdiction: reg.jurisdiction,
          jurisdiction_display: reg.jurisdiction_display,
          status: reg.status,
          category: reg.category,
          summary: reg.summary,
          key_requirements: reg.key_requirements,
          compliance_implications: reg.compliance_implications,
          effective_date: reg.effective_date,
          source_url: reg.source_url,
          source_name: reg.source_name,
          ai_classified: reg.ai_classified,
          ai_confidence: reg.ai_confidence,
          last_verified_at: new Date().toISOString(),
        }))
      )
      .select();

    if (regError) {
      throw new Error(`Failed to insert regulations: ${regError.message}`);
    }

    // Insert regulatory updates linked to the correct regulation IDs
    const updates = seedUpdates.map((update) => ({
      regulation_id: insertedRegulations[update.regulation_index].id,
      update_type: update.update_type,
      title: update.title,
      summary: update.summary,
      source_url: update.source_url,
      verified: update.verified,
      verified_by: update.verified_by,
      verified_at: update.verified ? new Date().toISOString() : null,
      detected_at: new Date().toISOString(),
    }));

    const { error: updateError } = await supabase
      .from("regulatory_updates")
      .insert(updates);

    if (updateError) {
      throw new Error(`Failed to insert updates: ${updateError.message}`);
    }

    return NextResponse.json({
      message: "Database seeded successfully",
      regulations_count: insertedRegulations.length,
      updates_count: updates.length,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error during seeding";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
