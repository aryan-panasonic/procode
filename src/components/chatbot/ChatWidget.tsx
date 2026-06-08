"use client";
import { useState } from "react";
import ChatWindow from "./ChatWindow";
import styles from "./ChatWidget.module.css";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && <ChatWindow onClose={() => setOpen(false)} />}
      <button className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`} onClick={() => setOpen(!open)} aria-label="AI Assistant">
        {!open && <span className={styles.badge}>AI</span>}
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        )}
      </button>
    </>
  );
}
