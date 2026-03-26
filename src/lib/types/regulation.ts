export interface Regulation {
  id: string;
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
  last_verified_at: string;
  ai_classified: boolean;
  ai_confidence: number | null;
  created_at: string;
  updated_at: string;
}

export interface RegulatoryUpdate {
  id: string;
  regulation_id: string;
  update_type:
    | "new_regulation"
    | "amendment"
    | "status_change"
    | "enforcement_action"
    | "guidance_update";
  title: string;
  summary: string;
  source_url: string | null;
  detected_at: string;
  verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  raw_source_text: string | null;
  created_at: string;
}

export interface RegulationFilters {
  jurisdiction?: string;
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
