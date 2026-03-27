import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { callGeminiWithRetry } from "@/lib/ai/client";
import { buildClassifyRegulationPrompt } from "@/lib/ai/prompts/classify-regulation";
import { buildExtractUpdatePrompt } from "@/lib/ai/prompts/extract-update";
import { fetchAllRSSFeeds } from "@/lib/utils/rss";
import type { ClassifiedRegulation, ExtractedUpdate } from "@/lib/ai/types";

const MAX_API_CALLS = 20;

export async function POST(request: NextRequest) {
  // Auth gate
  const cronSecret =
    request.headers.get("x-cron-secret") ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const runId = crypto.randomUUID();
  let apiCallCount = 0;

  const logEntry = async (
    sourceName: string,
    status: "success" | "failure" | "skipped",
    details: {
      items_processed?: number;
      items_created?: number;
      items_updated?: number;
      items_skipped?: number;
      error_message?: string;
    }
  ) => {
    await supabase.from("ingestion_logs").insert({
      run_id: runId,
      source_name: sourceName,
      status,
      ...details,
      completed_at: new Date().toISOString(),
    });
  };

  try {
    // Get existing regulation titles for dedup and update matching
    const { data: existingRegs } = await supabase
      .from("regulations")
      .select("id, title, jurisdiction, status");

    const existingTitles = (existingRegs || []).map((r) => r.title);
    const existingTitleSet = new Set(
      existingTitles.map((t) => t.toLowerCase())
    );

    // Fetch RSS feeds
    const feedItems = await fetchAllRSSFeeds();

    let totalCreated = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalAlerts = 0;

    // Helper: generate alerts for affected users when a regulation is created/updated
    async function generateAlerts(
      regulationId: string,
      jurisdiction: string,
      regulationStatus: string,
      updateType: string,
      title: string,
      summary: string
    ) {
      // Find users whose jurisdictions overlap with this regulation's jurisdiction
      const { data: affectedUsers } = await supabase
        .from("user_profiles")
        .select("id")
        .filter("jurisdictions", "cs", `{${jurisdiction}}`);

      if (!affectedUsers || affectedUsers.length === 0) return;

      // Determine severity based on regulation status and update type
      let severity: "critical" | "high" | "medium" | "low" = "medium";
      if (updateType === "enforcement_action") {
        severity = "critical";
      } else if (
        updateType === "new_regulation" &&
        (regulationStatus === "enacted" || regulationStatus === "in_effect")
      ) {
        severity = "high";
      } else if (updateType === "amendment" || updateType === "status_change") {
        severity = "high";
      } else if (updateType === "guidance_update") {
        severity = "low";
      }

      // Determine alert_type from update_type (must match DB constraint)
      const alertType =
        updateType === "new_regulation"
          ? "new_regulation"
          : updateType === "enforcement_action"
            ? "enforcement_action"
            : "regulation_changed";

      const alertRows = affectedUsers.map((u) => ({
        user_id: u.id,
        regulation_id: regulationId,
        alert_type: alertType,
        severity,
        title,
        summary,
        read: false,
        dismissed: false,
      }));

      const { error: alertError } = await supabase
        .from("compliance_alerts")
        .insert(alertRows);

      if (!alertError) {
        totalAlerts += alertRows.length;
      }
    }

    for (const item of feedItems) {
      if (apiCallCount >= MAX_API_CALLS) {
        await logEntry("rate_limit", "skipped", {
          items_skipped: feedItems.length - totalCreated - totalUpdated - totalSkipped,
          error_message: `Rate limit reached (${MAX_API_CALLS} API calls)`,
        });
        break;
      }

      try {
        // First, check if this might be an update to an existing regulation
        const updatePrompt = buildExtractUpdatePrompt(
          `${item.title}\n\n${item.contentSnippet}`,
          item.link,
          existingTitles
        );

        apiCallCount++;
        const updateResponse = await callGeminiWithRetry(updatePrompt);
        const updateData = parseJsonResponse(updateResponse);

        if (updateData?.is_relevant && updateData.updates?.length > 0) {
          for (const update of updateData.updates as ExtractedUpdate[]) {
            // Find matching regulation
            const matchingReg = (existingRegs || []).find(
              (r) =>
                r.title.toLowerCase() === update.regulation_title.toLowerCase()
            );

            if (matchingReg) {
              // Insert as regulatory update
              await supabase.from("regulatory_updates").insert({
                regulation_id: matchingReg.id,
                update_type: update.update_type,
                title: update.title,
                summary: update.summary,
                source_url: update.source_url,
                verified: false,
                raw_source_text: item.contentSnippet,
                detected_at: new Date().toISOString(),
              });

              // Generate alerts for affected users
              await generateAlerts(
                matchingReg.id,
                matchingReg.jurisdiction,
                matchingReg.status,
                update.update_type,
                update.title,
                update.summary
              );

              totalUpdated++;
            } else if (update.update_type === "new_regulation") {
              // Classify as new regulation
              if (apiCallCount >= MAX_API_CALLS) break;

              const classifyPrompt = buildClassifyRegulationPrompt(
                `${item.title}\n\n${item.contentSnippet}`,
                item.link,
                item.source
              );

              apiCallCount++;
              const classifyResponse =
                await callGeminiWithRetry(classifyPrompt);
              const classified = parseJsonResponse(
                classifyResponse
              ) as ClassifiedRegulation | null;

              if (
                classified &&
                classified.confidence > 0.3 &&
                !existingTitleSet.has(classified.title.toLowerCase())
              ) {
                const { data: newReg } = await supabase
                  .from("regulations")
                  .insert({
                    title: classified.title,
                    jurisdiction: classified.jurisdiction,
                    jurisdiction_display: classified.jurisdiction_display,
                    status: classified.status,
                    category: classified.category,
                    summary: classified.summary,
                    key_requirements: classified.key_requirements,
                    compliance_implications: classified.compliance_implications,
                    effective_date: classified.effective_date,
                    source_url: classified.source_url,
                    source_name: classified.source_name,
                    ai_classified: true,
                    ai_confidence: classified.confidence,
                    last_verified_at: new Date().toISOString(),
                  })
                  .select("id")
                  .single();

                if (newReg) {
                  await generateAlerts(
                    newReg.id,
                    classified.jurisdiction,
                    classified.status,
                    "new_regulation",
                    classified.title,
                    classified.summary
                  );
                }

                existingTitleSet.add(classified.title.toLowerCase());
                totalCreated++;
              } else {
                totalSkipped++;
              }
            }
          }
        } else {
          totalSkipped++;
        }
      } catch (itemError) {
        const errorMsg =
          itemError instanceof Error ? itemError.message : "Unknown error";
        await logEntry(item.source, "failure", {
          error_message: `Failed processing "${item.title}": ${errorMsg}`,
        });
        totalSkipped++;
      }
    }

    await logEntry("ingestion_run", "success", {
      items_processed: feedItems.length,
      items_created: totalCreated,
      items_updated: totalUpdated,
      items_skipped: totalSkipped,
    });

    return NextResponse.json({
      run_id: runId,
      status: "completed",
      feed_items_fetched: feedItems.length,
      api_calls_made: apiCallCount,
      regulations_created: totalCreated,
      updates_recorded: totalUpdated,
      items_skipped: totalSkipped,
      alerts_generated: totalAlerts,
    });
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Unknown error";

    await logEntry("ingestion_run", "failure", {
      error_message: errorMsg,
    });

    return NextResponse.json(
      {
        run_id: runId,
        status: "failed",
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}

// Also support GET for Vercel Cron (Vercel Cron sends GET requests)
export async function GET(request: NextRequest) {
  return POST(request);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseJsonResponse(text: string): any {
  try {
    // Strip markdown code fences if present
    const cleaned = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}
