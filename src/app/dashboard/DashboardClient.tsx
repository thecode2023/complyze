"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Shield,
  Globe,
  BookOpen,
  Bell,
  FileSearch,
  Newspaper,
  UserCog,
  Info,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ComplianceGauge } from "@/components/dashboard/ComplianceGauge";
import { ComplianceTrend, type PostureSnapshot } from "@/components/dashboard/ComplianceTrend";
import { JurisdictionCard, type JurisdictionData } from "@/components/dashboard/JurisdictionCard";
import { AlertsFeed, type ComplianceAlert, type WeeklyDigest } from "@/components/dashboard/AlertsFeed";
import { JURISDICTION_OPTIONS } from "@/lib/types/user";
import type { UserProfile } from "@/lib/types/user";

interface DashboardClientProps {
  profile: UserProfile;
  snapshots: PostureSnapshot[];
  alerts: ComplianceAlert[];
  digest: WeeklyDigest | null;
  regCounts: Record<string, number>;
  trackedRegCount: number;
  unreadCount: number;
}

export function DashboardClient({
  profile,
  snapshots,
  alerts,
  digest,
  regCounts,
  trackedRegCount,
  unreadCount,
}: DashboardClientProps) {
  const router = useRouter();

  // Derive overall score from latest snapshot, or a default
  const latestSnapshot = snapshots[0];
  const overallScore = latestSnapshot?.overall_score ?? 65;

  // Build jurisdiction data from profile
  const jurisdictionScores: Record<string, number> =
    latestSnapshot?.jurisdiction_scores
      ? (typeof latestSnapshot.jurisdiction_scores === "string"
          ? JSON.parse(latestSnapshot.jurisdiction_scores)
          : latestSnapshot.jurisdiction_scores)
      : {};

  const jurisdictionData: JurisdictionData[] = profile.jurisdictions.map((code) => {
    const score = jurisdictionScores[code] ?? 60;
    const regCount = regCounts[code] ?? 0;
    // Derive velocity from regulation count heuristic (will be replaced by real velocity in Step 3.7)
    const velocity: "high" | "medium" | "low" =
      regCount >= 3 ? "high" : regCount >= 1 ? "medium" : "low";
    const status: "compliant" | "at_risk" | "non_compliant" =
      score > 70 ? "compliant" : score > 40 ? "at_risk" : "non_compliant";
    return { code, score, regulationCount: regCount, velocity, status };
  });

  function handleAlertUpdate() {
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Overview Bar */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <ComplianceGauge score={overallScore} size="lg" label="Overall Score" />
            <ScoreInfoButton />
          </div>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
            <StatCard
              icon={Globe}
              label="Jurisdictions"
              value={profile.jurisdictions.length}
              accent="blue"
            />
            <StatCard
              icon={BookOpen}
              label="Regulations"
              value={trackedRegCount}
              accent="purple"
            />
            <StatCard
              icon={Bell}
              label="Unread Alerts"
              value={unreadCount}
              accent={unreadCount > 0 ? "red" : "muted"}
            />
            <StatCard
              icon={Clock}
              label="Last Updated"
              displayValue={
                latestSnapshot
                  ? format(new Date(latestSnapshot.snapshot_date), "MMM d, yyyy")
                  : "\u2014"
              }
              accent="green"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Column 1: Compliance Trend */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 md:col-span-2 lg:col-span-1">
          <ComplianceTrend snapshots={snapshots} />
        </div>

        {/* Column 2: Jurisdiction Cards */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-3">
          <h3 className="text-sm font-medium">Tracked Jurisdictions</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {jurisdictionData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No jurisdictions tracked yet.
              </p>
            ) : (
              jurisdictionData.map((j) => (
                <JurisdictionCard key={j.code} data={j} />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Activity Feed */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 md:col-span-2 lg:col-span-1">
          <AlertsFeed
            alerts={alerts}
            digest={digest}
            onAlertUpdate={handleAlertUpdate}
          />
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
          <Button variant="outline" asChild>
            <a href="/audit">
              <FileSearch className="mr-2 h-4 w-4" />
              Run New Audit
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/feed">
              <Newspaper className="mr-2 h-4 w-4" />
              Browse Regulations
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/dashboard/onboarding">
              <UserCog className="mr-2 h-4 w-4" />
              Edit Profile
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

const accentStyles = {
  blue: {
    border: "border-l-blue-500",
    icon: "text-blue-500 bg-blue-500/10",
    value: "text-foreground",
  },
  purple: {
    border: "border-l-purple-500",
    icon: "text-purple-500 bg-purple-500/10",
    value: "text-foreground",
  },
  red: {
    border: "border-l-red-500",
    icon: "text-red-500 bg-red-500/10",
    value: "text-red-500",
  },
  green: {
    border: "border-l-emerald-500",
    icon: "text-emerald-500 bg-emerald-500/10",
    value: "text-foreground",
  },
  muted: {
    border: "border-l-muted-foreground/30",
    icon: "text-muted-foreground bg-muted",
    value: "text-muted-foreground",
  },
};

function StatCard({
  icon: Icon,
  label,
  value,
  displayValue,
  accent = "muted",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: number;
  displayValue?: string;
  accent?: keyof typeof accentStyles;
}) {
  const style = accentStyles[accent];

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border border-l-[3px] p-3 transition-colors",
        style.border
      )}
    >
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", style.icon)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className={cn("text-lg font-bold leading-tight", style.value)}>
          {displayValue ?? value}
        </div>
        <div className="text-[11px] text-muted-foreground leading-tight">{label}</div>
      </div>
    </div>
  );
}

function ScoreInfoButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute -top-1 -right-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        aria-label="How is this score calculated?"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-50 w-64 rounded-lg border border-border bg-popover p-3 shadow-lg text-xs text-popover-foreground">
            <p className="font-medium mb-1">How is this calculated?</p>
            <p className="text-muted-foreground leading-relaxed">
              Your compliance score is based on regulation coverage across your
              tracked jurisdictions, findings from your most recent audit, and the
              ratio of enacted regulations you&apos;re subject to. It updates daily.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
