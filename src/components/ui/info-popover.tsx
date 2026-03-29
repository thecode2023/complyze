"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoPopoverProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function InfoPopover({ title, children, className }: InfoPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className={cn("relative inline-flex", className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-4 w-4 items-center justify-center rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
        aria-label={title}
      >
        <Info className="h-3 w-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-1/2 -translate-x-1/2 top-6 z-50 w-64 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3 shadow-lg text-xs">
            <p className="font-mono font-semibold text-[var(--text-primary)] mb-1.5 uppercase tracking-wider text-[10px]">{title}</p>
            <div className="text-[var(--text-secondary)] leading-relaxed">{children}</div>
          </div>
        </>
      )}
    </span>
  );
}
