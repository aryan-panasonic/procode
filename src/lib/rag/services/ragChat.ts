import { PgVectorRetriever } from "../retrieval/PgVectorRetriever";
import { buildContext } from "../prompt/buildContext";
import { getProvider } from "@/lib/ai/providers/ProviderFactory";
import { ChatMessage } from "@/lib/ai/types/ChatMessage";

const retriever = new PgVectorRetriever();

// ─── Language detection ────────────────────────────────────────────────────
// Scan backwards through the conversation so a Japanese follow-up after an
// English opener is handled correctly, and vice-versa.
function detectLanguage(messages: ChatMessage[]): "ja" | "en" {
  const jpRegex = /[\u3040-\u30ff\u3400-\u9fbf]/;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user" && jpRegex.test(messages[i].content)) {
      return "ja";
    }
  }
  return "en";
}

// ─── System prompt ─────────────────────────────────────────────────────────
// A single, well-structured prompt replaces the hardcoded intent tree.
// The LLM handles greetings, follow-ups, and capability questions naturally;
// the prompt prevents hallucination and steers synthesis quality.
function buildSystemPrompt(context: string, language: "ja" | "en"): string {
  const langInstruction =
    language === "ja"
      ? "Respond entirely in Japanese (日本語で回答してください)."
      : "Respond in English.";

  const contextBlock =
    context.trim().length > 0
      ? `RETRIEVED DOCUMENTATION:\n${context}`
      : [
          "RETRIEVED DOCUMENTATION:",
          "No documentation chunks were retrieved for this query.",
          "Answer from general knowledge where appropriate.",
          "Clearly indicate when something cannot be confirmed from platform documentation.",
        ].join("\n");

  return `You are the official technical support assistant for the INTELLIGENT SHELF ANALYZER — a retail computer-vision platform for shelf analysis, planogram compliance, product recognition, OCR-based price extraction, and retail workflow automation.

${langInstruction}

${contextBlock}

RESPONSE RULES:

1. DOCUMENTATION FIRST — When retrieved documentation answers the question, synthesize a clear, accurate explanation. Do not copy documentation text verbatim; explain it.

2. PARTIAL COVERAGE — If documentation partially covers the question, answer what is documented and state clearly which aspects are not covered.

3. NO HALLUCINATION — Never assert that an API endpoint, integration, feature, or configuration parameter exists unless it appears explicitly in the retrieved documentation. When uncertain, say so.

4. UNDOCUMENTED QUERIES — When documentation does not cover a topic: acknowledge the gap, provide general technical context where it helps the user move forward, and recommend contacting support for platform-specific confirmation.

5. CONVERSATIONAL MESSAGES — Respond naturally and helpfully to greetings, thank-yous, follow-up questions, and questions about your own capabilities. These do not require documentation.

6. CODE — When documentation includes a relevant code example, include it as a fenced code block. Do not invent code that is not in the documentation.

7. LANGUAGE — Match the user's language precisely. Japanese input → Japanese output. English input → English output. Do not mix languages in a single response.

8. SYNTHESIS — Summarize and explain. Provide concrete, actionable answers. Avoid filler phrases. Get to the answer quickly.

9. TONE — Enterprise-grade, professional, concise, and technically precise.

10. CONVERSATION HISTORY — You have access to the full conversation. Use it to resolve ambiguity and understand follow-up questions in context.`;
}

// ─── ragChatStream ─────────────────────────────────────────────────────────
// Previously: returned a plain object { response } when chunks were empty,
// which broke the `for await` loop in route.ts (plain objects are not iterable).
// Now: always returns AsyncIterable<string> — the LLM handles empty-context
// queries gracefully via the system prompt instead of a hardcoded string.
export async function ragChatStream(
  messages: any[]
): Promise<AsyncIterable<string>> {
  const lastUser = [...messages]
    .reverse()
    .find((m: any) => m.role === "user");

  const query: string = lastUser?.content ?? "";
  const language = detectLanguage(messages as ChatMessage[]);

  // Retrieve up to 8 chunks (raised from 5 to provide more context surface)
  const chunks = await retriever.retrieve(query, 8);
  const context = buildContext(chunks);

  const systemMessage: ChatMessage = {
    role: "system",
    content: buildSystemPrompt(context, language),
  };

  const provider = getProvider();

  // Always call the LLM — the system prompt handles the no-docs case correctly
  return provider.chatStream([systemMessage, ...messages]);
}

// ─── ragChat (non-streaming, kept for compatibility) ───────────────────────
export async function ragChat(
  question: string
): Promise<{ response: string }> {
  const iterable = await ragChatStream([{ role: "user", content: question }]);
  let full = "";
  for await (const token of iterable) {
    full += token;
  }
  return { response: full };
}