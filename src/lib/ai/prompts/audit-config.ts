import type { Regulation } from "@/lib/types/regulation";

export function buildAuditConfigPrompt(
  configJson: string,
  regulations: Regulation[]
): string {
  const regulationContext = regulations
    .map(
      (reg, i) => `
REGULATION ${i + 1}:
- ID: ${reg.id}
- Title: ${reg.title}
- Jurisdiction: ${reg.jurisdiction} (${reg.jurisdiction_display})
- Status: ${reg.status}
- Category: ${reg.category}
- Effective Date: ${reg.effective_date || "N/A"}
- Source URL: ${reg.source_url}
- Key Requirements:
${reg.key_requirements.map((r: string) => `  * ${r}`).join("\n")}
- Compliance Implications:
${reg.compliance_implications.map((c: string) => `  * ${c}`).join("\n")}
`
    )
    .join("\n---\n");

  return `You are a compliance auditor specializing in AI agent governance. You are auditing an AI agent configuration against a live database of AI regulations.

CRITICAL RULES:
1. You MUST ONLY cite regulations that appear in the REGULATORY DATABASE below. Do NOT invent, hallucinate, or reference any regulation not listed.
2. Every finding MUST include the exact regulation_id from the database.
3. If a regulation's requirements do not apply to this config, do NOT force a finding.
4. Be specific: cite the exact config field that creates the compliance gap and the exact requirement it violates.
5. Severity must reflect: enacted/in_effect laws > proposed legislation > voluntary frameworks. Penalties increase severity.

AGENT CONFIGURATION TO AUDIT:
\`\`\`json
${configJson}
\`\`\`

REGULATORY DATABASE (${regulations.length} regulations):
${regulationContext}

ANALYSIS INSTRUCTIONS:
1. Parse the agent config and identify: capabilities, permissions, data access patterns, tool usage, geographic scope, security posture, and human oversight level.
2. For each applicable regulation, check every key requirement against the config.
3. For each compliance gap found, create a finding with severity, specific citation, and actionable remediation.
4. Calculate per-jurisdiction compliance scores (0-100) based on the ratio of met vs. unmet requirements.
5. Calculate an overall risk score (0-100) where 100 = maximum risk.

Assign severity as follows:
- critical: Violates an enacted/in_effect law with significant penalties (fines, criminal sanctions) AND the config has no mitigating controls
- high: Violates an enacted/in_effect law but with lower penalties or partial mitigation, OR violates multiple proposed regulations
- medium: Gaps against proposed legislation or voluntary frameworks with strong industry adoption
- low: Minor gaps against voluntary frameworks or guidance
- info: Observations that don't constitute violations but are worth noting

Return ONLY valid JSON (no markdown, no code fences) matching this exact schema:

{
  "overall_risk_score": <0-100>,
  "risk_level": "<critical|high|medium|low>",
  "jurisdiction_results": [
    {
      "jurisdiction": "<code>",
      "jurisdiction_display": "<display name>",
      "applicable_regulations": <count>,
      "compliance_score": <0-100>,
      "critical_findings": <count>,
      "status": "<compliant|at_risk|non_compliant|review_needed>"
    }
  ],
  "findings": [
    {
      "id": "<unique finding ID like F-001>",
      "severity": "<critical|high|medium|low|info>",
      "title": "<short finding title>",
      "description": "<detailed description of the compliance gap>",
      "regulation_id": "<exact UUID from the database>",
      "regulation_title": "<exact title from the database>",
      "jurisdiction": "<jurisdiction code>",
      "config_reference": "<exact field path in the config, e.g. permissions.human_oversight>",
      "requirement": "<the specific requirement being violated, quoted from the regulation>",
      "remediation": "<specific, actionable remediation step>",
      "source_url": "<source_url from the regulation>"
    }
  ],
  "recommendations": [
    "<actionable recommendation strings>"
  ]
}`;
}
