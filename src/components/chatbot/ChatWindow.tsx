"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
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
import { evaluate, pageTypeFromPath } from "@/lib/intelligence/triggerEngine";

type FeedbackMap = Record<number, "up" | "down">;

interface AttachedFile {
  file: File;
  id: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

interface TicketFormState {
  name:  string;
  email: string;
  phone: string;
}

interface TicketConfirmation {
  id:    string;
  title: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_INPUT_CHARS = 500;
const MAX_HISTORY     = 20;   // turns sent to the API

const DEFAULT_SUGGESTED = [
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
export default function ChatWindow({ onClose, inline }: { onClose: () => void; inline?: boolean }) {
  const pathname = usePathname() || "";
  
  let currentSuggested = DEFAULT_SUGGESTED;
  if (pathname.includes("/pricing")) {
    currentSuggested = [
      "How much does it cost?",
      "Can I get a custom quote?",
      "What is included in the enterprise plan?",
      "Is there a free trial?"
    ];
  } else if (pathname.includes("/documentation") || pathname.includes("/docs")) {
    currentSuggested = [
      "How to authenticate API?",
      "Where are the OCR endpoints?",
      "Code examples for Python",
      "Rate limits"
    ];
  } else if (pathname.includes("/platform")) {
    currentSuggested = [
      "How does planogram compliance work?",
      "What is OCR price extraction?",
      "Integration capabilities",
      "Accuracy metrics"
    ];
  } else if (pathname.includes("/case-studies") || pathname.includes("/solutions") || pathname.includes("/industries")) {
    currentSuggested = [
      "Show me supermarket examples",
      "How do convenience stores use this?",
      "What is the average ROI?",
      "FMCG brand use cases"
    ];
  }

  const [session,       setSession]       = useState<ChatSession>(() => createSession());
  const [messages,      setMessages]      = useState<StoredMessage[]>([WELCOME]);
  const [input,         setInput]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [showHistory,   setShowHistory]   = useState(false);
  const [allSessions,   setAllSessions]   = useState<ChatSession[]>([]);
  const [feedbackMap,   setFeedbackMap]   = useState<FeedbackMap>({});
  const [showEscalate,  setShowEscalate]  = useState(false);
  const [supportSuggestion, setSupportSuggestion] =
  useState(false);

const [escalationInfo, setEscalationInfo] =
  useState<{
    score: number;
    reasons: string[];
  } | null>(null);
  const [ticketForm,    setTicketForm]    = useState<TicketFormState>({ name: "", email: "", phone: "" });
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketDone,    setTicketDone]    = useState<TicketConfirmation | null>(null);
  const [attachments,   setAttachments]   = useState<AttachedFile[]>([]);
  const [triggerMsg,    setTriggerMsg]    = useState<string | null>(null);
  const [triggerDismissed, setTriggerDismissed] = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mountTimeRef = useRef<number>(Date.now());
  const scrollDepthRef = useRef<number>(0);

  // ── Track scroll depth ───────────────────────────────────────────────────────
  useEffect(() => {
    function onScroll() {
      const depth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight || 1)) * 100);
      scrollDepthRef.current = Math.min(100, Math.max(0, depth || 0));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Proactive trigger (unconditional, zero LLM) ─────────────────────────────────
  useEffect(() => {
    // Only check after 30s minimum dwell; don't show if user already chatted
    const timer = setTimeout(() => {
      if (triggerDismissed || messages.length > 1) return;

      const allSess  = loadAllChats();
      const pathname = window.location.pathname;
      const pageType = pageTypeFromPath(pathname);

      // Derive path history from saved sessions' first message content
      const pathHistory = allSess
        .slice(0, 5)
        .map(s => s.messages.find(m => m.role === 'user'))
        .filter(Boolean)
        .map(() => 'platform'); // coarse; replace with stored pageType when available

      const previousHadPricing = allSess.some(s =>
        s.messages.some(m => /pricing|plan|cost|quote/i.test(m.content))
      );

      const ctx = {
        path: pathname,
        pageType,
        dwellMs: Date.now() - mountTimeRef.current,
        scrollDepth: scrollDepthRef.current,
        pathHistory: [...pathHistory, pageType],
        returningVisitor: allSess.length > 0,
        previousSessionHadPricingQuestion: previousHadPricing,
      };

      const result = evaluate(ctx);
      if (result.shouldTrigger && result.message) {
        setTriggerMsg(result.message);
      }
    }, 30_000);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerDismissed]);

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
    setFeedbackMap({});
    setShowEscalate(false);
    setTicketDone(null);
    setAttachments([]);
  }

  // ─── Switch to a past session ──────────────────────────────────────────────
  function openSession(s: ChatSession) {
    setSession(s);
    setMessages([WELCOME, ...s.messages]);
    setShowHistory(false);
    setFeedbackMap({});
    setShowEscalate(false);
    setTicketDone(null);
    setAttachments([]);
  }

  // ─── Submit feedback for a specific assistant message ─────────────────────
  async function sendFeedback(
    msgIndex:  number,
    rating:    "up" | "down",
    question:  string,
    answer:    string
  ) {
    if (feedbackMap[msgIndex]) return; // already rated
    setFeedbackMap(prev => ({ ...prev, [msgIndex]: rating }));
    try {
      await fetch("/api/feedback", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          sessionId: session.sessionId,
          rating,
          question:  question.slice(0, 2000),
          answer:    answer.slice(0, 4000),
        }),
      });
    } catch {
      // Feedback is best-effort — don't surface errors
    }
  }

  // ─── Dismiss escalation ──────────────────────────────────────────────────────
  async function dismissEscalation() {
    setShowEscalate(false);
    try {
      await fetch("/api/chat/escalation/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.sessionId }),
      });
    } catch {
      // Best-effort
    }
  }

  // ─── Submit support ticket ─────────────────────────────────────────────────
  async function submitTicket() {
    setTicketLoading(true);
    try {
      const chatMessages = messages
        .filter(m => m.role === "user" || m.role === "assistant")
        .slice(1)
        .map(m => ({ role: m.role, content: m.content }));

      const draftRes  = await fetch("/api/tickets/draft", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: chatMessages, sessionId: session.sessionId }),
      });
      const draftData = await draftRes.json();
      if (draftData.error) throw new Error(draftData.error);

      const createRes  = await fetch("/api/tickets", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          title:                draftData.draft.title,
          summary:              draftData.draft.summary,
          category:             draftData.draft.category,
          priority:             draftData.draft.priority,
          customer_name:        ticketForm.name  || undefined,
          customer_email:       ticketForm.email || undefined,
          customer_phone:       ticketForm.phone || undefined,
          session_id:           session.sessionId,
          conversation_summary: draftData.conversationSummary,
        }),
      });
      const createData = await createRes.json();
      if (createData.error) throw new Error(createData.error);
      setTicketDone({ id: createData.ticket.id, title: createData.ticket.title });
      dismissEscalation();
    } catch (e: any) {
      alert("Failed to create ticket: " + e.message);
    } finally {
      setTicketLoading(false);
    }
  }

  // ─── Delete a session from history ────────────────────────────────────────
  function deleteSession(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    clearChat(id);
    setAllSessions(prev => prev.filter(s => s.sessionId !== id));
    if (session.sessionId === id) startNewChat();
  }

  // ─── Handle file selection ─────────────────────────────────────────────────
  function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    const newItems: AttachedFile[] = arr.map(f => ({
      file: f,
      id:   Math.random().toString(36).slice(2),
      status: "pending",
    }));
    setAttachments(prev => [...prev, ...newItems].slice(-5));
  }

  function removeAttachment(id: string) {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }

  async function uploadAttachments(sessionId: string): Promise<void> {
    const pending = attachments.filter(a => a.status === "pending");
    if (pending.length === 0) return;

    setAttachments(prev =>
      prev.map(a => a.status === "pending" ? { ...a, status: "uploading" } : a)
    );

    const formData = new FormData();
    formData.append("sessionId", sessionId);
    pending.forEach(a => formData.append("files", a.file));

    try {
      const res = await fetch("/api/chat/upload", { method: "POST", body: formData });
      const data = await res.json();
      const resultMap = new Map<string, any>(
        (data.results ?? []).map((r: any) => [r.filename, r])
      );

      setAttachments(prev =>
        prev.map(a => {
          if (a.status !== "uploading") return a;
          const r = resultMap.get(a.file.name);
          if (!r) return { ...a, status: "error" as const, error: "Not processed" };
          return r.error
            ? { ...a, status: "error" as const, error: r.error }
            : { ...a, status: "done" as const };
        })
      );
    } catch {
      setAttachments(prev =>
        prev.map(a => a.status === "uploading" ? { ...a, status: "error" as const, error: "Upload failed" } : a)
      );
    }
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
      await uploadAttachments(session.sessionId);
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
        body:    JSON.stringify({
          messages: historyToSend,
          sessionId: session.sessionId,
          pageContext: {
            path:            window.location.pathname,
            pageType:        pageTypeFromPath(window.location.pathname),
            dwellMs:         Date.now() - mountTimeRef.current,
            scrollDepth:     scrollDepthRef.current,
            pathHistory:     [],
            returningVisitor: loadAllChats().length > 1,
            previousSessionHadPricingQuestion: false,
          },
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const isEscalationTriggered = res.headers.get("X-Escalate") === "1";

      const escalationScore =
        Number(
          res.headers.get(
            "X-Escalation-Score"
          ) ?? "0"
        );

      const escalationReasons =
        decodeURIComponent(
          res.headers.get(
            "X-Escalation-Reasons"
          ) ?? ""
        )
        .split(",")
        .filter(Boolean);
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
      setEscalationInfo({
        score: escalationScore,
        reasons: escalationReasons,
      });

      if (isEscalationTriggered) {
        setShowEscalate(true);
      }

    } catch (error) {
      console.error("[ChatWindow]", error);
      setMessages([...nextMessages, { role: "assistant", content: OFFLINE_REPLY }]);
    } finally {
      setLoading(false);
    }
  }

  const charsLeft = MAX_INPUT_CHARS - input.length;
  const nearLimit = charsLeft <= 50;
  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", padding: "7px 10px",
    borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)",
    background: "#1f2937", color: "#f3f4f6", fontSize: 12,
    outline: "none",
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={`${styles.chatWindow}${inline ? " "+styles.inlineMode : ""}`}>

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
      <div
        className={styles.messages}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
      >
        {messages.map((msg, i) => {
          // Find the preceding user message to pass as "question" to feedback
          const prevUserMsg = i > 0
            ? [...messages].slice(0, i).reverse().find(m => m.role === "user")?.content ?? ""
            : "";

          // Show feedback only on non-welcome assistant messages that are fully loaded
          const showFeedback =
            msg.role === "assistant" &&
            i > 0 &&
            msg.content.length > 0 &&
            !loading;

          return (
            <div
              key={i}
              className={`${styles.msgRow} ${msg.role === "user" ? styles.msgUser : ""}`}
            >
              {msg.role === "assistant" && <div className={styles.msgAvatar}>AI</div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className={`${styles.bubble} ${msg.role === "user" ? styles.bubbleUser : styles.bubbleAi}`}
                  dangerouslySetInnerHTML={{ __html: renderMd(msg.content) }}
                />
                {showFeedback && (
                  <div className={styles.feedbackRow}>
                    <span className={styles.feedbackLabel}>Was this helpful?</span>
                    <button
                      className={`${styles.feedbackBtn} ${feedbackMap[i] === "up" ? styles.feedbackActive : ""}`}
                      onClick={() => sendFeedback(i, "up", prevUserMsg, msg.content)}
                      disabled={!!feedbackMap[i]}
                      title="Helpful"
                      aria-label="Mark as helpful"
                    >
                      👍
                    </button>
                    <button
                      className={`${styles.feedbackBtn} ${feedbackMap[i] === "down" ? styles.feedbackActive : ""}`}
                      onClick={() => sendFeedback(i, "down", prevUserMsg, msg.content)}
                      disabled={!!feedbackMap[i]}
                      title="Not helpful"
                      aria-label="Mark as not helpful"
                    >
                      👎
                    </button>
                    {feedbackMap[i] && (
                      <span className={styles.feedbackThanks}>Thanks!</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

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
            {currentSuggested.map(s => (
              <button key={s} className={styles.sugBtn} onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Proactive Trigger Banner (zero LLM, template only) ── */}
      {triggerMsg && !triggerDismissed && messages.length === 1 && (
        <div style={{
          margin: "0 12px 8px", padding: "10px 14px", borderRadius: 8,
          background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(99,102,241,0.10))",
          border: "1px solid rgba(99,102,241,0.3)",
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>💬</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: "#c7d2fe", lineHeight: 1.5 }}>{triggerMsg}</div>
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <button
                onClick={() => { send(triggerMsg); setTriggerDismissed(true); }}
                style={{ fontSize: 11, padding: "4px 10px", borderRadius: 4, border: "none",
                  background: "#4f46e5", color: "#fff", cursor: "pointer" }}
              >
                Yes, tell me more
              </button>
              <button
                onClick={() => setTriggerDismissed(true)}
                style={{ fontSize: 11, padding: "4px 10px", borderRadius: 4,
                  border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
                  color: "#6b7280", cursor: "pointer" }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ── Escalation Panel ── */}
      {showEscalate && !ticketDone && (
        <div style={{
          margin: "0 12px 10px", padding: "14px 16px", borderRadius: 8,
          background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.25)",
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#93c5fd" }}>
            🎫 Create a support ticket?
          </div>
          <input
            style={inputStyle}
            placeholder="Your name (optional)"
            value={ticketForm.name}
            onChange={e => setTicketForm(p => ({ ...p, name: e.target.value }))}
          />
          <input
            style={{ ...inputStyle, marginTop: 6 }}
            placeholder="Email (optional)"
            type="email"
            value={ticketForm.email}
            onChange={e => setTicketForm(p => ({ ...p, email: e.target.value }))}
          />
          <input
            style={{ ...inputStyle, marginTop: 6 }}
            placeholder="Phone (optional)"
            value={ticketForm.phone}
            onChange={e => setTicketForm(p => ({ ...p, phone: e.target.value }))}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button
              onClick={submitTicket}
              disabled={ticketLoading}
              style={{ flex: 1, padding: "8px 0", borderRadius: 6, border: "none",
                background: "#1d4ed8", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              {ticketLoading ? "Creating…" : "Submit Ticket"}
            </button>
            <button
              onClick={dismissEscalation}
              style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent", color: "#9ca3af", fontSize: 12, cursor: "pointer" }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── Ticket Confirmation ── */}
      {ticketDone && (
        <div style={{
          margin: "0 12px 10px", padding: "12px 16px", borderRadius: 8,
          background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)",
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#86efac" }}>
            ✅ Ticket created
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{ticketDone.title}</div>
        </div>
      )}

      {/* ── Attachments ── */}
      {attachments.length > 0 && (
        <div className={styles.attachmentList}>
          {attachments.map(a => (
            <div key={a.id} className={`${styles.attachChip} ${a.status === "error" ? styles.attachChipError : a.status === "done" ? styles.attachChipDone : ""}`}>
              <span className={styles.attachIcon}>
                {a.status === "uploading" ? "⏳" : a.status === "done" ? "✓" : a.status === "error" ? "✗" : "📎"}
              </span>
              <span className={styles.attachName} title={a.error ?? a.file.name}>
                {a.file.name}
              </span>
              {a.status !== "uploading" && (
                <button className={styles.attachRemove} onClick={() => removeAttachment(a.id)} aria-label="Remove file">×</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Input row ── */}
      <div className={styles.inputRow}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.md,.pdf,.docx,.png,.jpg,.jpeg"
          style={{ display: "none" }}
          onChange={e => { if (e.target.files) handleFiles(e.target.files); e.target.value = ""; }}
        />
        <button
          className={styles.attachBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          title="Attach files"
          aria-label="Attach files"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>
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
