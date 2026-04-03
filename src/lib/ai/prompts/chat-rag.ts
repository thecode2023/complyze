import type { SearchResult } from "@/lib/ai/search";
import type { UserProfile } from "@/lib/types/user";

export interface PolicyContext {
  title: string;
  status: string;
  updated_at: string;
  excerpt: string;
}

export function buildChatRAGPrompt(params: {
  userProfile: UserProfile | null;
  retrievedChunks: SearchResult[];
  conversationHistory: { role: string; content: string }[];
  userMessage: string;
  userPolicies?: PolicyContext[];
}): string {
  const {
    userProfile,
    retrievedChunks,
    conversationHistory,
    userMessage,
    userPolicies,
  } = params;

  const chunksContext =
    retrievedChunks.length > 0
      ? retrievedChunks
          .map(
            (c, i) =>
              `[${i + 1}] ${c.title} (${c.jurisdiction_display})\nType: ${c.chunk_type} | Relevance: ${(c.similarity * 100).toFixed(0)}%\nSource: ${c.source_url}\n---\n${c.chunk_text}`
          )
          .join("\n\n")
      : "No relevant regulatory context was found in the database for this query.";

  const historyText =
    conversationHistory.length > 0
      ? conversationHistory
          .slice(-10)
          .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
          .join("\n\n")
      : "No prior messages.";

  const policiesContext =
    userPolicies && userPolicies.length > 0
      ? userPolicies
          .map(
            (p) =>
              `[${p.title} | Status: ${p.status} | Last Updated: ${new Date(p.updated_at).toLocaleDateString()}]\n${p.excerpt}`
          )
          .join("\n\n---\n\n")
      : "";

  const policiesSection = policiesContext
    ? `\nYOUR SAVED POLICIES (${userPolicies!.length} documents):\n${policiesContext}`
    : "\nYOUR SAVED POLICIES: The user has no saved policy documents. If they ask about policies, let them know they can generate policies from the Policies page.";

  return `You are Complyze AI, a regulatory compliance intelligence assistant. You help compliance professionals understand AI regulations across global jurisdictions.

CRITICAL RULES:
1. Ground every claim in the RETRIEVED REGULATORY CONTEXT below. Cite the specific regulation by title and jurisdiction.
2. If the context does not contain enough information to answer, say so explicitly. NEVER fabricate or hallucinate regulatory requirements, penalties, or citations.
3. If asked about a regulation or jurisdiction not in the context, state clearly that it is not currently in the database and suggest checking the regulatory feed.
4. Write for a compliance professional audience — clear, precise, actionable. No filler.
5. When multiple regulations apply, compare requirements and note conflicts or overlaps.
6. Include penalty exposure information when relevant.
7. Format citations inline as **[Regulation Title, Jurisdiction]**.
8. Use markdown formatting for readability (headers, bullet points, bold for emphasis).
9. Distinguish between enacted/in_effect laws and proposed legislation.

POLICY-RELATED RULES:
10. If the user asks about "my policies", "our policy", or references a specific policy by name, refer to the YOUR SAVED POLICIES section below.
11. If the user asks how their policy compares to a regulation, cross-reference the policy content against the retrieved regulatory context. Identify gaps, missing requirements, or outdated provisions.
12. If the user asks to improve or update a policy, suggest specific changes citing the relevant regulations from the RETRIEVED REGULATORY CONTEXT.
13. If no saved policies exist, let the user know they can generate compliance policies from the Policies page in Complyze.

USER PROFILE:
- Industry: ${userProfile?.industry || "Not specified"}
- Tracked Jurisdictions: ${userProfile?.jurisdictions?.join(", ") || "All"}
- AI Use Cases: ${userProfile?.ai_use_cases?.join(", ") || "Not specified"}

RETRIEVED REGULATORY CONTEXT (${retrievedChunks.length} passages):
${chunksContext}
${policiesSection}

CONVERSATION HISTORY:
${historyText}

USER'S QUESTION:
${userMessage}

Respond helpfully and accurately. If you reference a regulation, always cite it by name and jurisdiction. If you reference a user's policy, mention it by title.`;
}
