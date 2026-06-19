import { getProvider }  from "@/lib/ai/providers/ProviderFactory";
import { ChatMessage }  from "@/lib/ai/types/ChatMessage";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConversationSummary {
  text:          string;   // condensed prose summary
  turnsCovered:  number;   // how many messages were summarised
}

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Number of user/assistant turns before we start summarising.
 * Below this threshold the full history fits in the prompt without compression.
 */
const SUMMARY_TRIGGER_MESSAGES = 14;

/**
 * How many of the most recent messages to keep verbatim (never summarised).
 * These give the model immediate conversational context.
 */
const RECENT_WINDOW = 6;

// ─── summarizeConversation ────────────────────────────────────────────────────
//
// Splits the conversation into two parts:
//   • "older" — everything except the last RECENT_WINDOW turns → summarised
//   • "recent" — the last RECENT_WINDOW turns → returned unchanged for the prompt
//
// Returns null when the conversation is short enough that no summary is needed.
// On LLM failure, also returns null so the caller can fall back to full history.

export async function summarizeConversation(
  messages:  ChatMessage[],
  sessionId?: string
): Promise<ConversationSummary | null> {

  const turns = messages.filter(
    m => m.role === "user" || m.role === "assistant"
  );

  if (turns.length < SUMMARY_TRIGGER_MESSAGES) {
    return null;
  }

  const toSummarise = turns.slice(0, turns.length - RECENT_WINDOW);
  if (toSummarise.length === 0) return null;

  const transcript = toSummarise
    .map(m =>
      `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
    )
    .join("\n");

  const prompt =
    `You are summarising a technical support conversation for a retail computer-vision platform.

Write a concise summary (3–5 sentences) covering:
1. The issue or question the user is trying to resolve
2. Products, modules, or features involved
3. Steps already completed or attempted
4. Any items still unresolved

Return ONLY the summary — no headings, no bullet points, no preamble.

Conversation to summarise:
${transcript}`;

  try {

    const provider = getProvider();
    const raw      = await provider.chat([
      { role: "user", content: prompt }
    ]);

    const text = raw.trim();
    if (!text) return null;

    return {
      text,
      turnsCovered: toSummarise.length,
    };

  } catch (err) {

    console.warn("[Summarizer] Summary generation failed:", err);
    return null;
  }
}

// ─── buildMemoryBlock ─────────────────────────────────────────────────────────
//
// Convenience helper: returns the text block to inject into the system prompt.
// Returns an empty string when no summary is needed.

export async function buildMemoryBlock(
  messages:  ChatMessage[],
  sessionId?: string
): Promise<string> {

  const summary = await summarizeConversation(messages, sessionId);
  if (!summary) return "";

  return [
    "CONVERSATION SUMMARY (earlier turns):",
    summary.text,
  ].join("\n");
}
