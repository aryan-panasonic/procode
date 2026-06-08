"use client";

import { useState, useRef, useEffect } from "react";

import { v4 as uuid } from "uuid";

import styles from "./ChatWindow.module.css";

import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";

import { Message } from "./types";

interface Props {
  onClose: () => void;
}

export default function ChatWindow({
  onClose
}: Props) {
  const [messages, setMessages] =
    useState<Message[]>([
      {
        id: uuid(),
        role: "assistant",
        content:
          `Welcome to Retail AI Support.

I can help with:

- API usage
- Documentation
- Platform setup
- Product questions`
      }
    ]);

  const [loading, setLoading] =
    useState(false);

  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);

  async function sendMessage(
    text: string
  ) {
    if (!text.trim() || loading)
      return;

    const userMessage: Message = {
      id: uuid(),
      role: "user",
      content: text
    };

    const assistantId = uuid();

    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      streaming: true
    };

    const updatedMessages: Message[] = [
      ...messages,
      userMessage,
      assistantMessage
    ];

    setMessages(updatedMessages);

    setLoading(true);

    try {
      const response =
        await fetch("/api/chat", {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            messages: [
              ...messages,
              userMessage
            ]
          })
        });

      const reader =
        response.body?.getReader();

      if (!reader)
        throw new Error(
          "No stream"
        );

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

        setMessages(prev =>
          prev.map(message =>
            message.id === assistantId
              ? {
                  ...message,
                  content:
                    assistantText,
                  streaming: true
                }
              : message
          )
        );
      }

      setMessages(prev =>
        prev.map(message =>
          message.id === assistantId
            ? {
                ...message,
                content:
                  assistantText,
                streaming: false
              }
            : message
        )
      );
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  }

  return (
    <div className={styles.window}>
      <div className={styles.header}>
        <div>
          <h3>AI Support</h3>

          <span>
            Ask about APIs,
            setup and docs
          </span>
        </div>

        <button
          onClick={onClose}
          className={styles.close}
        >
          ✕
        </button>
      </div>

      <main className={styles.messages}>
        <MessageList
          messages={messages}
        />

        {loading && (
          <TypingIndicator />
        )}

        <div
          ref={messagesEndRef}
        />
      </main>

      <ChatInput
        onSend={sendMessage}
        disabled={loading}
      />
    </div>
  );
}