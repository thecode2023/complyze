import Link from "next/link";
import { Shield, ExternalLink } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
      {/* What is Complyze */}
      <section>
        <SectionHeader>What is Complyze?</SectionHeader>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          Complyze is an AI regulatory intelligence platform that tracks global AI legislation,
          audits agent configurations against live regulations, and delivers personalized
          compliance monitoring. Every finding is grounded in real, timestamped regulations
          — zero hallucinated citations.
        </p>
      </section>

      {/* How Data is Sourced */}
      <section>
        <SectionHeader>How Data is Sourced</SectionHeader>
        <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
          <Li>Regulatory data is collected daily from official government sources, regulatory body RSS feeds, and legislative databases</Li>
          <Li>Each regulation is classified by AI and verified through a human-in-the-loop review process before going live</Li>
          <Li>Source URLs link directly to official government publications</Li>
          <Li>Data freshness is tracked — every regulation shows when it was last verified</Li>
        </ul>
      </section>

      {/* Methodology */}
      <section>
        <SectionHeader>Methodology</SectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MethodCard
            title="Compliance Score"
            range="0 – 100"
            description="Posture rating based on regulation coverage across tracked jurisdictions, audit findings severity, and enacted vs proposed regulation ratio. Higher is better."
          />
          <MethodCard
            title="Velocity Score"
            range="0 – 100"
            description="Measures how fast a jurisdiction's AI regulation is evolving. Weighted: regulation count (20%), recent updates (30%), enacted ratio (25%), enforcement actions (25%). High = prepare now."
          />
          <MethodCard
            title="Risk Score"
            range="0 – 100"
            description="Audit output measuring compliance gaps across all applicable jurisdictions. 0 = fully compliant. 100 = critical non-compliance."
          />
          <MethodCard
            title="Cost Exposure"
            range="USD"
            description="Maximum theoretical penalty if found non-compliant with all applicable regulations. Based on published fine structures (fixed fines and revenue-based percentages)."
          />
        </div>
      </section>

      {/* Grounding Constraint */}
      <section>
        <SectionHeader>Grounding Constraint</SectionHeader>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          Every audit finding must reference a regulation that exists in the database. After
          AI generates findings, each citation is validated against the regulations table.
          Findings that cite non-existent regulations are automatically stripped. This
          ensures compliance officers can trust every citation.
        </p>
      </section>

      {/* Built By */}
      <section>
        <SectionHeader>Built By</SectionHeader>
        <p className="text-[var(--text-secondary)] mb-3">
          <span className="text-[var(--text-primary)] font-medium">Yusuf Masood</span>
          {" — Security & Compliance Analyst with a background in operational risk, IT change management, and AI governance."}
        </p>
        <div className="flex gap-4 text-xs">
          <a
            href="https://linkedin.com/in/yusufmasood"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:underline underline-offset-4 font-mono"
          >
            LinkedIn <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://github.com/thecode2023"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:underline underline-offset-4 font-mono"
          >
            GitHub <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </section>

      {/* Tech Stack */}
      <section>
        <SectionHeader>Tech Stack</SectionHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-[var(--border-dim)]">
              {[
                ["Next.js 15", "Full-stack framework with SSR and API routes"],
                ["Supabase", "PostgreSQL database with auth and row-level security"],
                ["Gemini AI", "Regulatory classification, audit analysis, digest synthesis"],
                ["Tailwind CSS + shadcn/ui", "Design system"],
                ["Recharts", "Compliance trend and cost analysis charts"],
                ["react-simple-maps", "Interactive world map with real geographic data"],
              ].map(([tech, desc]) => (
                <tr key={tech}>
                  <td className="py-2.5 pr-4 font-mono text-xs text-[var(--text-primary)] whitespace-nowrap">{tech}</td>
                  <td className="py-2.5 text-[var(--text-tertiary)]">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Open Source */}
      <section>
        <SectionHeader>Open Source</SectionHeader>
        <p className="text-[var(--text-secondary)]">
          Complyze is open source under the{" "}
          <span className="text-[var(--text-primary)]">MIT License</span>.
        </p>
        <a
          href="https://github.com/thecode2023/complyze"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-2 text-xs font-mono text-primary hover:underline underline-offset-4"
        >
          github.com/thecode2023/complyze <ExternalLink className="h-3 w-3" />
        </a>
      </section>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-4">
      {children}
    </h2>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="text-primary shrink-0 mt-1">•</span>
      <span>{children}</span>
    </li>
  );
}

function MethodCard({ title, range, description }: { title: string; range: string; description: string }) {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">{title}</h3>
        <span className="font-mono text-[10px] text-[var(--text-tertiary)]">{range}</span>
      </div>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{description}</p>
    </div>
  );
}
