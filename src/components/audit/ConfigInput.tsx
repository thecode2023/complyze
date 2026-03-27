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
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Agent Configuration
        </h2>

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='Paste your OpenClaw agent config (JSON) here...\n\n{\n  "name": "my-agent",\n  "capabilities": { ... }\n}'
          className="min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          spellCheck={false}
        />

        <Button
          onClick={onSubmit}
          disabled={isLoading || !value.trim()}
          className="mt-3 w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Auditing against regulations...
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
