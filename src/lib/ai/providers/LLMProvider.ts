import { ChatMessage } from "../types/ChatMessage";

export interface LLMProvider {
  chat(
    messages: ChatMessage[]
  ): Promise<string>;

  embed(
    text: string
  ): Promise<number[]>;
}