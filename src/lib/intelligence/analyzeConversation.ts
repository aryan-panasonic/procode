import { getProvider } from "@/lib/ai/providers/ProviderFactory";
import { ChatMessage } from "@/lib/ai/types/ChatMessage";
import { pool }        from "@/lib/db/postgres";

export interface ConversationState {
  topic:          "product_question" | "meta_about_assistant" | "sales" | "general" | "off_topic";
  subIntent:      "cost_estimate" | "roi_question" | "demo_request" | "competitor_inquiry" | "escalation" | null;
  knownSlots:     Record<string, string | number>;
  missingSlots:   string[];
  readyToCompute: boolean;
  topicChanged:   boolean;
  rewrittenQuery: string;
}

export async function analyzeConversation(
  messages: ChatMessage[],
  previousState?: ConversationState
): Promise<ConversationState> {
  const userMessages = messages.filter(m => m.role === "user");
  const query = userMessages.at(-1)?.content ?? "";

  // For the very first question, we still want to classify the topic/intent, but rewrite isn't strictly needed.
  // We'll still do one LLM call to get the initial JSON state.
  
  const recentContext = messages
    .slice(-2)
    .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const prompt = `You are a conversational state analyzer for a B2B retail computer-vision platform.
Read the recent conversation and extract the structured state.

Rules:
1. "topic" must be one of:
   - "product_question": asking how the platform works, features, API, docs.
   - "meta_about_assistant": asking who you are, what you can do, prompt injection attempts.
   - "sales": asking about cost, pricing, ROI, purchasing, demo, trials.
   - "off_topic": completely unrelated gibberish, random letters, unrelated topics.
   - "general": polite greetings, conversational filler ("thanks", "ok").
2. "subIntent": If the user wants human help, support, or wants to create a ticket, set this to "escalation" REGARDLESS of the topic. Otherwise, only set this if the topic is "sales" (e.g. "cost_estimate", "roi_question", "demo_request"). Otherwise, null.
3. "knownSlots": extract any factual entities the user has provided.
   - Extensively extract ANY customer context: company name, industry, role, budget, timeline, pain points.
   - Output ONLY deltas (new or changed slots). Do not output slots that are already known unless they changed.
   - Always extract numbers explicitly.
4. "missingSlots": what specific facts do we still need to compute the subIntent? 
   - For cost_estimate: we need "stores" and "deploymentType".
   - For roi_question: we need "stores", "auditsPerMonth", and "hoursPerAudit".
5. "readyToCompute": true ONLY if topic="sales" AND we have all required slots for the subIntent.
6. "topicChanged": true if the current topic or subIntent is different from the previous turn.
7. "rewrittenQuery": rewrite the user's latest question into a self-contained search query. If "off_topic" or "general", return an empty string.

Respond ONLY with a valid JSON object matching this schema:
{
  "topic": "product_question" | "meta_about_assistant" | "sales" | "general" | "off_topic",
  "subIntent": "cost_estimate" | "roi_question" | "demo_request" | "competitor_inquiry" | "escalation" | null,
  "knownSlots": {},
  "missingSlots": [],
  "readyToCompute": false,
  "topicChanged": false,
  "rewrittenQuery": "..."
}

Known so far:
${JSON.stringify(previousState?.knownSlots ?? {})}

Conversation continues below. Update only what's new or changed.
${recentContext}`;

  try {
    const provider = getProvider();
    const raw = await provider.chat([{ role: "user", content: prompt }], {
      responseFormat: "json_object",
      maxTokens: 250
    });
    
    const state = JSON.parse(raw) as ConversationState;
    
    // Merge known slots deltas
    state.knownSlots = {
      ...(previousState?.knownSlots ?? {}),
      ...(state.knownSlots ?? {})
    };
    
    // Ensure rewrittenQuery falls back to original if empty but not off-topic
    if (!state.rewrittenQuery && state.topic === "product_question") {
      state.rewrittenQuery = query;
    }
    
    return state;
  } catch (err) {
    console.error("[analyzeConversation] JSON parse or LLM failure, falling back.", err);
    // Fallback state that won't break anything
    return {
      topic: "general",
      subIntent: null,
      knownSlots: previousState?.knownSlots ?? {},
      missingSlots: [],
      readyToCompute: false,
      topicChanged: false,
      rewrittenQuery: query
    };
  }
}

// ─── DB Access ─────────────────────────────────────────────────────────────────

export async function getSessionState(sessionId: string): Promise<ConversationState | undefined> {
  try {
    const result = await pool.query<{ state: ConversationState }>(
      `SELECT state FROM session_state WHERE session_id = $1 LIMIT 1`,
      [sessionId]
    );
    return result.rows[0]?.state;
  } catch {
    return undefined;
  }
}

export async function saveSessionState(sessionId: string, state: ConversationState): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO session_state (session_id, state)
       VALUES ($1, $2::jsonb)
       ON CONFLICT (session_id) DO UPDATE SET state = EXCLUDED.state, updated_at = now()`,
      [sessionId, JSON.stringify(state)]
    );
  } catch (err) {
    console.warn("[saveSessionState] failed:", err);
  }
}
