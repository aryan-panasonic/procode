import { ChatMessage } from "../types/ChatMessage";

export interface LLMProvider {
  chat(
    messages: ChatMessage[]
  ): Promise<string>;

  chatStream(
    messages: ChatMessage[]
  ): AsyncIterable<string>;

  embed(
    text: string
  ): Promise<number[]>;
}