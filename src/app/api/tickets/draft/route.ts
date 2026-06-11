import { generateDraftTicket, buildConversationSummary } from "@/lib/tickets/draftTicket";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return Response.json({ error: "messages required" }, { status: 400 });
    }
    const [draft, conversationSummary] = await Promise.all([
      generateDraftTicket(body.messages, body.sessionId),
      buildConversationSummary(body.messages),
    ]);
    return Response.json({ draft, conversationSummary });
  } catch (err) {
    console.error("[tickets/draft] error:", err);
    return Response.json({ error: "Failed to generate draft" }, { status: 500 });
  }
}
