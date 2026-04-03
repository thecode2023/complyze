"use client";

import Link from "next/link";
import {
  Shield,
  FileSearch,
  FileText,
  LayoutDashboard,
  AlertTriangle,
  Gavel,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickStartProps {
  totalRegs: number;
  enactedRegs: number;
  upcomingDeadlines: number;
  penaltyExposure: number;
  hasCriminal: boolean;
  jurisdictionCount: number;
  industry: string;
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export function QuickStartClient({
  totalRegs,
  enactedRegs,
  upcomingDeadlines,
  penaltyExposure,
  hasCriminal,
  jurisdictionCount,
  industry,
}: QuickStartProps) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <Shield className="w-10 h-10 text-primary mx-auto mb-3" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Your Compliance Quick Start
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s your regulatory landscape across {jurisdictionCount} tracked jurisdiction{jurisdictionCount !== 1 ? "s" : ""}.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <Gavel className="w-5 h-5 text-primary mx-auto mb-1.5" />
            <p className="text-2xl font-bold tabular-nums">{totalRegs}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Regulations</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <Shield className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
            <p className="text-2xl font-bold tabular-nums">{enactedRegs}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Enacted / In Effect</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <CalendarClock className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
            <p className="text-2xl font-bold tabular-nums">{upcomingDeadlines}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Upcoming Deadlines</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <AlertTriangle className={`w-5 h-5 mx-auto mb-1.5 ${hasCriminal ? "text-red-400" : "text-orange-400"}`} />
            <p className="text-2xl font-bold tabular-nums">{formatCurrency(penaltyExposure)}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Max Exposure</p>
          </div>
        </div>

        {/* Action paths */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            What would you like to do first?
          </h2>

          <Link
            href={`/audit${industry ? `?industry=${encodeURIComponent(industry)}` : ""}`}
            className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-muted/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
              <FileSearch className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                See my biggest risks
              </p>
              <p className="text-xs text-muted-foreground">
                Run a compliance audit against your AI agent config to find gaps.
              </p>
            </div>
            <Button variant="outline" size="sm" className="shrink-0 text-xs">
              Run Audit
            </Button>
          </Link>

          <Link
            href="/policies"
            className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-muted/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                Generate my first policy
              </p>
              <p className="text-xs text-muted-foreground">
                Create a tailored compliance policy from your regulatory requirements.
              </p>
            </div>
            <Button variant="outline" size="sm" className="shrink-0 text-xs">
              Generate
            </Button>
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-muted/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                Explore my dashboard
              </p>
              <p className="text-xs text-muted-foreground">
                Browse your compliance posture, alerts, and jurisdiction overview.
              </p>
            </div>
            <Button variant="outline" size="sm" className="shrink-0 text-xs">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
