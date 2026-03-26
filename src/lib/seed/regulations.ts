export interface SeedRegulation {
  title: string;
  jurisdiction: string;
  jurisdiction_display: string;
  status: "enacted" | "proposed" | "in_effect" | "under_review" | "repealed";
  category: "legislation" | "executive_order" | "framework" | "guidance" | "standard";
  summary: string;
  key_requirements: string[];
  compliance_implications: string[];
  effective_date: string | null;
  source_url: string;
  source_name: string;
  ai_classified: boolean;
  ai_confidence: number | null;
}

export const seedRegulations: SeedRegulation[] = [
  {
    title: "EU Artificial Intelligence Act (Regulation 2024/1689)",
    jurisdiction: "EU",
    jurisdiction_display: "European Union",
    status: "enacted",
    category: "legislation",
    summary:
      "The world's first comprehensive AI law establishing a risk-based regulatory framework. Classifies AI systems into unacceptable, high, limited, and minimal risk tiers with corresponding obligations. Prohibits social scoring, real-time biometric surveillance (with exceptions), and manipulative AI. High-risk AI systems face mandatory conformity assessments, transparency requirements, and human oversight obligations.",
    key_requirements: [
      "Risk classification of AI systems into four tiers (unacceptable, high, limited, minimal)",
      "Mandatory conformity assessments for high-risk AI systems before market placement",
      "Transparency obligations: users must be informed when interacting with AI",
      "Human oversight requirements for high-risk AI decision-making",
      "Technical documentation and record-keeping for high-risk AI systems",
      "Mandatory registration in the EU AI database for high-risk systems",
      "Post-market monitoring and incident reporting obligations",
      "General-purpose AI models must provide technical documentation and comply with EU copyright law",
      "Systemic risk GPAI models face additional obligations including adversarial testing and incident reporting"
    ],
    compliance_implications: [
      "Fines up to €35 million or 7% of global annual turnover for prohibited AI practices",
      "Fines up to €15 million or 3% of turnover for high-risk AI non-compliance",
      "AI agents operating autonomously in the EU must classify their risk tier and implement corresponding safeguards",
      "Agentic AI systems with autonomous decision-making likely classified as high-risk under Annex III",
      "AI systems interacting with natural persons must disclose their AI nature",
      "Extraterritorial scope: applies to any AI system whose output is used within the EU"
    ],
    effective_date: "2026-08-02",
    source_url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
    source_name: "Official Journal of the European Union",
    ai_classified: false,
    ai_confidence: null,
  },
  {
    title: "Texas Responsible AI Governance Act (TRAIGA, HB 149)",
    jurisdiction: "US-TX",
    jurisdiction_display: "United States — Texas",
    status: "enacted",
    category: "legislation",
    summary:
      "Texas's comprehensive AI governance law regulating deployers of high-risk AI systems. Requires impact assessments, transparency disclosures, and human oversight for AI systems making consequential decisions in employment, housing, healthcare, education, financial services, and government. Establishes a state AI advisory council and creates an AI incident reporting framework.",
    key_requirements: [
      "Impact assessments required before deploying high-risk AI systems",
      "Transparency disclosures to individuals subject to AI-driven consequential decisions",
      "Right to opt out of AI-driven consequential decisions and request human review",
      "Annual governance reporting for deployers of high-risk AI systems",
      "AI systems must provide explanations for adverse decisions",
      "Mandatory human oversight for high-risk AI decision-making processes",
      "Incident reporting for AI systems causing harm or discrimination"
    ],
    compliance_implications: [
      "Fines of $10,000 to $200,000 per violation enforced by the Texas Attorney General",
      "AI agents making autonomous decisions in covered sectors (financial services, employment) must implement human oversight",
      "Deployers must conduct and document impact assessments before launching AI agents in Texas",
      "Applies to entities doing business in Texas regardless of where the AI system is developed"
    ],
    effective_date: "2026-01-01",
    source_url: "https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=HB149",
    source_name: "Texas Legislature Online",
    ai_classified: false,
    ai_confidence: null,
  },
  {
    title: "Colorado AI Act (SB 24-205)",
    jurisdiction: "US-CO",
    jurisdiction_display: "United States — Colorado",
    status: "enacted",
    category: "legislation",
    summary:
      "Colorado's AI consumer protection law requiring developers and deployers of high-risk AI systems to use reasonable care to protect consumers from algorithmic discrimination. Mandates impact assessments, transparency notices, and an opt-out mechanism for consumers. Enforcement delayed to June 30, 2026 to allow businesses to prepare. Covers AI systems making consequential decisions about education, employment, financial services, healthcare, housing, insurance, and legal services.",
    key_requirements: [
      "Developers must provide deployers with documentation on intended uses, known limitations, and risk of algorithmic discrimination",
      "Deployers must conduct impact assessments for high-risk AI systems before deployment",
      "Consumers must receive notice when a high-risk AI system makes a consequential decision about them",
      "Consumers have the right to opt out and request human alternative for consequential decisions",
      "Deployers must implement a risk management policy and governance framework",
      "Annual review and update of impact assessments required",
      "Disclosure to the Colorado Attorney General if algorithmic discrimination is discovered"
    ],
    compliance_implications: [
      "Enforced by Colorado Attorney General under the Colorado Consumer Protection Act",
      "AI agents in financial services, healthcare, or employment operating in Colorado must implement consumer notification and opt-out mechanisms",
      "Impact assessments must be updated annually and after any significant modification to the AI system",
      "Affirmative defense available for deployers who comply with recognized AI risk frameworks (e.g., NIST AI RMF)"
    ],
    effective_date: "2026-06-30",
    source_url: "https://leg.colorado.gov/bills/sb24-205",
    source_name: "Colorado General Assembly",
    ai_classified: false,
    ai_confidence: null,
  },
  {
    title: "NIST AI Risk Management Framework (AI RMF 1.0)",
    jurisdiction: "US",
    jurisdiction_display: "United States (Federal)",
    status: "in_effect",
    category: "framework",
    summary:
      "Voluntary framework published by the National Institute of Standards and Technology providing organizations with a structured approach to managing AI risks. Organized around four core functions: Govern, Map, Measure, and Manage. Designed to be sector-agnostic and adaptable to any organization's risk tolerance. Widely referenced by US state AI laws as a safe harbor or recognized framework for compliance.",
    key_requirements: [
      "GOVERN: Establish AI risk management policies, roles, and organizational culture",
      "MAP: Contextualize AI system risks including intended and unintended uses, stakeholder impacts, and technical limitations",
      "MEASURE: Employ quantitative and qualitative methods to analyze, assess, and track AI risks",
      "MANAGE: Prioritize and act on AI risks with resource allocation, response plans, and continuous monitoring",
      "Cross-cutting: Integrate AI risk management into broader enterprise risk management",
      "Stakeholder engagement throughout the AI lifecycle",
      "Documentation of AI system characteristics, limitations, and risk assessments"
    ],
    compliance_implications: [
      "Referenced as a recognized framework in Colorado AI Act (affirmative defense) and other state laws",
      "Voluntary but increasingly expected by regulators and enterprise customers as a baseline",
      "AI agents should document their risk profile using the MAP function categories",
      "Organizations deploying AI agents can use AI RMF compliance to demonstrate due diligence"
    ],
    effective_date: "2023-01-26",
    source_url: "https://www.nist.gov/artificial-intelligence/executive-order-safe-secure-and-trustworthy-artificial-intelligence",
    source_name: "National Institute of Standards and Technology",
    ai_classified: false,
    ai_confidence: null,
  },
  {
    title: "Canada Artificial Intelligence and Data Act (AIDA, Bill C-27)",
    jurisdiction: "CA",
    jurisdiction_display: "Canada",
    status: "repealed",
    category: "legislation",
    summary:
      "Canada's proposed federal AI legislation that was part of the Digital Charter Implementation Act (Bill C-27). Would have regulated high-impact AI systems with requirements for risk assessments, transparency, and accountability. The bill died on January 6, 2025, when Prime Minister Trudeau prorogued Parliament. Canada currently has no dedicated federal AI legislation, though existing privacy laws (PIPEDA) and sector-specific regulations still apply to AI systems.",
    key_requirements: [
      "Would have required risk assessments for high-impact AI systems",
      "Would have mandated transparency measures including plain-language descriptions of AI systems",
      "Would have established accountability frameworks for AI developers and operators",
      "Would have created a new AI and Data Commissioner role",
      "Would have prohibited certain AI practices causing serious harm",
      "Note: These requirements never came into force — the bill died upon Parliament prorogation"
    ],
    compliance_implications: [
      "No current dedicated AI legislation in Canada — bill died Jan 6, 2025",
      "PIPEDA and provincial privacy laws still govern AI data processing in Canada",
      "Future AI legislation expected but timeline uncertain following 2025 federal election",
      "Organizations operating in Canada should monitor for new AI legislative proposals"
    ],
    effective_date: null,
    source_url: "https://www.parl.ca/legisinfo/en/bill/44-1/c-27",
    source_name: "Parliament of Canada",
    ai_classified: false,
    ai_confidence: null,
  },
  {
    title:
      "Singapore Model AI Governance Framework for Generative AI and Agentic AI Systems",
    jurisdiction: "SG",
    jurisdiction_display: "Singapore",
    status: "in_effect",
    category: "framework",
    summary:
      "The world's first governance framework specifically addressing agentic AI systems, published by Singapore's Infocomm Media Development Authority (IMDA) on January 22, 2026. Builds on the earlier Model AI Governance Framework (2nd edition) with new guidance for autonomous AI agents. Addresses unique risks of agentic AI including multi-step autonomous actions, tool use, and delegated authority. Voluntary but influential across ASEAN markets.",
    key_requirements: [
      "Agentic AI systems must implement guardrails proportional to their level of autonomy",
      "Human oversight mechanisms required for high-stakes autonomous decisions",
      "Transparency requirements: users must understand when they interact with an AI agent and what actions it can take",
      "Accountability frameworks must trace decisions back through agent chains to responsible parties",
      "AI agents with tool-use capabilities must implement access controls and approval workflows",
      "Incident response plans specific to autonomous agent failures",
      "Regular testing and evaluation of agent behavior boundaries",
      "Data governance requirements for agent memory and context retention"
    ],
    compliance_implications: [
      "Voluntary framework but increasingly referenced in Singapore government procurement and licensing",
      "AI agents operating in Singapore should implement proportional guardrails based on autonomy level",
      "Multi-agent systems face additional accountability requirements for inter-agent actions",
      "Framework provides a compliance baseline that may inform future mandatory regulation in ASEAN"
    ],
    effective_date: "2026-01-22",
    source_url: "https://www.imda.gov.sg/resources/press-releases-factsheets-and-speeches/press-releases/2020/singapore-releases-model-ai-governance-framework-second-edition",
    source_name: "Infocomm Media Development Authority (IMDA)",
    ai_classified: false,
    ai_confidence: null,
  },
  {
    title:
      "UK Pro-Innovation AI Regulation — Sectoral Approach and Forthcoming AI Bill",
    jurisdiction: "GB",
    jurisdiction_display: "United Kingdom",
    status: "under_review",
    category: "guidance",
    summary:
      "The UK's principles-based approach to AI regulation, delegating oversight to existing sector regulators (FCA, Ofcom, CMA, ICO, etc.) rather than creating a single AI law. Five cross-cutting principles: safety, transparency, fairness, accountability, and contestability. The Digital Regulation Cooperation Forum (DRCF) issued a call for views on agentic AI in October 2025. A formal AI Bill is anticipated in the May 2026 King's Speech, which would put these principles on a statutory footing.",
    key_requirements: [
      "Safety: AI systems must function securely, robustly, and as intended",
      "Transparency: AI systems must be appropriately transparent and explainable",
      "Fairness: AI systems must not undermine legal rights or discriminate unlawfully",
      "Accountability: Clear governance and oversight mechanisms must exist for AI systems",
      "Contestability: Individuals must be able to challenge AI-driven decisions",
      "Sector regulators issuing domain-specific AI guidance (FCA for financial services, ICO for data protection, etc.)",
      "DRCF actively investigating agentic AI governance implications"
    ],
    compliance_implications: [
      "Currently principles-based and voluntary — mandatory AI Bill expected May 2026",
      "AI agents in UK financial services must comply with FCA guidance on AI/ML in financial markets",
      "ICO enforcement of UK GDPR applies to AI systems processing personal data",
      "Agentic AI deployers should monitor DRCF outputs for emerging governance expectations",
      "UK approach diverges from EU AI Act — no risk classification system yet"
    ],
    effective_date: null,
    source_url: "https://www.gov.uk/government/publications/ai-regulation-a-pro-innovation-approach",
    source_name: "UK Department for Science, Innovation and Technology",
    ai_classified: false,
    ai_confidence: null,
  },
  {
    title: "Brazil AI Bill (PL 2338/2023)",
    jurisdiction: "BR",
    jurisdiction_display: "Brazil",
    status: "proposed",
    category: "legislation",
    summary:
      "Brazil's comprehensive AI regulation bill modeled partly on the EU AI Act. Passed the Brazilian Senate in December 2024 and is pending review in the Chamber of Deputies. Establishes a risk-based classification system, creates rights for individuals affected by AI decisions, and designates the National Data Protection Authority (ANPD) as the primary AI regulatory body. Would apply to any AI system that produces effects in Brazil, regardless of where the developer is located.",
    key_requirements: [
      "Risk-based classification system for AI systems (excessive, high, and general risk)",
      "Prohibition of social scoring and subliminal manipulation AI systems",
      "Impact assessments mandatory for high-risk AI systems",
      "Right to human review of automated decisions",
      "Transparency requirements including disclosure of AI system use",
      "AI system developers must implement governance programs",
      "Incident notification requirements for AI systems causing harm",
      "Sandbox provisions for AI innovation testing"
    ],
    compliance_implications: [
      "If enacted, fines up to R$50 million or 2% of company revenue per violation",
      "Extraterritorial scope: applies to AI systems producing effects in Brazil",
      "ANPD (National Data Protection Authority) designated as primary enforcement body",
      "AI agents operating in Brazil would need risk classification and impact assessments",
      "Currently pending in Chamber of Deputies — not yet law"
    ],
    effective_date: null,
    source_url: "https://www25.senado.leg.br/web/atividade/materias/-/materia/163592",
    source_name: "Brazilian Federal Senate",
    ai_classified: false,
    ai_confidence: null,
  },
  {
    title:
      "Illinois AI Video Interview Act (AIVI) and Biometric Information Privacy Act (BIPA)",
    jurisdiction: "US-IL",
    jurisdiction_display: "United States — Illinois",
    status: "in_effect",
    category: "legislation",
    summary:
      "Two Illinois laws with significant implications for AI systems. The AI Video Interview Act (820 ILCS 42, effective 2020) regulates AI-driven analysis of video interviews, requiring employer disclosure, consent, and data destruction. BIPA (740 ILCS 14) is the strictest biometric privacy law in the US, requiring informed consent before collecting biometric identifiers. Combined, these laws create substantial compliance requirements for AI systems processing biometric or video data in Illinois.",
    key_requirements: [
      "AIVI: Employers must notify applicants that AI will analyze their video interview",
      "AIVI: Written consent required before AI analysis of video interviews",
      "AIVI: Applicants can request video destruction within 30 days",
      "AIVI: Employers must not share applicant videos except with those necessary for evaluation",
      "BIPA: Written informed consent required before collecting biometric identifiers",
      "BIPA: Organizations must publish a biometric data retention and destruction policy",
      "BIPA: Biometric data cannot be sold, leased, traded, or otherwise profited from",
      "BIPA: Private right of action — individuals can sue directly for violations"
    ],
    compliance_implications: [
      "BIPA allows per-violation damages: $1,000 (negligent) to $5,000 (intentional/reckless) per violation",
      "Class action settlements under BIPA have reached hundreds of millions of dollars (e.g., Facebook $650M, Google $100M)",
      "AI agents processing facial recognition, voiceprints, or other biometric data in Illinois must obtain prior written consent",
      "AI systems conducting video analysis in hiring must comply with AIVI disclosure and consent requirements",
      "Private right of action under BIPA makes Illinois the highest-risk US jurisdiction for biometric AI"
    ],
    effective_date: "2020-01-01",
    source_url: "https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=3989",
    source_name: "Illinois General Assembly",
    ai_classified: false,
    ai_confidence: null,
  },
  {
    title:
      "Indonesia Personal Data Protection Law (UU PDP, Law No. 27 of 2022)",
    jurisdiction: "ID",
    jurisdiction_display: "Indonesia",
    status: "in_effect",
    category: "legislation",
    summary:
      "Indonesia's comprehensive data protection law that took full effect on October 17, 2024, after a 2-year transition period. Modeled on the EU GDPR with some unique provisions including criminal penalties. Governs the processing of personal data by AI systems operating in or targeting Indonesian residents. Establishes data subject rights, lawful processing bases, cross-border transfer requirements, and breach notification obligations. Extraterritorial scope applies to any data controller/processor handling Indonesian residents' data.",
    key_requirements: [
      "Lawful basis required for all personal data processing (consent, legitimate interest, contract, etc.)",
      "Data subjects have rights to access, correct, delete, restrict processing, and data portability",
      "Cross-border data transfers require adequate protection in the receiving country",
      "Data breach notification to authorities within 72 hours and affected individuals without undue delay",
      "Data Protection Impact Assessments required for high-risk processing activities",
      "Appointment of a Data Protection Officer for large-scale or sensitive data processing",
      "Specific consent required for processing sensitive personal data (health, biometric, financial, etc.)",
      "Data retention limitations — personal data must be deleted when no longer necessary"
    ],
    compliance_implications: [
      "Administrative fines up to 2% of annual revenue for corporate violations",
      "Criminal sanctions including imprisonment of 4–6 years and fines up to IDR 6 billion for intentional violations",
      "Extraterritorial scope: applies to any entity processing data of Indonesian residents",
      "AI agents accessing personal data of Indonesian users must establish lawful processing basis",
      "AI systems making automated decisions about Indonesian residents may trigger DPIA requirements",
      "One of the few data protection laws globally with criminal penalties — increases compliance urgency"
    ],
    effective_date: "2024-10-17",
    source_url: "https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022",
    source_name: "Indonesian Law Repository (JDIH BPK)",
    ai_classified: false,
    ai_confidence: null,
  },
  {
    title:
      "California AI Transparency Act (SB 942) and AI Watermarking Requirements (AB 853)",
    jurisdiction: "US-CA",
    jurisdiction_display: "United States — California",
    status: "enacted",
    category: "legislation",
    summary:
      "California's AI transparency legislation combining SB 942 (AI Transparency Act) and AB 853 (AI watermarking). SB 942 requires developers of generative AI systems to provide AI content detection tools and make provenance data available. AB 853 delayed the original effective date from January 1, 2026 to August 2, 2026. Together, these laws require AI-generated content to be detectable and labeled, establishing California as a leader in AI content transparency regulation.",
    key_requirements: [
      "Developers of generative AI must provide free AI content detection tools",
      "AI-generated content must include provenance data (metadata or watermarks)",
      "Covered platforms must provide users with tools to disclose AI-generated content",
      "Detection tools must be publicly accessible and free of charge",
      "Latent provenance disclosures must be embedded in AI-generated content where technically feasible",
      "Manifest provenance disclosures (visible labels) required on covered platforms",
      "Annual reporting on AI detection tool performance and accessibility"
    ],
    compliance_implications: [
      "Effective August 2, 2026 (delayed from January 1, 2026 by AB 853)",
      "Applies to generative AI systems with over 1 million monthly users/interactions",
      "AI agents generating content (text, images, audio, video) in California must implement watermarking",
      "Enforced by the California Attorney General — civil penalties per violation",
      "Sets a precedent likely to influence other state-level AI transparency laws"
    ],
    effective_date: "2026-08-02",
    source_url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202320240SB942",
    source_name: "California Legislative Information",
    ai_classified: false,
    ai_confidence: null,
  },
  {
    title: "OECD Principles on Artificial Intelligence",
    jurisdiction: "INTL",
    jurisdiction_display: "International (OECD — 46 countries)",
    status: "in_effect",
    category: "standard",
    summary:
      "The first intergovernmental standard on AI adopted in May 2019, updated in May 2024. Endorsed by 46 OECD member and partner countries. Establishes five value-based principles and five recommendations for governments. While non-binding, these principles form the foundation referenced by most national AI regulations globally, including the EU AI Act, Brazil's AI Bill, and numerous others. The 2024 update explicitly addresses generative and foundation model risks.",
    key_requirements: [
      "Inclusive growth, sustainable development, and well-being: AI should benefit people and the planet",
      "Human-centred values and fairness: AI must respect human rights, democratic values, and enable human oversight",
      "Transparency and explainability: AI stakeholders should understand AI system outputs and processes",
      "Robustness, security, and safety: AI systems must function appropriately and not pose unreasonable safety risks",
      "Accountability: Organizations developing or deploying AI are accountable for proper functioning",
      "2024 update: Additional guidance on generative AI, foundation models, and AI system lifecycle management",
      "Governments should facilitate public and private investment in AI R&D",
      "Governments should foster an inclusive and interoperable AI ecosystem"
    ],
    compliance_implications: [
      "Non-binding international standard but widely referenced in national legislation",
      "Compliance with OECD principles demonstrates alignment with the global AI governance baseline",
      "Referenced in regulatory preambles of the EU AI Act, Brazil AI Bill, and NIST AI RMF",
      "AI agents operating across jurisdictions can use OECD principles as a minimum governance baseline",
      "Provides a framework for explaining AI governance decisions in cross-border contexts"
    ],
    effective_date: "2019-05-22",
    source_url: "https://oecd.ai/en/ai-principles",
    source_name: "OECD AI Policy Observatory",
    ai_classified: false,
    ai_confidence: null,
  },
];

export const seedUpdates = [
  {
    regulation_index: 0, // EU AI Act
    update_type: "status_change" as const,
    title: "EU AI Act Enters Full Application Phase",
    summary:
      "Core provisions of the EU AI Act (Regulation 2024/1689) become fully applicable on August 2, 2026. High-risk AI systems must now comply with conformity assessment requirements, and general-purpose AI models must meet transparency obligations. The prohibition on unacceptable-risk AI practices has been in force since February 2, 2025.",
    source_url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
    verified: true,
    verified_by: "Yusuf (manual verification)",
  },
  {
    regulation_index: 1, // Texas TRAIGA
    update_type: "new_regulation" as const,
    title: "Texas TRAIGA Takes Effect January 1, 2026",
    summary:
      "The Texas Responsible AI Governance Act (HB 149) took effect on January 1, 2026, making Texas one of the first US states with comprehensive AI governance legislation. Deployers of high-risk AI systems must now conduct impact assessments and provide transparency disclosures.",
    source_url: "https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=HB149",
    verified: true,
    verified_by: "Yusuf (manual verification)",
  },
  {
    regulation_index: 5, // Singapore Agentic AI
    update_type: "new_regulation" as const,
    title:
      "Singapore Publishes World's First Agentic AI Governance Framework",
    summary:
      "IMDA published the Model AI Governance Framework for Agentic AI Systems on January 22, 2026, making it the world's first governance framework specifically addressing autonomous AI agents. The framework covers guardrails, accountability, tool-use controls, and human oversight for agentic systems.",
    source_url: "https://www.imda.gov.sg/resources/press-releases-factsheets-and-speeches/press-releases/2020/singapore-releases-model-ai-governance-framework-second-edition",
    verified: true,
    verified_by: "Yusuf (manual verification)",
  },
  {
    regulation_index: 4, // Canada AIDA
    update_type: "status_change" as const,
    title: "Canada's AIDA Dies as Parliament Prorogued",
    summary:
      "Bill C-27, which included the Artificial Intelligence and Data Act (AIDA), died on January 6, 2025, when Prime Minister Trudeau prorogued Parliament. Canada currently has no dedicated federal AI legislation. A new AI bill may be introduced in the next Parliamentary session.",
    source_url: "https://www.parl.ca/legisinfo/en/bill/44-1/c-27",
    verified: true,
    verified_by: "Yusuf (manual verification)",
  },
  {
    regulation_index: 10, // California AI Transparency
    update_type: "amendment" as const,
    title: "California AI Transparency Act Effective Date Delayed to August 2026",
    summary:
      "AB 853 delayed the effective date of California's AI Transparency Act (SB 942) from January 1, 2026, to August 2, 2026. This gives generative AI developers additional time to implement content detection tools and watermarking requirements.",
    source_url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202320240AB853",
    verified: true,
    verified_by: "Yusuf (manual verification)",
  },
];
