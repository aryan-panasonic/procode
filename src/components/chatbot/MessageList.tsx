import MessageBubble from "./MessageBubble";

import { Message } from "./types";

export default function MessageList({
  messages
}: {
  messages: Message[];
}) {
  return (
    <>
      {messages.map(
        (message, index) => (
          <MessageBubble
            key={index}
            message={message}
          />
        )
      )}
    </>
  );
}