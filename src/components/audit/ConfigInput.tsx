"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfigSelector } from "./ConfigSelector";

const MAX_SIZE_BYTES = 50 * 1024; // 50KB

interface ConfigInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  cooldown?: boolean;
}

export function ConfigInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  cooldown = false,
}: ConfigInputProps) {
  const byteSize = useMemo(
    () => new TextEncoder().encode(value).length,
    [value]
  );
  const overLimit = byteSize > MAX_SIZE_BYTES;
  const sizeLabel = byteSize < 1024
    ? `${byteSize} B`
    : `${(byteSize / 1024).toFixed(1)} KB`;

  return (
    <div className="flex flex-col h-full gap-4">
      <div>
        <h2 className="text-xs font-mono font-semibold uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-3">
          Agent Configuration
        </h2>

        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder='Paste your AI agent config (JSON or YAML) here...'
            className="min-h-[300px] w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-[13px] font-mono leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_var(--accent-glow)] resize-none transition-[border-color,box-shadow] duration-200"
            spellCheck={false}
          />
          {/* Byte counter */}
          {value.length > 0 && (
            <div className="absolute bottom-2 right-2 pointer-events-none">
              <span
                className={cn(
                  "text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded",
                  overLimit
                    ? "text-red-400 bg-red-500/10"
                    : "text-[var(--text-tertiary)] bg-[var(--bg-primary)]/80"
                )}
              >
                {sizeLabel} / 50 KB
              </span>
            </div>
          )}
        </div>

        {overLimit && (
          <p className="text-xs text-red-400 mt-1 font-mono">
            Config exceeds 50 KB limit. Reduce the size before submitting.
          </p>
        )}

        <Button
          onClick={onSubmit}
          disabled={isLoading || !value.trim() || overLimit || cooldown}
          className="mt-3 w-full font-mono text-xs uppercase tracking-wider"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : cooldown ? (
            "Please wait..."
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Compliance Audit
            </>
          )}
        </Button>
      </div>

      <ConfigSelector onSelect={onChange} />
    </div>
  );
}
