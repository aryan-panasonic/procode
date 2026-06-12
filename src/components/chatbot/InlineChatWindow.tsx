"use client";
import ChatWindow from "./ChatWindow";
import styles from "./InlineChatWindow.module.css";

export default function InlineChatWindow() {
  return (
    <div className={styles.wrap}>
      <ChatWindow onClose={() => {}} inline />
    </div>
  );
}
