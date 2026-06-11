import { getProvider } from "@/lib/ai/providers/ProviderFactory";
import { ChatMessage } from "@/lib/ai/types/ChatMessage";

export interface DraftTicket {
  title:    string;
  summary:  string;
  category: string;
  priority: string;
}

// ─── Intent exemplars ─────────────────────────────────────────────────────────
// Each array is a cluster of phrases representing the same intent.
// Similarity is scored by token overlap (Dice coefficient) — no LLM needed.

const ESCALATION_EXEMPLARS_EN = [
  "I want to talk to a human",
  "can I speak to a real person",
  "I need a support agent",
  "please open a ticket for me",
  "create a support ticket",
  "I want to raise a ticket",
  "connect me to someone",
  "I need help from a person",
  "can you escalate this",
  "I want to contact support",
  "get me a representative",
  "I need to file a complaint",
  "this is urgent please help me",
  "nothing is working I need help",
  "I have been trying for hours",
  "still broken after everything",
  "tried everything still not working",
];

const ESCALATION_EXEMPLARS_JA = [
  "担当者に繋いでください",
  "人と話したい",
  "チケットを作成してください",
  "サポートに問い合わせたい",
  "エスカレートしてください",
  "全然解決しない助けてください",
  "ずっと試しているが直らない",
];

// ─── Similarity helpers ───────────────────────────────────────────────────────

function tokenize(text: string): Set<string> {
  return new Set(
    text.toLowerCase()
      .replace(/[^\w\u3040-\u30ff\u3400-\u9fbf\s]/g, " ")
      .split(/\s+/)
      .filter(t => t.length > 1)
  );
}

function diceCoefficient(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const t of a) if (b.has(t)) shared++;
  return (2 * shared) / (a.size + b.size);
}

function maxSimilarity(input: Set<string>, exemplars: string[]): number {
  return Math.max(0, ...exemplars.map(e => diceCoefficient(input, tokenize(e))));
}

const SIMILARITY_THRESHOLD = 0.35;

export function shouldEscalate(
  messages: ChatMessage[],
  _retrievalConf: string,
  answerType: string
): boolean {
  const lastUser  = [...messages].reverse().find(m => m.role === "user")?.content ?? "";
  const inputToks = tokenize(lastUser);

  if (maxSimilarity(inputToks, ESCALATION_EXEMPLARS_EN) >= SIMILARITY_THRESHOLD) return true;
  if (maxSimilarity(inputToks, ESCALATION_EXEMPLARS_JA) >= SIMILARITY_THRESHOLD) return true;

  if (answerType === "NO_MATCH") return true;

  // Persistent frustration: 4+ turns and the last message still sounds stuck
  const userTurns = messages.filter(m => m.role === "user").length;
  if (userTurns >= 4) {
    const STUCK_EXEMPLARS = [
      "still not working tried everything",
      "same problem keeps happening",
      "nothing I do fixes this",
      "I give up please just help me",
    ];
    if (maxSimilarity(inputToks, STUCK_EXEMPLARS) >= SIMILARITY_THRESHOLD) return true;
  }

  return false;
}

export async function generateDraftTicket(
  messages: ChatMessage[],
  sessionId?: string
): Promise<DraftTicket> {
  const recentMessages = messages.slice(-10);
  const convoText = recentMessages
    .map(m => `${m.role === "user" ? "Customer" : "AI"}: ${m.content}`)
    .join("\n");

  const prompt = `You are a support ticket classifier. Based on the conversation below, generate a support ticket.

Conversation:
${convoText}

Respond ONLY with valid JSON (no markdown, no extra text):
{
  "title": "short descriptive title under 80 chars",
  "summary": "2-3 sentence summary of the issue",
  "category": "one of: technical | billing | general | feature_request | other",
  "priority": "one of: low | medium | high"
}`;

  const provider = getProvider();
  let raw = "";
  try {
    raw = await provider.chat([{ role: "user", content: prompt }]);
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return {
      title:    String(parsed.title    ?? "Support Request").slice(0, 200),
      summary:  String(parsed.summary  ?? "").slice(0, 1000),
      category: String(parsed.category ?? "general"),
      priority: String(parsed.priority ?? "medium"),
    };
  } catch {
    return {
      title:    "Support Request",
      summary:  "Customer requested human support.",
      category: "general",
      priority: "medium",
    };
  }
}

export async function buildConversationSummary(messages: ChatMessage[]): Promise<string> {
  const recent = messages.slice(-10);
  const convoText = recent
    .map(m => `${m.role === "user" ? "Customer" : "AI"}: ${m.content}`)
    .join("\n");

  const prompt = `Summarise this support conversation in 2-3 sentences for a support agent. Be factual and concise.

Conversation:
${convoText}

Summary:`;

  try {
    const provider = getProvider();
    const result = await provider.chat([{ role: "user", content: prompt }]);
    return result.trim().slice(0, 1000);
  } catch {
    return "Customer requested support assistance.";
  }
}
