import { getProvider }  from "@/lib/ai/providers/ProviderFactory";
import { ChatMessage }   from "@/lib/ai/types/ChatMessage";

// ─── rewriteQuery ─────────────────────────────────────────────────────────────
//
// Rewrites a follow-up question into a self-contained retrieval query so that
// vector search operates on a meaningful standalone sentence rather than a
// pronoun-heavy fragment like "What comes next?" or "And the other one?".
//
// First-turn questions are returned unchanged — no LLM call is made.
// Any LLM failure falls back to the original question, so retrieval always runs.

export async function rewriteQuery(
  messages: ChatMessage[]
): Promise<string> {

  const userMessages = messages.filter(
    m => m.role === "user"
  );

  const lastUser = userMessages[userMessages.length - 1];
  const query    = lastUser?.content ?? "";

  // First question — no context to expand, skip the rewrite call
  if (userMessages.length <= 1) {
    return query;
  }

  // Build a short excerpt of recent turns for the rewriter (last 3 turns = 6 msgs)
  const recentContext = messages
    .slice(-6)
    .map(m =>
      `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
    )
    .join("\n");

  const prompt =
    `You are a search-query optimizer for a technical support knowledge base.

Given the conversation below and the user's latest question, rewrite that question
into a single, self-contained search query that can be understood without any
prior context.

Rules:
- Return ONLY the rewritten query — no explanation, no quotes, no punctuation changes
- Preserve every technical term exactly as written
- If the latest question is already fully self-contained, return it unchanged
- Keep the result under 30 words

Conversation:
${recentContext}

Return only the rewritten search query:`;

  try {

    const provider  = getProvider();
    const rewritten = await provider.chat([
      { role: "user", content: prompt }
    ]);

    const cleaned = rewritten.trim();
    return cleaned.length > 0 ? cleaned : query;

  } catch (err) {

    // Never let a rewrite failure block retrieval
    console.warn("[QueryRewriter] Rewrite failed, using original query:", err);
    return query;
  }
}
