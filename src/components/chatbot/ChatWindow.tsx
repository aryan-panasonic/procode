"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./ChatWindow.module.css";

interface Message { role: "user" | "assistant"; content: string; }

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_INPUT_CHARS  = 500;   // enforce a reasonable per-message limit
const MAX_HISTORY      = 20;    // turns sent to the API (belt-and-suspenders; route also limits)

const SUGGESTED = [
  "What is planogram compliance?",
  "How does the API work?",
  "Pricing & plans",
  "Request a demo",
];

// ─── Markdown renderer ────────────────────────────────────────────────────────
// Only basic markdown is supported — no HTML pass-through.
function renderMd(text: string) {
  // Escape HTML first to prevent XSS regardless of what the LLM returns
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
// Used only when the API call fails (network error / server down).
// Intentionally generic — no hardcoded business data that could become stale
// or be confused with authoritative AI responses.
const OFFLINE_REPLY =
  "I'm having trouble reaching the support service right now. " +
  "Please try again in a moment, or visit our **documentation** and **contact** pages for immediate help.";

// ─── Component ────────────────────────────────────────────────────────────────
export default function ChatWindow({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm the INTELLIGENT SHELF ANALYZER support assistant. Ask me about the platform, APIs, pricing, or how to get a demo.",
    },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message   = { role: "user", content: trimmed };
    const nextMessages       = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      // Send only the most recent turns — reduces payload and context noise
      const historyToSend = nextMessages.slice(-MAX_HISTORY);

      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: historyToSend }),
      });

      if (res.ok && res.body) {
        const reader  = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let full        = "";
        let firstChunk  = true;

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            full += decoder.decode();
            setMessages([...nextMessages, { role: "assistant", content: full }]);
            break;
          }

          if (firstChunk) {
            setLoading(false);
            firstChunk = false;
          }

          full += decoder.decode(value, { stream: true });
          setMessages([...nextMessages, { role: "assistant", content: full }]);
        }
      } else {
        // Server returned an error status
        setLoading(false);
        setMessages([...nextMessages, { role: "assistant", content: OFFLINE_REPLY }]);
      }
    } catch {
      // Network failure
      setLoading(false);
      setMessages([...nextMessages, { role: "assistant", content: OFFLINE_REPLY }]);
    }
  }

  const charsLeft     = MAX_INPUT_CHARS - input.length;
  const nearLimit     = charsLeft <= 50;

  return (
    <div className={styles.chatWindow}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
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
        <button className={styles.closeBtn} onClick={onClose}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ── Messages ── */}
      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${styles.msgRow} ${msg.role === "user" ? styles.msgUser : ""}`}
          >
            {msg.role === "assistant" && <div className={styles.msgAvatar}>AI</div>}
            <div
              className={`${styles.bubble} ${
                msg.role === "user" ? styles.bubbleUser : styles.bubbleAi
              }`}
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
            {SUGGESTED.map((s) => (
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
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
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

      {/* Character counter — visible only when approaching the limit */}
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
