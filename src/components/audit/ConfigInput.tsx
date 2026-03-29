"use client";

import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { ConfigSelector } from "./ConfigSelector";

interface ConfigInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function ConfigInput({
  value,
  onChange,
  onSubmit,
  isLoading,
}: ConfigInputProps) {
  return (
    <div className="flex flex-col h-full gap-4">
      <div>
        <h2 className="text-xs font-mono font-semibold uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-3">
          Agent Configuration
        </h2>

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='Paste your AI agent config (JSON) here...'
          className="min-h-[300px] w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-[13px] font-mono leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_var(--accent-glow)] resize-none transition-[border-color,box-shadow] duration-200"
          spellCheck={false}
        />

        <Button
          onClick={onSubmit}
          disabled={isLoading || !value.trim()}
          className="mt-3 w-full font-mono text-xs uppercase tracking-wider"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing against regulations...
            </>
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
