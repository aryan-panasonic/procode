import { logFeedback } from "@/lib/monitoring/logger";
import { getPool } from "@/lib/db/postgres";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { sessionId, chatLogId, rating, question, answer, comment } = body ?? {};

    if (rating !== "up" && rating !== "down") {
      return Response.json({ error: "rating must be 'up' or 'down'" }, { status: 400 });
    }

    const id = await logFeedback({
      sessionId: typeof sessionId === "string" ? sessionId : undefined,
      chatLogId: typeof chatLogId  === "string" ? chatLogId  : undefined,
      rating,
      question: typeof question === "string" ? question.slice(0, 2000) : undefined,
      answer:   typeof answer   === "string" ? answer.slice(0, 4000)   : undefined,
      comment:  typeof comment  === "string" ? comment.slice(0, 1000)  : undefined,
    });

    return Response.json({ ok: true, id });
  } catch (err) {
    console.error("[feedback] POST error:", err);
    return Response.json({ error: "internal error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200);
    const rating = searchParams.get("rating");

    const result = await pool.query(
      `SELECT id, created_at, session_id, rating, question, answer, comment
       FROM feedback
       ${rating ? "WHERE rating = $2" : ""}
       ORDER BY created_at DESC
       LIMIT $1`,
      rating ? [limit, rating] : [limit]
    );

    return Response.json({ feedback: result.rows });
  } catch (err) {
    console.error("[feedback] GET error:", err);
    return Response.json({ error: "internal error" }, { status: 500 });
  }
}
