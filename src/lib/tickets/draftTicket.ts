import { getProvider } from "@/lib/ai/providers/ProviderFactory";
import { ChatMessage } from "@/lib/ai/types/ChatMessage";

export interface DraftTicket {
  title:    string;
  summary:  string;
  category: string;
  priority: string;
}

const ESCALATION_KEYWORDS_EN = [
  "human", "agent", "person", "support ticket", "open a ticket",
  "create a ticket", "real person", "speak to someone", "call me",
  "contact me", "escalate", "representative",
];
const ESCALATION_KEYWORDS_JA = [
  "人間", "担当者", "サポート", "チケット", "電話", "連絡", "エスカレート",
];

export function shouldEscalate(
  messages: ChatMessage[],
  retrievalConf: string,
  answerType: string
): boolean {
  if (retrievalConf === "low" || answerType === "NO_MATCH") return true;

  const lastUser = [...messages].reverse().find(m => m.role === "user")?.content ?? "";
  const lower = lastUser.toLowerCase();
  const matchEN = ESCALATION_KEYWORDS_EN.some(kw => lower.includes(kw));
  const matchJA = ESCALATION_KEYWORDS_JA.some(kw => lastUser.includes(kw));
  return matchEN || matchJA;
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
