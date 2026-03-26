export interface ClassifiedRegulation {
  title: string;
  jurisdiction: string;
  jurisdiction_display: string;
  status: "enacted" | "proposed" | "in_effect" | "under_review" | "repealed";
  category:
    | "legislation"
    | "executive_order"
    | "framework"
    | "guidance"
    | "standard";
  summary: string;
  key_requirements: string[];
  compliance_implications: string[];
  effective_date: string | null;
  source_url: string;
  source_name: string;
  confidence: number;
  needs_human_review: boolean;
  supporting_evidence: string;
}

export interface ExtractedUpdate {
  regulation_title: string;
  update_type:
    | "new_regulation"
    | "amendment"
    | "status_change"
    | "enforcement_action"
    | "guidance_update";
  title: string;
  summary: string;
  source_url: string;
  confidence: number;
  needs_human_review: boolean;
}
