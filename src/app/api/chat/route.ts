import { ragChatStream }      from "@/lib/rag/services/ragChat";
import { AIError }            from "@/lib/ai/errors/AIError";
import { logChatRequest,
         logRetrievalChunks } from "@/lib/monitoring/logger";
import "@/lib/env";
import { validateDatabase } from "@/lib/db-health";


// ─── Request limits ───────────────────────────────────────────────────────────
const MAX_MESSAGES       = 20;
const MAX_MESSAGE_CHARS  = 2_000;
const MAX_TOTAL_CHARS    = 20_000;
const ALLOWED_ROLES      = new Set(["user", "assistant"]);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isValidRole(role: unknown): role is "user" | "assistant" {
  return typeof role === "string" && ALLOWED_ROLES.has(role);
}

function sanitizeContent(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .slice(0, MAX_MESSAGE_CHARS);
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const startTime = performance.now();

  try {
    await validateDatabase();
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    if (
      body === null ||
      typeof body !== "object" ||
      !Array.isArray((body as Record<string, unknown>).messages)
    ) {
      return new Response("Bad request: messages must be an array", { status: 400 });
    }

    // ── 1. Validate & sanitize ────────────────────────────────────────────────
    const raw: unknown[] = (body as { messages: unknown[]; sessionId?: string }).messages;
    const sessionId: string | undefined = typeof (body as any).sessionId === "string"
      ? (body as any).sessionId
      : undefined;

    const validated = raw
      .filter(
        (m): m is { role: "user" | "assistant"; content: string } =>
          m !== null &&
          typeof m === "object" &&
          isValidRole((m as Record<string, unknown>).role) &&
          typeof (m as Record<string, unknown>).content === "string"
      )
      .map((m) => ({
        role:    m.role,
        content: sanitizeContent(m.content),
      }))
      .filter((m) => m.content.length > 0);

    if (validated.length === 0) {
      return new Response("No valid messages provided", { status: 400 });
    }

    // ── 2. Enforce recency window + budget ────────────────────────────────────
    const recent = validated.slice(-MAX_MESSAGES);
    let charsSeen = 0;
    const budgeted = recent.filter((m) => {
      charsSeen += m.content.length;
      return charsSeen <= MAX_TOTAL_CHARS;
    });

    // Capture the last user query for monitoring
    const lastUserQuery = [...budgeted]
      .reverse()
      .find(m => m.role === "user")?.content ?? "";

    // ── 3. Build stream + collect metadata ────────────────────────────────────
    let ragResult: Awaited<ReturnType<typeof ragChatStream>>;
    try {
      ragResult = await ragChatStream(budgeted);
    } catch (err) {
      console.error("[chat/route] Chat creation error:", err);

      const latencyMs = performance.now() - startTime;

      // Log the error
      logChatRequest({
        sessionId,
        query:          lastUserQuery,
        responseStatus: "error",
        latencyMs,
      }).catch(() => {});

      if (err instanceof AIError && err.code === "CONTENT_FILTER") {
        logChatRequest({
          sessionId,
          query:          lastUserQuery,
          responseStatus: "blocked",
          latencyMs,
        }).catch(() => {});

        return Response.json(
          { error: "This request was blocked by safety policies." },
          { status: 200 }
        );
      }

      return Response.json(
        { error: "AI service temporarily unavailable." },
        { status: 500 }
      );
    }

    const { stream, meta } = ragResult;
    const encoder = new TextEncoder();

    // ── 4. Wrap stream: count output chars + log at completion ────────────────
    const readable = new ReadableStream({
      async start(controller) {
        let outputChars = 0;

        try {
          for await (const chunk of stream) {
            outputChars += chunk.length;
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (err) {
          console.error("[chat/route] Stream error:", err);
          controller.enqueue(
            encoder.encode("\n\nAn error occurred while generating the response.")
          );
        } finally {
          controller.close();

          // ── Fire-and-forget monitoring ────────────────────────────────────
          const latencyMs = performance.now() - startTime;

          logChatRequest({
            sessionId,
            query:          lastUserQuery,
            rewrittenQuery: meta.rewrittenQuery,
            answerType:     meta.answerType,
            retrievalConf:  meta.retrievalConf,
            maxScore:       meta.maxScore,
            chunksReturned: meta.chunksReturned,
            inputChars:     meta.inputChars,
            outputChars,
            latencyMs,
            responseStatus: "ok",
          }).then(chatLogId => {
            // Log individual retrieved chunks for quality analysis
            if (chatLogId && meta.chunkIds.length > 0) {
              logRetrievalChunks(
                meta.chunkIds.map((id, i) => ({
                  chatLogId,
                  query: meta.rewrittenQuery,
                  chunkId: id,
                  rank:    i + 1,
                }))
              ).catch(() => {});
            }
          }).catch(() => {});
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type":           "text/plain; charset=utf-8",
        "Cache-Control":          "no-store",
        "Connection":             "keep-alive",
        "X-Content-Type-Options": "nosniff",
        "X-Escalate":             meta.shouldEscalate ? "1" : "0",
      },
    });

  } catch (err) {
    console.error("[chat/route] Unhandled error:", err);
    return new Response("Internal server error", { status: 500 });
  }
}
