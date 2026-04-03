import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { semanticSearch, type SearchResult } from "@/lib/ai/search";
import {
  buildChatRAGPrompt,
  type PolicyContext,
} from "@/lib/ai/prompts/chat-rag";
import { geminiModel } from "@/lib/ai/client";
import type { Citation } from "@/lib/types/chat";
import type { UserProfile } from "@/lib/types/user";

function extractCitations(
  responseText: string,
  chunks: SearchResult[]
): Citation[] {
  const seen = new Set<string>();
  const citations: Citation[] = [];

  for (const chunk of chunks) {
    if (seen.has(chunk.regulation_id)) continue;
    if (
      responseText.toLowerCase().includes(chunk.title.toLowerCase()) ||
      responseText.includes(chunk.source_url)
    ) {
      seen.add(chunk.regulation_id);
      citations.push({
        regulation_id: chunk.regulation_id,
        title: chunk.title,
        jurisdiction: chunk.jurisdiction_display,
        source_url: chunk.source_url,
        chunk_type: chunk.chunk_type,
      });
    }
  }

  return citations;
}

// Extract keywords from message for policy search
function extractSearchKeywords(message: string): string[] {
  const stopWords = new Set([
    "my", "our", "the", "a", "an", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "can", "shall", "to", "of", "in",
    "for", "on", "with", "at", "by", "from", "about", "how", "what", "which",
    "that", "this", "it", "and", "or", "but", "if", "not", "no", "all",
    "any", "does", "i", "me", "we", "they", "you", "your",
  ]);

  return message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
}

function mentionsPolicies(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("policy") ||
    lower.includes("policies") ||
    lower.includes("my polic") ||
    lower.includes("our polic") ||
    lower.includes("saved polic") ||
    lower.includes("draft") ||
    lower.includes("policy document")
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, session_id, jurisdictions } = body as {
      message: string;
      session_id?: string;
      jurisdictions?: string[];
    };

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();
    let activeSessionId = session_id;

    // Session management
    if (activeSessionId) {
      const { data: session, error: sessionError } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("id", activeSessionId)
        .eq("user_id", user.id)
        .single();

      if (sessionError || !session) {
        return NextResponse.json(
          { error: "Chat session not found" },
          { status: 404 }
        );
      }
    } else {
      const title = message.slice(0, 80).trim();
      const { data: newSession, error: createError } = await adminClient
        .from("chat_sessions")
        .insert({ user_id: user.id, title })
        .select("id")
        .single();

      if (createError || !newSession) {
        return NextResponse.json(
          { error: "Failed to create chat session" },
          { status: 500 }
        );
      }
      activeSessionId = newSession.id;
    }

    // Store user message
    await adminClient.from("chat_messages").insert({
      session_id: activeSessionId,
      role: "user",
      content: message.trim(),
      citations: [],
    });

    // Fetch conversation history
    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", activeSessionId)
      .order("created_at", { ascending: true })
      .limit(20);

    // Semantic search for relevant regulation context
    let searchResults: SearchResult[] = [];
    try {
      searchResults = await semanticSearch(message, {
        jurisdictions: jurisdictions || undefined,
        limit: 8,
        threshold: 0.5,
      });
    } catch (searchError) {
      console.error("[chat] Semantic search failed:", searchError);
    }

    // Search user's policy documents if the message mentions policies
    let userPolicies: PolicyContext[] = [];
    if (mentionsPolicies(message)) {
      try {
        const keywords = extractSearchKeywords(message);
        // Build ILIKE conditions for keyword matching
        let query = supabase
          .from("policy_documents")
          .select("title, status, updated_at, content_markdown")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(3);

        // If we have specific keywords beyond "policy", search for them
        const contentKeywords = keywords.filter(
          (k) => !["policy", "policies", "document", "documents", "saved", "draft"].includes(k)
        );
        if (contentKeywords.length > 0) {
          // Search title and content for the most specific keyword
          const searchTerm = `%${contentKeywords[0]}%`;
          query = query.or(
            `title.ilike.${searchTerm},content_markdown.ilike.${searchTerm}`
          );
        }

        const { data: policies } = await query;

        if (policies && policies.length > 0) {
          userPolicies = policies.map(
            (p: {
              title: string;
              status: string;
              updated_at: string;
              content_markdown: string;
            }) => ({
              title: p.title,
              status: p.status,
              updated_at: p.updated_at,
              excerpt: p.content_markdown.slice(0, 2000),
            })
          );
        } else {
          // No keyword match — fetch most recent policies as fallback
          const { data: recentPolicies } = await supabase
            .from("policy_documents")
            .select("title, status, updated_at, content_markdown")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(3);

          if (recentPolicies && recentPolicies.length > 0) {
            userPolicies = recentPolicies.map(
              (p: {
                title: string;
                status: string;
                updated_at: string;
                content_markdown: string;
              }) => ({
                title: p.title,
                status: p.status,
                updated_at: p.updated_at,
                excerpt: p.content_markdown.slice(0, 2000),
              })
            );
          }
        }
      } catch (policyError) {
        console.error("[chat] Policy search failed:", policyError);
      }
    }

    // Fetch user profile
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Build RAG prompt
    const prompt = buildChatRAGPrompt({
      userProfile: userProfile as UserProfile | null,
      retrievedChunks: searchResults,
      conversationHistory: (history || []) as {
        role: string;
        content: string;
      }[],
      userMessage: message,
      userPolicies: userPolicies.length > 0 ? userPolicies : undefined,
    });

    // Stream response from Gemini
    const genResult = await geminiModel.generateContentStream(prompt);
    const encoder = new TextEncoder();
    let fullResponse = "";
    const sessionIdForClient = activeSessionId;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of genResult.stream) {
            const text = chunk.text();
            if (text) {
              fullResponse += text;
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ text, done: false })}\n\n`
                )
              );
            }
          }

          const citations = extractCitations(fullResponse, searchResults);

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                text: "",
                done: true,
                citations,
                session_id: sessionIdForClient,
              })}\n\n`
            )
          );

          adminClient
            .from("chat_messages")
            .insert({
              session_id: sessionIdForClient,
              role: "assistant",
              content: fullResponse,
              citations,
            })
            .then(({ error }) => {
              if (error)
                console.error("[chat] Failed to store assistant message:", error);
            });

          adminClient
            .from("chat_sessions")
            .update({
              message_count: (history?.length || 0) + 2,
              updated_at: new Date().toISOString(),
            })
            .eq("id", sessionIdForClient)
            .then(({ error }) => {
              if (error)
                console.error("[chat] Failed to update session:", error);
            });

          controller.close();
        } catch (error) {
          console.error("[chat] Stream error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                text: "",
                done: true,
                error: "An error occurred while generating the response. Please try again.",
                session_id: sessionIdForClient,
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[chat] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
