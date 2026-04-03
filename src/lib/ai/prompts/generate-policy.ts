import type { Regulation } from "@/lib/types/regulation";

export interface PolicyGenerationContext {
  regulations: Regulation[];
  policyType: string;
  industry: string;
  companyName?: string;
  companySize?: string;
  aiUseCases?: string[];
  geographicOperations?: string[];
  stakeholders?: string;
  organizationDetails?: string;
}

export function buildGeneratePolicyPrompt(params: PolicyGenerationContext): string {
  const {
    regulations,
    policyType,
    industry,
    companyName,
    companySize,
    aiUseCases,
    geographicOperations,
    stakeholders,
    organizationDetails,
  } = params;

  const regulationContext = regulations
    .map(
      (reg, i) => `
REGULATION ${i + 1}:
- Title: ${reg.title}
- Jurisdiction: ${reg.jurisdiction} (${reg.jurisdiction_display})
- Status: ${reg.status}
- Category: ${reg.category}
- Effective Date: ${reg.effective_date || "N/A"}
- Source URL: ${reg.source_url}
- Key Requirements:
${reg.key_requirements.map((r: string) => `  * ${r}`).join("\n")}
- Compliance Implications (including penalties):
${reg.compliance_implications.map((c: string) => `  * ${c}`).join("\n")}
`
    )
    .join("\n---\n");

  const companyNameStr = companyName || "[COMPANY NAME]";

  const sizeGuidance = companySize
    ? {
        "startup": "This is a startup with <50 employees. Keep governance lightweight — combine roles, minimize bureaucracy, focus on essential controls only. A single compliance lead may cover multiple responsibilities.",
        "smb": "This is a small/medium business (50-500 employees). Moderate governance structure — dedicated compliance function but roles may overlap. Focus on pragmatic, cost-effective controls.",
        "enterprise": "This is an enterprise (500-5000 employees). Full governance structure with dedicated teams, formal review boards, and established change management processes.",
        "large_enterprise": "This is a large enterprise (5000+ employees). Comprehensive governance with multiple oversight layers, formal committees, cross-functional review boards, and enterprise-wide rollout plans.",
      }[companySize] || ""
    : "";

  const stakeholderGuidance = stakeholders
    ? `Use these specific stakeholder roles in the RACI table and throughout the document: ${stakeholders}. Assign appropriate responsibilities to each role based on their title.`
    : "Use generic role placeholders like [COMPLIANCE OFFICER], [CTO], [DPO], [DEPARTMENT HEAD] in the RACI table.";

  const aiUseCasesStr = aiUseCases && aiUseCases.length > 0
    ? `AI USE CASES IN SCOPE: ${aiUseCases.join(", ")}. Tailor policy statements to specifically address these use cases.`
    : "";

  const geoStr = geographicOperations && geographicOperations.length > 0
    ? `GEOGRAPHIC OPERATIONS: ${geographicOperations.join(", ")}. Consider cross-jurisdictional requirements where applicable.`
    : "";

  return `You are a compliance policy architect. Generate a professional internal compliance policy document based on the regulatory requirements provided.

POLICY TYPE: ${policyType}
INDUSTRY: ${industry}
COMPANY: ${companyNameStr}
${companySize ? `COMPANY SIZE: ${companySize}\n${sizeGuidance}` : ""}
${organizationDetails ? `ADDITIONAL CONTEXT: ${organizationDetails}` : ""}
${aiUseCasesStr}
${geoStr}

STAKEHOLDER GUIDANCE: ${stakeholderGuidance}

REGULATORY REQUIREMENTS:
${regulationContext}

DOCUMENT STRUCTURE (use Markdown formatting with headers, bullet points, and tables):

1. **Policy Title** — as a level-1 heading. Use "${companyNameStr}" in the title.

2. **Document Control** — table with Version, Effective Date placeholder, Owner placeholder, Review Cycle.

3. **Version History** — table tracking document changes:
   | Version | Date | Author | Changes |
   |---------|------|--------|---------|
   | 1.0 | [DATE] | [POLICY OWNER] | Initial draft |
   Leave space for future version rows.

4. **Executive Summary** — 3-4 sentences stating what this policy covers, why it exists, the key regulatory drivers, and the primary obligation it places on the organization. Write it for a senior executive who will not read the full document.

5. **Purpose & Scope**
   - Why this policy exists (tied directly to the regulatory requirements)
   - Who it applies to within ${companyNameStr}
   - What systems, processes, or AI applications it covers

6. **Definitions**
   - Key terms from the regulations, defined in plain language

7. **Policy Statements**
   - Numbered, specific, actionable requirements
   - Each statement MUST map to a specific regulatory requirement — include the citation as [Regulation Title, Jurisdiction] in plain text
   - Use "shall" for mandatory requirements, "should" for recommended practices

8. **Roles & Responsibilities**
   - RACI-style table: Responsible, Accountable, Consulted, Informed
   - ${stakeholders ? `Use these roles: ${stakeholders}` : "Include placeholders for specific role titles"}

9. **Implementation Requirements**
   - Technical controls needed
   - Process changes needed
   - Training requirements
   ${sizeGuidance ? `- Scale requirements appropriately: ${sizeGuidance}` : ""}

10. **Monitoring & Enforcement**
    - How compliance with this policy will be measured
    - Reporting requirements
    - Consequences of non-compliance

11. **Exceptions**
    - Exceptions to this policy must be formally requested, documented, and approved in writing by [POLICY OWNER] with review by [LEGAL DEPARTMENT]
    - All approved exceptions shall be time-limited, recorded in [EXCEPTION REGISTER], and reviewed at each policy review cycle
    - Include a brief exception request process (who, how, approval chain)

12. **Review & Update Schedule**
    - Linked to regulatory update cadence

13. **Appendices**
    - **Regulatory Reference Table** with these columns: Regulation Name, Jurisdiction, Relevant Articles/Sections, Effective Date, Penalty/Enforcement, Status. Pull the Effective Date, Penalty/Enforcement data, and Status from the regulation data provided above. This table must cover every regulation cited in the policy.
    - Related internal policies (placeholders)

RULES:
1. Every policy statement MUST cite the specific regulation and requirement it implements using [Regulation Title, Jurisdiction] format in plain text.
2. Use professional legal/compliance language appropriate for board-level review.
3. ${companyName ? `Use "${companyName}" throughout the document instead of [COMPANY NAME].` : 'Include placeholders in [BRACKETS] for organization-specific details (e.g., [COMPANY NAME], [DEPARTMENT]).'}
4. ${stakeholders ? `Use the provided stakeholder roles (${stakeholders}) in the RACI table and responsibility assignments instead of generic placeholders.` : 'Use [BRACKETS] for role placeholders like [COMPLIANCE OFFICER], [CTO].'}
5. The policy must be implementable — no aspirational platitudes, only concrete requirements.
6. Keep the document between 1500-3000 words.
7. Do NOT invent or cite any regulation not listed in REGULATORY REQUIREMENTS above.
8. Output ONLY the Markdown document. No preamble, no explanation, no code fences wrapping the output.
9. Do NOT use markdown bold syntax (**text**) or italic syntax (*text*) inside table cells. Use plain text in all tables. Reserve markdown formatting for headings and body text only.
10. In the Regulatory Reference Table appendix, populate Effective Date, Penalty/Enforcement, and Status columns using the data from the REGULATORY REQUIREMENTS section above. Do not leave these blank.`;
}
