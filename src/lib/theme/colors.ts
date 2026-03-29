/**
 * Centralized design tokens for the Complyze design system.
 * All color configs used across components are defined here.
 * Components import from this file instead of defining local color maps.
 */

/* ------------------------------------------------------------------ */
/* Severity (audit findings, alerts)                                   */
/* ------------------------------------------------------------------ */

export const SEVERITY_COLORS = {
  critical: {
    text: "text-red-400",
    bg: "bg-red-500/12",
    border: "border-red-500/30",
    badge: "bg-red-500/12 text-red-400 border-red-500/30",
    hex: "#ef4444",
    glow: "rgba(239, 68, 68, 0.12)",
  },
  high: {
    text: "text-orange-400",
    bg: "bg-orange-500/12",
    border: "border-orange-500/30",
    badge: "bg-orange-500/12 text-orange-400 border-orange-500/30",
    hex: "#f97316",
    glow: "rgba(249, 115, 22, 0.12)",
  },
  medium: {
    text: "text-yellow-400",
    bg: "bg-yellow-500/12",
    border: "border-yellow-500/30",
    badge: "bg-yellow-500/12 text-yellow-400 border-yellow-500/30",
    hex: "#eab308",
    glow: "rgba(234, 179, 8, 0.12)",
  },
  low: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/12",
    border: "border-emerald-500/30",
    badge: "bg-emerald-500/12 text-emerald-400 border-emerald-500/30",
    hex: "#22c55e",
    glow: "rgba(34, 197, 94, 0.12)",
  },
  info: {
    text: "text-cyan-400",
    bg: "bg-cyan-500/12",
    border: "border-cyan-500/30",
    badge: "bg-cyan-500/12 text-cyan-400 border-cyan-500/30",
    hex: "#06b6d4",
    glow: "rgba(6, 182, 212, 0.12)",
  },
} as const;

/* ------------------------------------------------------------------ */
/* Regulation status                                                   */
/* ------------------------------------------------------------------ */

export const STATUS_COLORS: Record<string, string> = {
  enacted: "bg-emerald-500/12 text-emerald-400 border-emerald-500/30",
  in_effect: "bg-blue-500/12 text-blue-400 border-blue-500/30",
  proposed: "bg-yellow-500/12 text-yellow-400 border-yellow-500/30",
  under_review: "bg-orange-500/12 text-orange-400 border-orange-500/30",
  repealed: "bg-red-500/12 text-red-400 border-red-500/30",
};

/* ------------------------------------------------------------------ */
/* Velocity (regulatory change speed)                                  */
/* ------------------------------------------------------------------ */

export const VELOCITY_COLORS = {
  high: {
    text: "text-red-400",
    bg: "bg-red-500/10",
    badge: "text-red-400 bg-red-500/10",
    hex: "#ef4444",
    hexMuted: "rgba(239,68,68,0.25)",
    hexTracked: "rgba(239,68,68,0.5)",
    stroke: "rgba(239,68,68,0.6)",
    strokeMuted: "rgba(239,68,68,0.3)",
    glow: "#ef4444",
    pin: "#ef4444",
    filter: "url(#glR)",
  },
  medium: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    badge: "text-amber-400 bg-amber-500/10",
    hex: "#f59e0b",
    hexMuted: "rgba(245,158,11,0.25)",
    hexTracked: "rgba(245,158,11,0.5)",
    stroke: "rgba(245,158,11,0.6)",
    strokeMuted: "rgba(245,158,11,0.3)",
    glow: "#f59e0b",
    pin: "#f59e0b",
    filter: "url(#glA)",
  },
  low: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    badge: "text-emerald-400 bg-emerald-500/10",
    hex: "#10b981",
    hexMuted: "rgba(16,185,129,0.25)",
    hexTracked: "rgba(16,185,129,0.5)",
    stroke: "rgba(16,185,129,0.6)",
    strokeMuted: "rgba(16,185,129,0.3)",
    glow: "#10b981",
    pin: "#10b981",
    filter: "url(#glG)",
  },
} as const;

/* ------------------------------------------------------------------ */
/* Risk level (audit report overall)                                   */
/* ------------------------------------------------------------------ */

export const RISK_LEVEL_COLORS = {
  critical: { color: "text-red-400", ring: "stroke-red-400", bg: "bg-red-500/10" },
  high: { color: "text-orange-400", ring: "stroke-orange-400", bg: "bg-orange-500/10" },
  medium: { color: "text-yellow-400", ring: "stroke-yellow-400", bg: "bg-yellow-500/10" },
  low: { color: "text-emerald-400", ring: "stroke-emerald-400", bg: "bg-emerald-500/10" },
} as const;

/* ------------------------------------------------------------------ */
/* Jurisdiction compliance status                                      */
/* ------------------------------------------------------------------ */

export const JURISDICTION_STATUS_COLORS: Record<string, string> = {
  compliant: "bg-emerald-500/12 text-emerald-400 border-emerald-500/30",
  at_risk: "bg-yellow-500/12 text-yellow-400 border-yellow-500/30",
  non_compliant: "bg-red-500/12 text-red-400 border-red-500/30",
  review_needed: "bg-blue-500/12 text-blue-400 border-blue-500/30",
};

/* ------------------------------------------------------------------ */
/* Update type (regulatory timeline)                                   */
/* ------------------------------------------------------------------ */

export const UPDATE_TYPE_COLORS: Record<string, { color: string; label: string }> = {
  new_regulation: { color: "text-blue-400", label: "New" },
  amendment: { color: "text-purple-400", label: "Amendment" },
  status_change: { color: "text-amber-400", label: "Status Change" },
  enforcement_action: { color: "text-red-400", label: "Enforcement" },
  guidance_update: { color: "text-cyan-400", label: "Guidance" },
};

/* ------------------------------------------------------------------ */
/* Category labels                                                     */
/* ------------------------------------------------------------------ */

export const CATEGORY_LABELS: Record<string, string> = {
  legislation: "Legislation",
  executive_order: "Exec Order",
  framework: "Framework",
  guidance: "Guidance",
  standard: "Standard",
};

/* ------------------------------------------------------------------ */
/* Chart bar colors (for Recharts)                                     */
/* ------------------------------------------------------------------ */

export const CHART_BAR_COLORS = [
  "#3b82f6", "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6",
];

/* ------------------------------------------------------------------ */
/* Jurisdiction priority (kanban categories)                           */
/* ------------------------------------------------------------------ */

export const PRIORITY_COLORS = {
  active: {
    accent: "border-l-emerald-500",
    headerColor: "text-emerald-400",
    badgeColor: "bg-emerald-500/15 text-emerald-400",
    bg: "bg-emerald-500/[0.03]",
  },
  monitoring: {
    accent: "border-l-amber-500",
    headerColor: "text-amber-400",
    badgeColor: "bg-amber-500/15 text-amber-400",
    bg: "bg-amber-500/[0.03]",
  },
  expansion: {
    accent: "border-l-blue-500",
    headerColor: "text-blue-400",
    badgeColor: "bg-blue-500/15 text-blue-400",
    bg: "bg-blue-500/[0.03]",
  },
} as const;

/* ------------------------------------------------------------------ */
/* Score color utility                                                 */
/* ------------------------------------------------------------------ */

export function getScoreColor(score: number) {
  if (score > 70) return { text: "text-emerald-500", stroke: "stroke-emerald-500", track: "stroke-emerald-500/15" };
  if (score > 40) return { text: "text-amber-500", stroke: "stroke-amber-500", track: "stroke-amber-500/15" };
  return { text: "text-red-500", stroke: "stroke-red-500", track: "stroke-red-500/15" };
}

/* ------------------------------------------------------------------ */
/* WorldMap constants                                                  */
/* ------------------------------------------------------------------ */

export const MAP_COLORS = {
  darkFill: "#141922",
  darkStroke: "#1e2533",
  bg: "#0b0f15",
};
