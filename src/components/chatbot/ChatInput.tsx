"use client";

import { useState } from "react";

import styles from "./ChatInput.module.css";

interface Props {
  onSend: (
    message: string
  ) => void;

  disabled: boolean;
}

export default function ChatInput({
  onSend,
  disabled
}: Props) {
  const [input, setInput] =
    useState("");

  function submit() {
    if (!input.trim()) return;

    onSend(input);

    setInput("");
  }

  return (
    <div className={styles.container}>
      <textarea
        rows={1}
        value={input}
        disabled={disabled}
        placeholder="Ask a question..."
        onChange={(e) =>
          setInput(e.target.value)
        }
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            !e.shiftKey
          ) {
            e.preventDefault();
            submit();
          }
        }}
      />

      <button onClick={submit}>
        ➤
      </button>
    </div>
  );
}   