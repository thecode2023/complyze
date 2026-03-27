"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ComplianceGauge } from "./ComplianceGauge";
import { JURISDICTION_OPTIONS } from "@/lib/types/user";

export interface JurisdictionData {
  code: string;
  score: number;
  regulationCount: number;
  velocity: "high" | "medium" | "low";
  velocityScore?: number;
  status: "compliant" | "at_risk" | "non_compliant";
}

interface JurisdictionCardProps {
  data: JurisdictionData;
}

const velocityConfig = {
  high: { label: "High", color: "text-red-500 bg-red-500/10" },
  medium: { label: "Medium", color: "text-amber-500 bg-amber-500/10" },
  low: { label: "Low", color: "text-emerald-500 bg-emerald-500/10" },
};

const statusConfig = {
  compliant: { label: "Compliant", color: "text-emerald-500" },
  at_risk: { label: "At Risk", color: "text-amber-500" },
  non_compliant: { label: "Non-Compliant", color: "text-red-500" },
};

export function JurisdictionCard({ data }: JurisdictionCardProps) {
  const jurisdiction = JURISDICTION_OPTIONS.find((j) => j.code === data.code);
  const vel = velocityConfig[data.velocity];
  const stat = statusConfig[data.status];

  return (
    <Link
      href={`/feed?jurisdiction=${data.code}`}
      className="block rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-accent/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{jurisdiction?.flag ?? "🌐"}</span>
            <span className="font-medium text-sm truncate">
              {jurisdiction?.name ?? data.code}
            </span>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Regulations</span>
              <span className="font-medium">{data.regulationCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Velocity</span>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", vel.color)}>
                {vel.label}{data.velocityScore != null ? ` (${data.velocityScore})` : ""}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Status</span>
              <span className={cn("font-medium", stat.color)}>{stat.label}</span>
            </div>
          </div>
        </div>

        <ComplianceGauge score={data.score} size="sm" />
      </div>
    </Link>
  );
}
