"use client";

import { useState } from "react";
import ChatWindow from "./ChatWindow";
import styles from "./ChatWidget.module.css";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <ChatWindow />}

      <button
        className={styles.floatingButton}
        onClick={() => setOpen(!open)}
      >
        AI Assistant
      </button>
    </>
  );
}