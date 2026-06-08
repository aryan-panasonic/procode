"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./ChatWindow.module.css";

interface Message { role: "user" | "assistant"; content: string; }

const SUGGESTED = [
  "What is planogram compliance?",
  "How does the API work?",
  "Pricing & plans",
  "Request a demo",
];

const QUICK: Record<string, string> = {
  planogram: "**Planogram compliance** is the measurement of how closely actual shelf arrangements match your planned layout (planogram).\n\nINTELLIGENT SHELF ANALYZER automates this by comparing shelf images against master planograms using computer vision — detecting deviations, misplaced products, and missing facings in real time.",
  api: "INTELLIGENT SHELF ANALYZER offers a **RESTful API** with endpoints for:\n• Shelf image submission\n• Compliance reports\n• Price intelligence\n• SKU catalog management\n\nSDKs available in Python, Node.js, and Java. See /documentation for full API reference.",
  pricing: "INTELLIGENT SHELF ANALYZER offers three plans — all require speaking to sales for pricing:\n\n• **Starter** — up to 50 stores\n• **Professional** — up to 500 stores\n• **Enterprise** — unlimited, fully custom\n\nAll plans include a free 30-day trial. Visit /pricing for details.",
  demo: "To request a demo:\n1. Click **Request Demo** at the top of any page\n2. Fill in your company details\n3. A solutions engineer will contact you within 1 business day\n\nWe tailor every demo to your specific retail format and use case.",
};

function getReply(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("planogram") || t.includes("compliance")) return QUICK.planogram;
  if (t.includes("api") || t.includes("integration") || t.includes("sdk")) return QUICK.api;
  if (t.includes("pric") || t.includes("plan") || t.includes("cost")) return QUICK.pricing;
  if (t.includes("demo") || t.includes("trial") || t.includes("try")) return QUICK.demo;
  return "Thanks for your question! Our AI assistant can help with product features, API details, pricing, and demo requests.\n\nFor complex or company-specific questions, I'd recommend reaching out to our sales team via /contact — they typically respond within one business day.";
}

function renderMd(text: string) {
  // Escape HTML tags to prevent XSS and formatting breaks
  let escaped = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return escaped
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="codeBlock"><div class="codeHeader">${lang || 'code'}</div><code>${code}</code></pre>`
    )
    .replace(/`([^`]+)`/g, '<code class="inlineCode">$1</code>')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/• (.*?)(?=\n|$)/g, '<span style="display:flex;gap:5px;margin:2px 0"><span style="color:var(--cyan)">•</span><span>$1</span></span>');
}

export default function ChatWindow({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm an AI assistant. Ask me about our platform, APIs, pricing, or how to get a demo." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;

    // Add user message
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let full = "";
        let isFirstChunk = true;

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            full += decoder.decode();
            setMessages([...newMessages, { role: "assistant", content: full }]);
            break;
          }

          if (isFirstChunk) {
            setLoading(false);
            isFirstChunk = false;
          }

          full += decoder.decode(value, { stream: true });
          setMessages([...newMessages, { role: "assistant", content: full }]);
        }
      } else {
        await new Promise(r => setTimeout(r, 700 + Math.random() * 500));
        setLoading(false);
        setMessages([...newMessages, { role: "assistant", content: getReply(text) }]);
      }
    } catch {
      await new Promise(r => setTimeout(r, 700));
      setLoading(false);
      setMessages([...newMessages, { role: "assistant", content: getReply(text) }]);
    }
  }

  return (
    <div className={styles.chatWindow}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.avatar}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></svg>
          </div>
          <div>
            <div className={styles.agentName}>SUPPORT CHATBOT</div>
            <div className={styles.status}><span className={styles.dot} /> Online · EN / JP</div>
          </div>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>

      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <div key={i} className={`${styles.msgRow} ${msg.role === "user" ? styles.msgUser : ""}`}>
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
            <div className={styles.typing}><span /><span /><span /></div>
          </div>
        )}
        {messages.length === 1 && !loading && (
          <div className={styles.suggests}>
            <div className={styles.sugLabel}>Suggested questions</div>
            {SUGGESTED.map(s => (
              <button key={s} className={styles.sugBtn} onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className={styles.inputRow}>
        <input
          className={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
          placeholder="Ask a question..."
        />
        <button className={styles.sendBtn} onClick={() => send(input)} disabled={!input.trim() || loading}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
        </button>
      </div>
      <div className={styles.footer}>Answers from documentation</div>
    </div>
  );
}
