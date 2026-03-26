export function buildExtractUpdatePrompt(
  sourceText: string,
  sourceUrl: string,
  existingRegulationTitles: string[]
): string {
  return `You are a regulatory intelligence analyst. Analyze the following text and determine if it represents a regulatory update related to AI governance.

SOURCE TEXT:
${sourceText}

SOURCE URL: ${sourceUrl}

EXISTING REGULATIONS IN OUR DATABASE:
${existingRegulationTitles.map((t) => `- ${t}`).join("\n")}

If this text describes an update to an existing regulation in our database, or a new AI-related regulation, extract the information. Return ONLY valid JSON (no markdown, no code fences):

{
  "is_relevant": true/false,
  "updates": [
    {
      "regulation_title": "Title of the regulation this update relates to (must match an existing title if it's an update to existing, or be the new regulation title)",
      "update_type": "One of: new_regulation, amendment, status_change, enforcement_action, guidance_update",
      "title": "Short title for this update",
      "summary": "2-3 sentence summary of what changed and why it matters for AI compliance",
      "source_url": "${sourceUrl}",
      "confidence": 0.0 to 1.0,
      "needs_human_review": true/false
    }
  ]
}

RULES:
- Only report updates that are clearly about AI regulation, governance, or compliance
- If the text is not relevant to AI regulation, return {"is_relevant": false, "updates": []}
- For updates to existing regulations, the regulation_title MUST match one from our database
- Set needs_human_review to true if confidence < 0.7 or classification is ambiguous
- Do NOT fabricate updates — only report what is explicitly stated in the source text
- Return ONLY the JSON object, no other text`;
}
