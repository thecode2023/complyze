export function buildClassifyRegulationPrompt(sourceText: string, sourceUrl: string, sourceName: string): string {
  return `You are a regulatory intelligence analyst specializing in AI governance and compliance. Analyze the following regulatory text and extract structured information.

SOURCE TEXT:
${sourceText}

SOURCE URL: ${sourceUrl}
SOURCE NAME: ${sourceName}

Extract the following fields and return ONLY valid JSON (no markdown, no code fences):

{
  "title": "Official title of the regulation or legislation",
  "jurisdiction": "ISO-style code: US, US-CA, US-TX, EU, GB, CA, SG, BR, ID, INTL, etc.",
  "jurisdiction_display": "Human-readable jurisdiction name",
  "status": "One of: enacted, proposed, in_effect, under_review, repealed",
  "category": "One of: legislation, executive_order, framework, guidance, standard",
  "summary": "2-3 sentence summary focusing on AI/agent compliance implications",
  "key_requirements": ["Array of specific requirements relevant to AI systems and agents"],
  "compliance_implications": ["Array of practical compliance implications including penalties"],
  "effective_date": "YYYY-MM-DD or null if not yet determined",
  "source_url": "${sourceUrl}",
  "source_name": "${sourceName}",
  "confidence": 0.0 to 1.0,
  "needs_human_review": true/false,
  "supporting_evidence": "Quote the specific text from the source that supports your classification"
}

RULES:
- Only extract information explicitly stated in or directly inferable from the source text
- If the source text is not about AI regulation, return {"confidence": 0, "needs_human_review": true, "title": "Not AI regulation", "summary": "Source does not appear to be about AI regulation"}
- Set needs_human_review to true if confidence < 0.7 or if the classification is ambiguous
- For key_requirements, only list requirements that are explicitly stated in the text
- For compliance_implications, include specific penalties, enforcement mechanisms, and scope details
- Do NOT invent requirements or penalties not mentioned in the source
- Return ONLY the JSON object, no other text`;
}
