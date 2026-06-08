"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./ChatWindow.module.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: "user" as const,
      content: input
    };

    const currentMessages = [
      ...messages,
      userMessage
    ];

    setMessages(currentMessages);

    setInput("");

    setLoading(true);

    const assistantIndex =
      currentMessages.length;

    setMessages([
      ...currentMessages,
      {
        role: "assistant",
        content: ""
      }
    ]);

    try {
      const response = await fetch(
        "/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            messages: currentMessages
          })
        }
      );

      if (!response.body) {
        throw new Error(
          "No response body"
        );
      }

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder();

      let assistantText = "";

      while (true) {
        const {
          done,
          value
        } = await reader.read();

        if (done) break;

        assistantText +=
          decoder.decode(value);

        setMessages(prev => {
          const copy = [...prev];

          copy[assistantIndex] = {
            role: "assistant",
            content: assistantText
          };

          return copy;
        });
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  }

  return (
    <div className={styles.chatWindow}>
      <div className={styles.header}>
        AI Assistant
      </div>

      <div className={styles.messages}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={
              message.role === "user"
                ? styles.userMessage
                : styles.assistantMessage
            }
          >
            {message.content}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <input
          type="text"
          value={input}
          placeholder="Ask a question..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          className={styles.input}
        />

        <button
          onClick={sendMessage}
          className={styles.sendButton}
        >
          Send
        </button>
      </div>
    </div>
  );
}