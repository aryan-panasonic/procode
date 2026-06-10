"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./ChatWindow.module.css";
import {
  ChatSession,
  StoredMessage,
  saveChat,
  loadChat,
  loadAllChats,
  clearChat,
  createSession,
  generateTitle,
} from "@/lib/chatStorage";
import {
  redactSensitiveData,
  detectPromptLeakage,
  LEAKAGE_FALLBACK,
} from "@/lib/security/redaction";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_INPUT_CHARS = 500;
const MAX_HISTORY     = 20;   // turns sent to the API

const SUGGESTED = [
  "What is planogram compliance?",
  "How does the API work?",
  "Pricing & plans",
  "Request a demo",
];

const WELCOME: StoredMessage = {
  role: "assistant",
  content:
    "Hi! I'm the INTELLIGENT SHELF ANALYZER support assistant. Ask me about the platform, APIs, pricing, or how to get a demo.",
};

// ─── Markdown renderer ────────────────────────────────────────────────────────
function renderMd(text: string) {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="codeBlock"><div class="codeHeader">${lang || "code"}</div><code>${code}</code></pre>`
    )
    .replace(/`([^`]+)`/g, '<code class="inlineCode">$1</code>')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/• (.*?)(?=\n|$)/g, '<span style="display:flex;gap:5px;margin:2px 0"><span style="color:var(--cyan)">•</span><span>$1</span></span>');
}

// ─── Offline fallback ─────────────────────────────────────────────────────────
const OFFLINE_REPLY =
  "I'm having trouble reaching the support service right now. " +
  "Please try again in a moment, or visit our **documentation** and **contact** pages for immediate help.";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatRelativeTime(timestamp: number): string {
  const diff  = Date.now() - timestamp;
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (mins  <  1)  return "just now";
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ChatWindow({ onClose }: { onClose: () => void }) {

  const [session,       setSession]       = useState<ChatSession>(() => createSession());
  const [messages,      setMessages]      = useState<StoredMessage[]>([WELCOME]);
  const [input,         setInput]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [showHistory,   setShowHistory]   = useState(false);
  const [allSessions,   setAllSessions]   = useState<ChatSession[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Restore last session on mount ─────────────────────────────────────────
  useEffect(() => {
    const saved = loadChat();
    if (saved && saved.messages.length > 0) {
      setSession(saved);
      setMessages([WELCOME, ...saved.messages]);
    }
  }, []);

  // ── Scroll to bottom on new messages ──────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Auto-save whenever messages change (skip the welcome message) ──────────
  useEffect(() => {
    const userMessages = messages.filter(m => m.role !== "assistant" || messages.indexOf(m) > 0);
    const storable     = messages.slice(1); // exclude static welcome msg

    if (storable.length === 0) return;

    const title     = generateTitle(storable);
    const updated   = { ...session, messages: storable, title };
    setSession(updated);
    saveChat(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // ── Load history list when sidebar opens ──────────────────────────────────
  useEffect(() => {
    if (showHistory) {
      setAllSessions(loadAllChats());
    }
  }, [showHistory]);

  // ─── Start a new chat ──────────────────────────────────────────────────────
  function startNewChat() {
    const fresh = createSession();
    setSession(fresh);
    setMessages([WELCOME]);
    setInput("");
    setShowHistory(false);
  }

  // ─── Switch to a past session ──────────────────────────────────────────────
  function openSession(s: ChatSession) {
    setSession(s);
    setMessages([WELCOME, ...s.messages]);
    setShowHistory(false);
  }

  // ─── Delete a session from history ────────────────────────────────────────
  function deleteSession(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    clearChat(id);
    setAllSessions(prev => prev.filter(s => s.sessionId !== id));
    if (session.sessionId === id) startNewChat();
  }

  // ─── Send a message ────────────────────────────────────────────────────────
  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: StoredMessage = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMsg];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const historyToSend = nextMessages
        .filter(m => m.role === "user" || m.role === "assistant")
        .slice(-MAX_HISTORY)
        .map(m => m.role === "user"
          ? { ...m, content: redactSensitiveData(m.content).text }
          : m
        );

      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: historyToSend }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const contentType = res.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        const data = await res.json();
        setMessages([
          ...nextMessages,
          { role: "assistant", content: data.error ?? OFFLINE_REPLY },
        ]);
        return;
      }

      if (!res.body) throw new Error("No response body");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let   full    = "";

      setMessages([...nextMessages, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) { full += decoder.decode(); break; }
        full += decoder.decode(value, { stream: true });
        setMessages([...nextMessages, { role: "assistant", content: full }]);
      }

      // Output safety: detect prompt leakage and redact any secrets that
      // somehow slipped through the LLM. Both are extremely rare given the
      // system prompt rules, but this is the last line of defence.
      const { text: safeOutput } = redactSensitiveData(full);
      const finalOutput = detectPromptLeakage(safeOutput) ? LEAKAGE_FALLBACK : safeOutput;

      setMessages([...nextMessages, { role: "assistant", content: finalOutput }]);

    } catch (error) {
      console.error("[ChatWindow]", error);
      setMessages([...nextMessages, { role: "assistant", content: OFFLINE_REPLY }]);
    } finally {
      setLoading(false);
    }
  }

  const charsLeft = MAX_INPUT_CHARS - input.length;
  const nearLimit = charsLeft <= 50;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.chatWindow}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {/* History toggle */}
          <button
            className={styles.historyBtn}
            onClick={() => setShowHistory(v => !v)}
            title="Chat history"
            aria-label="Toggle chat history"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>

          <div className={styles.avatar}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
          </div>
          <div>
            <div className={styles.agentName}>SUPPORT CHATBOT</div>
            <div className={styles.status}>
              <span className={styles.dot} /> Online · EN / JP
            </div>
          </div>
        </div>

        <div className={styles.headerRight}>
          {/* New chat */}
          <button
            className={styles.newChatBtn}
            onClick={startNewChat}
            title="New conversation"
            aria-label="Start new conversation"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          {/* Close */}
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── History Sidebar ── */}
      {showHistory && (
        <div className={styles.historySidebar}>
          <div className={styles.historyHeader}>
            <span>Recent conversations</span>
            <button className={styles.newChatSideBtn} onClick={startNewChat}>
              + New chat
            </button>
          </div>

          <div className={styles.historyList}>
            {allSessions.length === 0 ? (
              <div className={styles.historyEmpty}>No saved conversations yet.</div>
            ) : (
              allSessions.map(s => (
                <div
                  key={s.sessionId}
                  className={`${styles.historyItem} ${s.sessionId === session.sessionId ? styles.historyItemActive : ""}`}
                  onClick={() => openSession(s)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === "Enter" && openSession(s)}
                >
                  <div className={styles.historyItemTitle}>{s.title}</div>
                  <div className={styles.historyItemMeta}>{formatRelativeTime(s.timestamp)}</div>
                  <button
                    className={styles.historyDeleteBtn}
                    onClick={e => deleteSession(e, s.sessionId)}
                    aria-label="Delete conversation"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Messages ── */}
      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${styles.msgRow} ${msg.role === "user" ? styles.msgUser : ""}`}
          >
            {msg.role === "assistant" && <div className={styles.msgAvatar}>AI</div>}
            <div
              className={`${styles.bubble} ${msg.role === "user" ? styles.bubbleUser : styles.bubbleAi}`}
              dangerouslySetInnerHTML={{ __html: renderMd(msg.content) }}
            />
          </div>
        ))}

        {loading && (
          <div className={styles.msgRow}>
            <div className={styles.msgAvatar}>AI</div>
            <div className={styles.typing}>
              <span /><span /><span />
            </div>
          </div>
        )}

        {messages.length === 1 && !loading && (
          <div className={styles.suggests}>
            <div className={styles.sugLabel}>Suggested questions</div>
            {SUGGESTED.map(s => (
              <button key={s} className={styles.sugBtn} onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input row ── */}
      <div className={styles.inputRow}>
        <input
          className={styles.input}
          value={input}
          maxLength={MAX_INPUT_CHARS}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
          placeholder="Ask a question…"
          aria-label="Chat message input"
        />
        <button
          className={styles.sendBtn}
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          aria-label="Send message"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>

      {nearLimit && (
        <div
          className={styles.charCount}
          style={{ color: charsLeft <= 10 ? "var(--red, #f55)" : "var(--text-muted, #888)" }}
        >
          {charsLeft} characters remaining
        </div>
      )}

      <div className={styles.footer}>Answers sourced from documentation</div>
    </div>
  );
}
