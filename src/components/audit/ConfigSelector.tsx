"use client";

import { cn } from "@/lib/utils";
import { exampleConfigs, type ExampleConfig } from "@/lib/utils/example-config";

const riskColors: Record<ExampleConfig["riskPreview"], string> = {
  Critical: "text-red-400 bg-red-500/15 border-red-500/30",
  High: "text-orange-400 bg-orange-500/15 border-orange-500/30",
  Medium: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  Low: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
};

interface ConfigSelectorProps {
  onSelect: (configJson: string) => void;
}

export function ConfigSelector({ onSelect }: ConfigSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Example Configs
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {exampleConfigs.map((cfg) => (
          <button
            key={cfg.id}
            onClick={() => onSelect(JSON.stringify(cfg.config, null, 2))}
            className="group flex items-start gap-3 rounded-lg border border-border p-3 text-left transition-all hover:border-primary/50 hover:bg-accent/30"
          >
            <span className="text-xl mt-0.5 shrink-0">{cfg.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                  {cfg.name}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    riskColors[cfg.riskPreview]
                  )}
                >
                  {cfg.riskPreview} Risk
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {cfg.description}
              </p>
              <span className="text-[10px] text-muted-foreground/70">{cfg.industry}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
