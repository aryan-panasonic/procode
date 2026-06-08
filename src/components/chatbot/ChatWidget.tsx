"use client";

import { useState } from "react";

import ChatWindow from "./ChatWindow";

import styles from "./ChatWidget.module.css";

export default function ChatWidget() {
  const [open, setOpen] =
    useState(false);

  return (
    <>
      {open && (
        <ChatWindow
          onClose={() =>
            setOpen(false)
          }
        />
      )}

      {!open && (
        <button
          className={
            styles.chatButton
          }
          onClick={() =>
            setOpen(true)
          }
        >
          AI Support
        </button>
      )}
    </>
  );
}