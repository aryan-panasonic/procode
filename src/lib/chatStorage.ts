// ─── chatStorage.ts ───────────────────────────────────────────────────────────
//
// Lightweight localStorage-backed persistence for chat sessions.
//
// Provides:
//   saveChat()       — upsert a session (new or existing)
//   loadChat()       — load one session by id, or the most-recent session
//   loadAllChats()   — list all sessions (for the history sidebar)
//   clearChat()      — delete a specific session, or clear the "current" pointer
//   createSession()  — factory for a fresh empty session
//   generateTitle()  — derive a human-readable title from the first user message

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StoredMessage {
  role:    "user" | "assistant";
  content: string;
}

export interface ChatSession {
  sessionId: string;
  title:     string;
  messages:  StoredMessage[];
  timestamp: number;        // ms since epoch — updated on every save
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSIONS_KEY  = "isa_chat_sessions";   // JSON array of ChatSession
const CURRENT_KEY   = "isa_current_session"; // sessionId string
const MAX_SESSIONS  = 20;                    // oldest sessions are dropped first
const MAX_TITLE_LEN = 48;

// ─── Private helpers ──────────────────────────────────────────────────────────

function loadAll(): ChatSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAll(sessions: ChatSession[]): void {
  try {
    // Newest first; drop the oldest when over the cap
    const sorted = sessions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_SESSIONS);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sorted));
  } catch {
    // Quota exceeded — silently ignore; session still lives in memory
  }
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Derive a concise, human-readable title from the first user message.
 *
 * Examples:
 *   "How do I install Oracle Retail?"     →  "How do I install Oracle Retail?"
 *   "planogram compliance explained"      →  "planogram compliance explained"
 *   (very long message)                   →  "First forty-eight chars of the…"
 */
export function generateTitle(messages: StoredMessage[]): string {
  const first = messages.find(m => m.role === "user");
  if (!first) return "New conversation";

  const cleaned = first.content
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= MAX_TITLE_LEN) return cleaned;

  // Truncate at a word boundary
  const truncated = cleaned.slice(0, MAX_TITLE_LEN);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated) + "…";
}

/**
 * Factory — returns a brand-new empty session ready to be populated.
 */
export function createSession(): ChatSession {
  return {
    sessionId: uid(),
    title:     "New conversation",
    messages:  [],
    timestamp: Date.now(),
  };
}

/**
 * Upsert a session. Updates the "current" pointer to this session.
 */
export function saveChat(session: ChatSession): void {
  const all = loadAll();
  const idx = all.findIndex(s => s.sessionId === session.sessionId);

  const updated: ChatSession = {
    ...session,
    timestamp: Date.now(),
  };

  if (idx >= 0) {
    all[idx] = updated;
  } else {
    all.unshift(updated);
  }

  saveAll(all);

  try {
    localStorage.setItem(CURRENT_KEY, session.sessionId);
  } catch {
    // ignore
  }
}

/**
 * Load a session by id.
 * If no id is given, returns the most-recently saved session (or null).
 */
export function loadChat(sessionId?: string): ChatSession | null {
  const all = loadAll();

  if (sessionId) {
    return all.find(s => s.sessionId === sessionId) ?? null;
  }

  // Restore whichever session was last active
  try {
    const currentId = localStorage.getItem(CURRENT_KEY);
    if (currentId) {
      return all.find(s => s.sessionId === currentId) ?? null;
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Return all saved sessions sorted newest-first (for the history sidebar).
 */
export function loadAllChats(): ChatSession[] {
  return loadAll().sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Delete a specific session.
 * If no id is supplied, only the "current" pointer is removed (the session data stays).
 */
export function clearChat(sessionId?: string): void {
  if (!sessionId) {
    try {
      localStorage.removeItem(CURRENT_KEY);
    } catch {
      // ignore
    }
    return;
  }

  const remaining = loadAll().filter(
    s => s.sessionId !== sessionId
  );
  saveAll(remaining);

  // If we just deleted the active session, remove the pointer too
  try {
    const currentId = localStorage.getItem(CURRENT_KEY);
    if (currentId === sessionId) {
      localStorage.removeItem(CURRENT_KEY);
    }
  } catch {
    // ignore
  }
}
