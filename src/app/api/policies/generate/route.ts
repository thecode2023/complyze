import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@/lib/supabase/server";
import { callGeminiWithRetry } from "@/lib/ai/client";
import { buildGeneratePolicyPrompt } from "@/lib/ai/prompts/generate-policy";
import { POLICY_TYPE_OPTIONS } from "@/lib/types/policy";
import type { Regulation } from "@/lib/types/regulation";

export async function POST(request: NextRequest) {
  const supabase = await createServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      regulation_ids,
      policy_type,
      industry,
      organization_details,
      company_name,
      company_size,
      ai_use_cases,
      geographic_operations,
      stakeholders,
    } = body as {
      regulation_ids: string[];
      policy_type: string;
      industry: string;
      organization_details?: string;
      company_name?: string;
      company_size?: string;
      ai_use_cases?: string[];
      geographic_operations?: string[];
      stakeholders?: string;
    };

    if (!regulation_ids || regulation_ids.length === 0) {
      return NextResponse.json(
        { error: "At least one regulation must be selected" },
        { status: 400 }
      );
    }

    if (!policy_type || !POLICY_TYPE_OPTIONS.some((o) => o.value === policy_type)) {
      return NextResponse.json(
        { error: "Invalid policy type" },
        { status: 400 }
      );
    }

    if (!industry || industry.trim().length === 0) {
      return NextResponse.json(
        { error: "Industry is required" },
        { status: 400 }
      );
    }

    const { data: regulations, error: regError } = await supabase
      .from("regulations")
      .select("*")
      .in("id", regulation_ids);

    if (regError || !regulations || regulations.length === 0) {
      return NextResponse.json(
        { error: "Failed to fetch selected regulations" },
        { status: 400 }
      );
    }

    const policyTypeLabel =
      POLICY_TYPE_OPTIONS.find((o) => o.value === policy_type)?.label ||
      policy_type;

    const prompt = buildGeneratePolicyPrompt({
      regulations: regulations as Regulation[],
      policyType: policyTypeLabel,
      industry,
      companyName: company_name,
      companySize: company_size,
      aiUseCases: ai_use_cases,
      geographicOperations: geographic_operations,
      stakeholders,
      organizationDetails: organization_details,
    });

    const content_markdown = await callGeminiWithRetry(prompt);

    const title = `${policyTypeLabel} — ${regulations[0].title}${regulations.length > 1 ? ` (+${regulations.length - 1} more)` : ""}`;

    return NextResponse.json({ content_markdown, title });
  } catch (error) {
    console.error("[policies/generate] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate policy",
      },
      { status: 500 }
    );
  }
}
