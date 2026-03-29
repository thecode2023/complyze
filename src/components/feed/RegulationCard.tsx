import { ExternalLink, Clock, CalendarDays, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Regulation } from "@/lib/types/regulation";
import type { VelocityResult } from "@/lib/utils/velocity";

const statusColors: Record<string, string> = {
  enacted: "bg-green-500/15 text-green-400 border-green-500/30",
  in_effect: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  proposed: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  under_review: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  repealed: "bg-red-500/15 text-red-400 border-red-500/30",
};

const categoryLabels: Record<string, string> = {
  legislation: "Legislation",
  executive_order: "Executive Order",
  framework: "Framework",
  guidance: "Guidance",
  standard: "Standard",
};

const velocityColors = {
  high: "text-red-400 bg-red-500/15 border-red-500/30",
  medium: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  low: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
};

export function RegulationCard({
  regulation,
  velocity,
}: {
  regulation: Regulation;
  velocity?: VelocityResult;
}) {
  const statusColor = statusColors[regulation.status] || "";

  return (
    <Card className="transition-colors hover:border-border/80">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base font-semibold leading-snug">
            {regulation.title}
          </CardTitle>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge variant="outline" className="text-xs">
            {regulation.jurisdiction_display}
          </Badge>
          <Badge variant="outline" className={`text-xs ${statusColor}`}>
            {regulation.status.replace("_", " ")}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {categoryLabels[regulation.category] || regulation.category}
          </Badge>
          {velocity && (
            <Badge
              variant="outline"
              className={cn("text-xs gap-1", velocityColors[velocity.level])}
            >
              <Activity className="h-2.5 w-2.5" />
              {velocity.level === "high"
                ? "High Velocity"
                : velocity.level === "medium"
                  ? "Med Velocity"
                  : "Low Velocity"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {regulation.summary}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {regulation.effective_date && (
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              Effective:{" "}
              {format(new Date(regulation.effective_date), "MMM d, yyyy")}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Verified {format(new Date(regulation.last_verified_at), "MMM d, yyyy")}
          </span>
          <a
            href={regulation.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            {regulation.source_name}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
