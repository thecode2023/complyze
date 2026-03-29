"use client";

import { cn } from "@/lib/utils";
import { exampleConfigs, type ExampleConfig } from "@/lib/utils/example-config";

const riskColors: Record<ExampleConfig["riskPreview"], string> = {
  Critical: "text-red-400 bg-red-500/12 border-red-500/30",
  High: "text-orange-400 bg-orange-500/12 border-orange-500/30",
  Medium: "text-amber-400 bg-amber-500/12 border-amber-500/30",
  Low: "text-emerald-400 bg-emerald-500/12 border-emerald-500/30",
};

interface ConfigSelectorProps {
  onSelect: (configJson: string) => void;
}

export function ConfigSelector({ onSelect }: ConfigSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-mono font-semibold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
        Example Configs
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
        {exampleConfigs.map((cfg) => (
          <button
            key={cfg.id}
            onClick={() => onSelect(JSON.stringify(cfg.config, null, 2))}
            className="group flex items-center gap-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2.5 text-left transition-all duration-200 hover:border-[var(--border-accent)] hover:shadow-[0_0_16px_var(--accent-glow)] shrink-0 min-w-[180px]"
          >
            <span className="text-lg shrink-0">{cfg.icon}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-[var(--text-primary)] group-hover:text-primary transition-colors truncate">
                  {cfg.name}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded border px-1.5 py-px text-[9px] font-mono font-semibold uppercase tracking-wider",
                    riskColors[cfg.riskPreview]
                  )}
                >
                  {cfg.riskPreview}
                </span>
              </div>
              <span className="text-[10px] text-[var(--text-tertiary)]">{cfg.industry}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
