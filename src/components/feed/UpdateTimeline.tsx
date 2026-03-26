import {
  FileText,
  AlertTriangle,
  RefreshCw,
  Gavel,
  BookOpen,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { RegulatoryUpdate } from "@/lib/types/regulation";

const updateTypeConfig: Record<
  string,
  { icon: typeof FileText; label: string; color: string }
> = {
  new_regulation: {
    icon: FileText,
    label: "New",
    color: "text-green-400",
  },
  amendment: {
    icon: RefreshCw,
    label: "Amendment",
    color: "text-blue-400",
  },
  status_change: {
    icon: AlertTriangle,
    label: "Status Change",
    color: "text-yellow-400",
  },
  enforcement_action: {
    icon: Gavel,
    label: "Enforcement",
    color: "text-red-400",
  },
  guidance_update: {
    icon: BookOpen,
    label: "Guidance",
    color: "text-purple-400",
  },
};

export function UpdateTimeline({ updates }: { updates: RegulatoryUpdate[] }) {
  if (!updates.length) {
    return (
      <div className="text-sm text-muted-foreground text-center py-6">
        No regulatory updates yet.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {updates.map((update, index) => {
        const config = updateTypeConfig[update.update_type] || {
          icon: FileText,
          label: update.update_type,
          color: "text-muted-foreground",
        };
        const Icon = config.icon;

        return (
          <div key={update.id} className="relative flex gap-3 pb-4">
            {/* Timeline line */}
            {index < updates.length - 1 && (
              <div className="absolute left-[11px] top-6 h-full w-px bg-border" />
            )}

            {/* Icon */}
            <div
              className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-background ${config.color}`}
            >
              <Icon className="h-3 w-3" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {config.label}
                </Badge>
                {update.verified && (
                  <span className="flex items-center gap-0.5 text-[10px] text-green-400">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    Verified
                  </span>
                )}
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Clock className="h-2.5 w-2.5" />
                  {formatDistanceToNow(new Date(update.detected_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p className="text-sm font-medium leading-snug">{update.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {update.summary}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
