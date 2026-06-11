// ─── monitoring/logger.ts ─────────────────────────────────────────────────────
//
// Fire-and-forget DB logging for chat, retrieval, model usage, and feedback.
// All functions return void and swallow errors so monitoring never disrupts
// the critical streaming path.
//
// Usage in route.ts:
//   logChatRequest({ ... }).catch(() => {});   // already caught internally

import { getPool } from "@/lib/db/postgres";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatLogInput {
  sessionId?:       string;
  query:            string;
  rewrittenQuery?:  string;
  intent?:          string;
  answerType?:      string;     // MATCH | NO_MATCH
  retrievalConf?:   string;     // high | medium | low
  maxScore?:        number;
  chunksReturned?:  number;
  inputChars?:      number;
  outputChars?:     number;
  latencyMs?:       number;
  responseStatus?:  string;     // ok | error | blocked
}

export interface RetrievalLogInput {
  chatLogId:  string;
  query:      string;
  chunkId?:   string;
  score?:     number;
  rank?:      number;
}

export interface ModelLogInput {
  chatLogId?:    string;
  provider?:     string;
  inputTokens?:  number;   // approximate: inputChars / 4
  outputTokens?: number;   // approximate: outputChars / 4
}

export interface FeedbackInput {
  sessionId?:  string;
  chatLogId?:  string;
  rating:      "up" | "down";
  question?:   string;
  answer?:     string;
  comment?:    string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function approxTokens(chars: number): number {
  return Math.round(chars / 4);
}

// ─── logChatRequest ───────────────────────────────────────────────────────────
// Insert one row into chat_logs and (optionally) model_logs.
// Returns the new chat_log id so callers can link retrieval rows.

export async function logChatRequest(
  input: ChatLogInput
): Promise<string | null> {
  try {
    const result = await pool.query<{ id: string }>(
      `
      INSERT INTO chat_logs (
        session_id,
        query,
        rewritten_query,
        intent,
        answer_type,
        retrieval_conf,
        max_score,
        chunks_returned,
        input_chars,
        output_chars,
        latency_ms,
        response_status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING id
      `,
      [
        input.sessionId        ?? null,
        input.query,
        input.rewrittenQuery   ?? null,
        input.intent           ?? null,
        input.answerType       ?? null,
        input.retrievalConf    ?? null,
        input.maxScore         ?? null,
        input.chunksReturned   ?? null,
        input.inputChars       ?? null,
        input.outputChars      ?? null,
        input.latencyMs        !== undefined ? Math.round(input.latencyMs) : null,
        input.responseStatus   ?? "ok",
      ]
    );

    const chatLogId = result.rows[0]?.id ?? null;

    // Log approximate model usage alongside
    if (chatLogId && (input.inputChars || input.outputChars)) {
      await logModelUsage({
        chatLogId,
        provider:     process.env.LLM_PROVIDER ?? "auto",
        inputTokens:  input.inputChars  ? approxTokens(input.inputChars)  : undefined,
        outputTokens: input.outputChars ? approxTokens(input.outputChars) : undefined,
      });
    }

    return chatLogId;
  } catch (err) {
    // Never throw — monitoring must not break the chat pipeline
    console.error("[monitoring] logChatRequest failed:", err);
    return null;
  }
}

// ─── logRetrievalChunks ───────────────────────────────────────────────────────
// Log each retrieved chunk for quality analysis.

export async function logRetrievalChunks(
  inputs: RetrievalLogInput[]
): Promise<void> {
  if (inputs.length === 0) return;
  try {
    // Bulk insert via unnest for efficiency
    const chatLogIds  = inputs.map(r => r.chatLogId);
    const queries     = inputs.map(r => r.query);
    const chunkIds    = inputs.map(r => r.chunkId   ?? null);
    const scores      = inputs.map(r => r.score     ?? null);
    const ranks       = inputs.map(r => r.rank      ?? null);

    await pool.query(
      `
      INSERT INTO retrieval_logs (chat_log_id, query, chunk_id, score, rank)
      SELECT * FROM unnest(
        $1::uuid[],
        $2::text[],
        $3::uuid[],
        $4::numeric[],
        $5::int[]
      )
      `,
      [chatLogIds, queries, chunkIds, scores, ranks]
    );
  } catch (err) {
    console.error("[monitoring] logRetrievalChunks failed:", err);
  }
}

// ─── logModelUsage ────────────────────────────────────────────────────────────

export async function logModelUsage(
  input: ModelLogInput
): Promise<void> {
  try {
    await pool.query(
      `
      INSERT INTO model_logs (chat_log_id, provider, input_tokens, output_tokens)
      VALUES ($1, $2, $3, $4)
      `,
      [
        input.chatLogId    ?? null,
        input.provider     ?? null,
        input.inputTokens  ?? null,
        input.outputTokens ?? null,
      ]
    );
  } catch (err) {
    console.error("[monitoring] logModelUsage failed:", err);
  }
}

// ─── logFeedback ─────────────────────────────────────────────────────────────

export async function logFeedback(
  input: FeedbackInput
): Promise<string | null> {
  try {
    const result = await pool.query<{ id: string }>(
      `
      INSERT INTO feedback (session_id, chat_log_id, rating, question, answer, comment)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
      `,
      [
        input.sessionId ?? null,
        input.chatLogId ?? null,
        input.rating,
        input.question  ?? null,
        input.answer    ?? null,
        input.comment   ?? null,
      ]
    );
    return result.rows[0]?.id ?? null;
  } catch (err) {
    console.error("[monitoring] logFeedback failed:", err);
    return null;
  }
}

// ─── getAnalytics ─────────────────────────────────────────────────────────────
// Aggregate stats for the /admin/analytics dashboard.

export interface AnalyticsStats {
  queriesTotal:       number;
  queriesToday:       number;
  avgLatencyMs:       number;
  failedRetrievals:   number;
  thumbsUp:           number;
  thumbsDown:         number;
  totalInputTokens:   number;
  totalOutputTokens:  number;
  topQueries:         { query: string; count: number }[];
  latencyByHour:      { hour: string; avg_ms: number; count: number }[];
  confidenceDist:     { conf: string; count: number }[];
}

export async function getAnalytics(days = 7): Promise<AnalyticsStats> {
  const since = `now() - interval '${days} days'`;

  const [totals, today, latencyHour, confDist, topQ, feedback] =
    await Promise.all([
      // Overall totals
      pool.query<{
        total: string;
        failed: string;
        avg_ms: string;
        total_in: string;
        total_out: string;
      }>(
        `SELECT
           COUNT(*)                                      AS total,
           COUNT(*) FILTER (WHERE answer_type='NO_MATCH') AS failed,
           ROUND(AVG(latency_ms))                        AS avg_ms,
           COALESCE(SUM(input_chars/4),  0)              AS total_in,
           COALESCE(SUM(output_chars/4), 0)              AS total_out
         FROM chat_logs
         WHERE created_at >= ${since}`
      ),

      // Queries today
      pool.query<{ count: string }>(
        `SELECT COUNT(*) AS count
         FROM chat_logs
         WHERE created_at >= now() - interval '1 day'`
      ),

      // Avg latency per hour (last 24 h)
      pool.query<{ hour: string; avg_ms: string; count: string }>(
        `SELECT
           to_char(date_trunc('hour', created_at), 'HH24:MI') AS hour,
           ROUND(AVG(latency_ms))                             AS avg_ms,
           COUNT(*)                                           AS count
         FROM chat_logs
         WHERE created_at >= now() - interval '24 hours'
         GROUP BY 1
         ORDER BY 1`
      ),

      // Retrieval confidence distribution
      pool.query<{ conf: string; count: string }>(
        `SELECT
           COALESCE(retrieval_conf, 'unknown') AS conf,
           COUNT(*)                            AS count
         FROM chat_logs
         WHERE created_at >= ${since}
         GROUP BY 1
         ORDER BY 2 DESC`
      ),

      // Top 10 distinct queries
      pool.query<{ query: string; count: string }>(
        `SELECT query, COUNT(*) AS count
         FROM chat_logs
         WHERE created_at >= ${since}
         GROUP BY query
         ORDER BY 2 DESC
         LIMIT 10`
      ),

      // Feedback totals
      pool.query<{ rating: string; count: string }>(
        `SELECT rating, COUNT(*) AS count
         FROM feedback
         WHERE created_at >= ${since}
         GROUP BY rating`
      ),
    ]);

  const t = totals.rows[0];
  const feedMap = Object.fromEntries(
    feedback.rows.map(r => [r.rating, Number(r.count)])
  );

  return {
    queriesTotal:      Number(t?.total       ?? 0),
    queriesToday:      Number(today.rows[0]?.count ?? 0),
    avgLatencyMs:      Number(t?.avg_ms      ?? 0),
    failedRetrievals:  Number(t?.failed      ?? 0),
    totalInputTokens:  Number(t?.total_in    ?? 0),
    totalOutputTokens: Number(t?.total_out   ?? 0),
    thumbsUp:          feedMap["up"]   ?? 0,
    thumbsDown:        feedMap["down"] ?? 0,
    topQueries:        topQ.rows.map(r => ({ query: r.query, count: Number(r.count) })),
    latencyByHour:     latencyHour.rows.map(r => ({
      hour:   r.hour,
      avg_ms: Number(r.avg_ms),
      count:  Number(r.count),
    })),
    confidenceDist: confDist.rows.map(r => ({
      conf:  r.conf,
      count: Number(r.count),
    })),
  };
}
