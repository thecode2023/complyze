"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  MoreHorizontal,
  ExternalLink,
  FileSearch,
  ArrowRight,
  Trash2,
  Shield,
  Eye,
  Compass,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { JURISDICTION_OPTIONS } from "@/lib/types/user";
import type { JurisdictionPriority } from "@/lib/types/user";

export interface JurisdictionData {
  code: string;
  score: number;
  regulationCount: number;
  velocity: "high" | "medium" | "low";
  velocityScore?: number;
  status: "compliant" | "at_risk" | "non_compliant";
  priority: JurisdictionPriority;
  auditCoverage: number;
  lastUpdateDate: string | null;
}

/* ------------------------------------------------------------------ */
/* Compact Jurisdiction Card                                           */
/* ------------------------------------------------------------------ */

const velocityConfig = {
  high: { label: "High", color: "text-red-400 bg-red-500/10" },
  medium: { label: "Med", color: "text-amber-400 bg-amber-500/10" },
  low: { label: "Low", color: "text-emerald-400 bg-emerald-500/10" },
};

const priorityLabels: Record<JurisdictionPriority, string> = {
  active: "Active Compliance",
  monitoring: "Monitoring",
  expansion: "Expansion Target",
};

interface JurisdictionCardProps {
  data: JurisdictionData;
  onChangePriority: (code: string, priority: JurisdictionPriority) => void;
  onRemove: (code: string) => void;
}

function JurisdictionCard({ data, onChangePriority, onRemove }: JurisdictionCardProps) {
  const jurisdiction = JURISDICTION_OPTIONS.find((j) => j.code === data.code);
  const vel = velocityConfig[data.velocity];
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const otherPriorities = (["active", "monitoring", "expansion"] as JurisdictionPriority[]).filter(
    (p) => p !== data.priority
  );

  return (
    <div className="rounded-md border border-border/60 bg-card/50 transition-all hover:border-border hover:bg-card group">
      {/* Main row — always visible, compact */}
      <div
        className="flex items-center gap-2 px-2.5 py-2 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-sm shrink-0">{jurisdiction?.flag ?? "🌐"}</span>
        <span className="text-xs font-medium truncate flex-1">
          {jurisdiction?.name ?? data.code}
        </span>
        <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
          {data.regulationCount}
        </span>
        <span className={cn("rounded px-1.5 py-px text-[9px] font-semibold shrink-0", vel.color)}>
          {vel.label}
        </span>

        {/* Action menu trigger */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <MoreHorizontal className="h-3 w-3" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-6 z-50 w-44 rounded-md border border-border bg-popover shadow-lg py-0.5 text-xs">
              <Link
                href={`/feed?jurisdiction=${data.code}`}
                className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-accent text-popover-foreground"
                onClick={() => setMenuOpen(false)}
              >
                <ExternalLink className="h-3 w-3" />
                View Regulations
              </Link>
              <Link
                href="/audit"
                className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-accent text-popover-foreground"
                onClick={() => setMenuOpen(false)}
              >
                <FileSearch className="h-3 w-3" />
                Run Audit
              </Link>
              <div className="my-0.5 h-px bg-border" />
              {otherPriorities.map((p) => (
                <button
                  key={p}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangePriority(data.code, p);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-accent w-full text-left text-popover-foreground"
                >
                  <ArrowRight className="h-3 w-3" />
                  {priorityLabels[p]}
                </button>
              ))}
              <div className="my-0.5 h-px bg-border" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(data.code);
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-destructive/10 w-full text-left text-destructive"
              >
                <Trash2 className="h-3 w-3" />
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expanded details — shown on click */}
      {expanded && (
        <div className="border-t border-border/40 px-2.5 py-2 space-y-1.5 text-[10px] text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Audit Coverage</span>
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-16 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    data.auditCoverage >= 70
                      ? "bg-emerald-500"
                      : data.auditCoverage >= 40
                        ? "bg-amber-500"
                        : "bg-red-500"
                  )}
                  style={{ width: `${data.auditCoverage}%` }}
                />
              </div>
              <span className="tabular-nums">{data.auditCoverage}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>Velocity Score</span>
            <span className="tabular-nums">{data.velocityScore ?? 0}/100</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Last Update</span>
            <span>
              {data.lastUpdateDate
                ? formatDistanceToNow(new Date(data.lastUpdateDate), { addSuffix: true })
                : "None"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Column                                                              */
/* ------------------------------------------------------------------ */

const categoryConfig: Record<
  JurisdictionPriority,
  {
    label: string;
    icon: typeof Shield;
    bg: string;
    headerColor: string;
    badgeColor: string;
    emptyText: string;
  }
> = {
  active: {
    label: "Active Compliance",
    icon: Shield,
    bg: "bg-emerald-500/[0.03]",
    headerColor: "text-emerald-400",
    badgeColor: "bg-emerald-500/15 text-emerald-400",
    emptyText: "No active jurisdictions",
  },
  monitoring: {
    label: "Monitoring",
    icon: Eye,
    bg: "bg-amber-500/[0.03]",
    headerColor: "text-amber-400",
    badgeColor: "bg-amber-500/15 text-amber-400",
    emptyText: "No jurisdictions being monitored",
  },
  expansion: {
    label: "Expansion Targets",
    icon: Compass,
    bg: "bg-blue-500/[0.03]",
    headerColor: "text-blue-400",
    badgeColor: "bg-blue-500/15 text-blue-400",
    emptyText: "No expansion targets",
  },
};

/* ------------------------------------------------------------------ */
/* Kanban Command Center                                               */
/* ------------------------------------------------------------------ */

interface JurisdictionCommandCenterProps {
  jurisdictions: JurisdictionData[];
  onChangePriority: (code: string, priority: JurisdictionPriority) => void;
  onRemove: (code: string) => void;
}

export function JurisdictionCommandCenter({
  jurisdictions,
  onChangePriority,
  onRemove,
}: JurisdictionCommandCenterProps) {
  const categories: JurisdictionPriority[] = ["active", "monitoring", "expansion"];

  // Mobile accordion state
  const [openAccordion, setOpenAccordion] = useState<JurisdictionPriority | null>("active");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">Jurisdiction Command Center</h3>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {jurisdictions.length} tracked
        </span>
      </div>

      {/* Desktop / Tablet: 3-column kanban */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const cfg = categoryConfig[cat];
          const Icon = cfg.icon;
          const items = jurisdictions.filter((j) => j.priority === cat);

          return (
            <div
              key={cat}
              className={cn(
                "rounded-lg border border-border/60 overflow-hidden flex flex-col",
                cfg.bg
              )}
            >
              {/* Column header */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40">
                <Icon className={cn("h-3.5 w-3.5", cfg.headerColor)} />
                <span className={cn("text-xs font-semibold uppercase tracking-wider", cfg.headerColor)}>
                  {cfg.label}
                </span>
                <span
                  className={cn(
                    "ml-auto rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums",
                    cfg.badgeColor
                  )}
                >
                  {items.length}
                </span>
              </div>

              {/* Cards */}
              <div className="p-2 space-y-1.5 flex-1 min-h-[80px] max-h-[400px] overflow-y-auto">
                {items.length === 0 ? (
                  <div className="flex items-center justify-center h-full min-h-[60px] text-[10px] text-muted-foreground/60">
                    {cfg.emptyText}
                  </div>
                ) : (
                  items.map((j) => (
                    <JurisdictionCard
                      key={j.code}
                      data={j}
                      onChangePriority={onChangePriority}
                      onRemove={onRemove}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: Accordion */}
      <div className="sm:hidden space-y-2">
        {categories.map((cat) => {
          const cfg = categoryConfig[cat];
          const Icon = cfg.icon;
          const items = jurisdictions.filter((j) => j.priority === cat);
          const isOpen = openAccordion === cat;

          return (
            <div
              key={cat}
              className={cn("rounded-lg border border-border/60 overflow-hidden", cfg.bg)}
            >
              <button
                onClick={() => setOpenAccordion(isOpen ? null : cat)}
                className="flex items-center gap-2 px-3 py-2.5 w-full text-left"
              >
                <Icon className={cn("h-3.5 w-3.5", cfg.headerColor)} />
                <span className={cn("text-xs font-semibold uppercase tracking-wider flex-1", cfg.headerColor)}>
                  {cfg.label}
                </span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums",
                    cfg.badgeColor
                  )}
                >
                  {items.length}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-muted-foreground transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              {isOpen && (
                <div className="p-2 pt-0 space-y-1.5 border-t border-border/40">
                  {items.length === 0 ? (
                    <div className="flex items-center justify-center py-4 text-[10px] text-muted-foreground/60">
                      {cfg.emptyText}
                    </div>
                  ) : (
                    items.map((j) => (
                      <JurisdictionCard
                        key={j.code}
                        data={j}
                        onChangePriority={onChangePriority}
                        onRemove={onRemove}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
