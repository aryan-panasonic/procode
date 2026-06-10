import { ragChatStream } from "@/lib/rag/services/ragChat";
import { AIError }
from "@/lib/ai/errors/AIError";

// ─── Request limits ──────────────────────────────────────────────────────────
const MAX_MESSAGES       = 20;       // how many turns to retain
const MAX_MESSAGE_CHARS  = 2_000;    // per-message character cap
const MAX_TOTAL_CHARS    = 20_000;   // total conversation budget
const ALLOWED_ROLES      = new Set(["user", "assistant"]);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function isValidRole(role: unknown): role is "user" | "assistant" {
  return typeof role === "string" && ALLOWED_ROLES.has(role);
}

/**
 * Strip null bytes and non-printable control characters while preserving
 * normal whitespace (tab, newline, carriage return). Truncate to budget.
 */
function sanitizeContent(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .slice(0, MAX_MESSAGE_CHARS);
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
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

    // ── 1. Validate & sanitize each message ──────────────────────────────────
    const raw: unknown[] = (body as { messages: unknown[] }).messages;

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

    // ── 2. Enforce recency window + total character budget ────────────────────
    const recent = validated.slice(-MAX_MESSAGES);
    let charsSeen = 0;
    const budgeted = recent.filter((m) => {
      charsSeen += m.content.length;
      return charsSeen <= MAX_TOTAL_CHARS;
    });

    // ── 3. Stream response ────────────────────────────────────────────────────
    let stream: AsyncIterable<string>;
      try {

        stream =
          await ragChatStream(
            budgeted
          );

      } catch (err) {

        console.error(
          "[chat/route] Chat creation error:",
          err
        );

        if (
          err instanceof AIError &&
          err.code ===
            "CONTENT_FILTER"
        ) {

          return Response.json(
            {
              error:
                "This request was blocked by safety policies."
            },
            {
              status: 200
            }
          );
        }

        return Response.json(
          {
            error:
              "AI service temporarily unavailable."
          },
          {
            status: 500
          }
        );
      }

      const encoder =
        new TextEncoder();

      const readable =
        new ReadableStream({

          async start(controller) {

            try {

              for await (
                const chunk of stream
              ) {

                controller.enqueue(
                  encoder.encode(chunk)
                );
              }

            } catch (err) {

              console.error(
                "[chat/route] Stream error:",
                err
              );

              controller.enqueue(
                encoder.encode(
                  "\n\nAn error occurred while generating the response."
                )
              );

            } finally {

              controller.close();

            }
          },
        });

    return new Response(readable, {
      headers: {
        "Content-Type":           "text/plain; charset=utf-8",
        "Cache-Control":          "no-store",
        "Connection":             "keep-alive",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[chat/route] Unhandled error:", err);
    return new Response("Internal server error", { status: 500 });
  }
}
