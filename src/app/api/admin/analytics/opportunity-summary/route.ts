// ─── /api/admin/analytics/opportunity-summary/route.ts ────────────────────────
//
// On-demand: given a sessionId, reads all session_insights and calls the LLM
// ONCE to produce a 2–3 sentence prose summary for the admin.
// Result is cached in session_summaries column to avoid repeat calls.
// Pattern identical to buildConversationSummary() in draftTicket.ts.

import { pool }        from "@/lib/db/postgres";
import { getProvider } from "@/lib/ai/providers/ProviderFactory";

export async function POST(req: Request) {
  try {
    const body      = await req.json();
    const sessionId = body.sessionId;

    if (typeof sessionId !== "string" || !sessionId) {
      return Response.json({ error: "sessionId required" }, { status: 400 });
    }

    // Check for cached summary first
    const cached = await pool.query<{ summary: string }>(
      `SELECT summary FROM opportunity_summaries WHERE session_id = $1 LIMIT 1`,
      [sessionId]
    ).catch(() => ({ rows: [] }));

    if (cached.rows[0]?.summary) {
      return Response.json({ summary: cached.rows[0].summary, cached: true });
    }

    // Fetch insights from session_state
    const stateResult = await pool.query<{ state: any }>(
      `SELECT state FROM session_state WHERE session_id = $1 LIMIT 1`,
      [sessionId]
    );

    const state = stateResult.rows[0]?.state;

    if (!state || (!state.subIntent && Object.keys(state.knownSlots || {}).length === 0)) {
      return Response.json({ summary: "No insights collected for this session yet.", cached: false });
    }

    const insightText = `Topic: ${state.topic}
Intent: ${state.subIntent ?? 'Unknown'}
Known Facts: ${JSON.stringify(state.knownSlots || {})}`;

    const prompt = `You are a sales intelligence assistant. Based on the following visitor signals collected from a chat session on an enterprise retail AI platform, write a 2–3 sentence opportunity summary for the sales team. Be factual, concise, and professional.

Signals:
${insightText}

Summary:`;

    const provider = getProvider();
    const raw      = await provider.chat([{ role: "user", content: prompt }]);
    const summary  = raw.trim().slice(0, 1000);

    // Cache the result (best-effort — table may not exist yet)
    pool.query(
      `INSERT INTO opportunity_summaries (session_id, summary) VALUES ($1, $2)
       ON CONFLICT (session_id) DO UPDATE SET summary = EXCLUDED.summary, updated_at = now()`,
      [sessionId, summary]
    ).catch(() => {});

    return Response.json({ summary, cached: false });
  } catch (err: any) {
    console.error("[opportunity-summary] POST failed:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
