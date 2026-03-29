import Link from "next/link";
import { Shield } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <Shield className="h-10 w-10 text-primary/30 mb-6" />
      <h1 className="font-mono text-6xl font-bold text-[var(--text-bright)] glow-text mb-2">
        404
      </h1>
      <p className="text-lg text-[var(--text-secondary)] mb-8">
        Page not found
      </p>
      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="font-mono text-xs uppercase tracking-wider text-primary hover:underline underline-offset-4"
        >
          Dashboard
        </Link>
        <span className="text-[var(--text-tertiary)]">·</span>
        <Link
          href="/feed"
          className="font-mono text-xs uppercase tracking-wider text-primary hover:underline underline-offset-4"
        >
          Feed
        </Link>
        <span className="text-[var(--text-tertiary)]">·</span>
        <Link
          href="/audit"
          className="font-mono text-xs uppercase tracking-wider text-primary hover:underline underline-offset-4"
        >
          Audit
        </Link>
      </div>
    </div>
  );
}
