// ─── redaction.ts ─────────────────────────────────────────────────────────────
//
// Isomorphic (client + server) security utilities for the RAG chat pipeline.
//
// Two responsibilities:
//
//   1. INPUT REDACTION
//      Strip credentials and secrets from user messages before they reach the
//      LLM, get embedded in the rewritten query, or are persisted to localStorage.
//      Covers the common paste-by-accident cases: API keys, JWTs, connection
//      strings, bearer tokens.
//
//   2. OUTPUT LEAKAGE DETECTION
//      Detect the rare case where the LLM accidentally echoes back the system
//      prompt. When triggered, the response is replaced with a safe fallback
//      so the system prompt structure is never surfaced to the user.
//
// No external dependencies — pure string operations. Safe to import in both
// Next.js server code (ragChat.ts) and client components (ChatWindow.tsx).

// ─── Input: sensitive data patterns ──────────────────────────────────────────
//
// Each pattern is defined as a factory function so that a fresh RegExp (with
// lastIndex = 0) is created on every redactSensitiveData call. Sharing a
// stateful /g regex across calls causes skipped matches.

const SENSITIVE_PATTERN_FACTORIES: Array<{ name: string; make: () => RegExp }> = [
  {
    name: "OpenAI / Anthropic key",
    make: () => /sk-[A-Za-z0-9_-]{20,}/g,
  },
  {
    name: "JWT token (three-part)",
    make: () => /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
  },
  {
    name: "AWS access key ID",
    make: () => /(?:AKIA|ASIA|AROA)[A-Z0-9]{16}/g,
  },
  {
    name: "Azure storage key",
    make: () => /AccountKey=[A-Za-z0-9+/=]{20,}/g,
  },
  {
    name: "Postgres connection string",
    make: () => /postgres(?:ql)?:\/\/[^\s"'<>\]]+/gi,
  },
  {
    name: "MongoDB connection string",
    make: () => /mongodb(?:\+srv)?:\/\/[^\s"'<>\]]+/gi,
  },
  {
    name: "HTTP Basic auth in URL",
    make: () => /https?:\/\/[^:@\s]+:[^@\s]+@[^\s]+/gi,
  },
  {
    name: "Generic bearer token",
    make: () => /Bearer\s+[A-Za-z0-9_\-.]{20,}/gi,
  },
  {
    name: "PEM private key header",
    make: () => /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  },
  {
    name: "Generic api_key / api_secret assignment",
    make: () =>
      /(?:api[_-]?key|api[_-]?secret|access[_-]?token)\s*[=:]\s*['"]?[A-Za-z0-9_\-]{16,}['"]?/gi,
  },
];

// ─── Output: prompt-leakage patterns ─────────────────────────────────────────
//
// These match characteristic phrases from the system prompt. If ANY of these
// appear verbatim in a model response the system prompt has been echoed back,
// which violates rule S1 (CONFIDENTIALITY).

const LEAKAGE_PATTERNS: RegExp[] = [
  /you are the official technical support assistant/i,
  /SECURITY RULES.*HIGHEST PRIORITY/i,
  /S1\.\s+CONFIDENTIALITY/i,
  /S2\.\s+IDENTITY LOCK/i,
  /S3\.\s+INJECTION RESISTANCE/i,
  /S4\.\s+NO INTERNAL DETAILS/i,
  /RETRIEVED DOCUMENTATION:/i,
  /Documentation Confidence:/i,
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RedactionResult {
  /** The text with any sensitive tokens replaced by [REDACTED]. */
  text: string;
  /** True when at least one replacement was made. */
  redacted: boolean;
  /** Total number of tokens replaced. */
  count: number;
}

// ─── redactSensitiveData ──────────────────────────────────────────────────────
//
// Replace known-sensitive patterns in `text` with the literal "[REDACTED]".
// Returns the cleaned text plus metadata so callers can log or warn.

export function redactSensitiveData(text: string): RedactionResult {
  let result = text;
  let count  = 0;

  for (const { make } of SENSITIVE_PATTERN_FACTORIES) {
    const re      = make();
    const matches = result.match(re);
    if (matches) {
      count  += matches.length;
      result  = result.replace(re, "[REDACTED]");
    }
  }

  return { text: result, redacted: count > 0, count };
}

// ─── detectPromptLeakage ──────────────────────────────────────────────────────
//
// Returns true when the model's response appears to contain system-prompt text.
// Callers should replace the full response with LEAKAGE_FALLBACK when this fires.

export function detectPromptLeakage(text: string): boolean {
  return LEAKAGE_PATTERNS.some(p => p.test(text));
}

// ─── LEAKAGE_FALLBACK ─────────────────────────────────────────────────────────
//
// Safe replacement shown to the user when leakage is detected.

export const LEAKAGE_FALLBACK =
  "I'm sorry, I encountered an issue generating that response. " +
  "Please try rephrasing your question.";

// ─── verifyOutputLeakage ──────────────────────────────────────────────────────
//
// Defense in depth: if the response accidentally regurgitates an exact substantial
// snippet of a chunk marked 'private', it's flagged as a leak.

export function verifyOutputLeakage(response: string, retrievedChunks: { content?: string, visibility?: string }[]): boolean {
  for (const chunk of retrievedChunks) {
    if (chunk.visibility === "private" && chunk.content) {
      // Very basic leakage check: if a large enough exact substring of the private chunk appears
      const snippet = chunk.content.substring(0, 100);
      if (snippet.length >= 50 && response.includes(snippet)) {
        return true;
      }
    }
  }
  return false;
}