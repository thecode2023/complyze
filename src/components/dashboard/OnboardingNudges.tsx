"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileSearch, FileText, MessageCircle, X, ArrowRight } from "lucide-react";

interface NudgeConfig {
  id: string;
  storageKey: string;
  icon: typeof FileSearch;
  title: string;
  description: string;
  href: string;
  label: string;
  color: string;
  bgColor: string;
}

const NUDGES: NudgeConfig[] = [
  {
    id: "audit",
    storageKey: "complyze_nudge_audit",
    icon: FileSearch,
    title: "Run your first audit",
    description: "Paste an AI agent config to find compliance gaps across jurisdictions.",
    href: "/audit",
    label: "Run Audit",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
  },
  {
    id: "policy",
    storageKey: "complyze_nudge_policy",
    icon: FileText,
    title: "Generate your first policy",
    description: "Create a compliance policy tailored to your regulations and industry.",
    href: "/policies",
    label: "Generate Policy",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "chat",
    storageKey: "complyze_nudge_chat",
    icon: MessageCircle,
    title: "Ask the AI assistant",
    description: "Get instant answers about any AI regulation — grounded in real data.",
    href: "#",
    label: "Open Chat",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

interface OnboardingNudgesProps {
  hasAudit: boolean;
  hasPolicies: boolean;
  hasChats: boolean;
}

export function OnboardingNudges({ hasAudit, hasPolicies, hasChats }: OnboardingNudgesProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const d = new Set<string>();
    for (const nudge of NUDGES) {
      if (localStorage.getItem(nudge.storageKey) === "dismissed") {
        d.add(nudge.id);
      }
    }
    setDismissed(d);
  }, []);

  if (!mounted) return null;

  const completionMap: Record<string, boolean> = {
    audit: hasAudit,
    policy: hasPolicies,
    chat: hasChats,
  };

  const visibleNudges = NUDGES.filter(
    (n) => !completionMap[n.id] && !dismissed.has(n.id)
  );

  if (visibleNudges.length === 0) return null;

  const handleDismiss = (nudge: NudgeConfig) => {
    localStorage.setItem(nudge.storageKey, "dismissed");
    setDismissed((prev) => new Set([...prev, nudge.id]));
  };

  return (
    <div className="mb-6 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Getting Started
      </p>
      {visibleNudges.map((nudge) => {
        const Icon = nudge.icon;
        return (
          <div
            key={nudge.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
          >
            <div className={`w-8 h-8 rounded-lg ${nudge.bgColor} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${nudge.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{nudge.title}</p>
              <p className="text-xs text-muted-foreground">{nudge.description}</p>
            </div>
            <Link
              href={nudge.href}
              className="shrink-0 inline-flex items-center gap-1 text-xs text-primary hover:underline whitespace-nowrap"
            >
              {nudge.label} <ArrowRight className="w-3 h-3" />
            </Link>
            <button
              onClick={() => handleDismiss(nudge)}
              className="shrink-0 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
