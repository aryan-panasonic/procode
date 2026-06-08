import styles from "./MessageBubble.module.css";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Message } from "./types";

export default function MessageBubble({
  message
}: {
  message: Message;
}) {
  const user =
    message.role === "user";

  return (
    <div
      className={
        user
          ? styles.userWrapper
          : styles.assistantWrapper
      }
    >
      <div
        className={
          user
            ? styles.userBubble
            : styles.assistantBubble
        }
      >
        {message.streaming ? (
          <pre>
            {message.content}
          </pre>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}