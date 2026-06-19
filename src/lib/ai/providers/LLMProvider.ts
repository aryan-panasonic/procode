import { ChatMessage } from "../types/ChatMessage";

export interface ChatOptions {
  responseFormat?: "json_object" | "text";
  maxTokens?: number;
}

export interface LLMProvider {
  chat(
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<string>;

  chatStream(
    messages: ChatMessage[],
    options?: ChatOptions
  ): AsyncIterable<string>;

  embed(
    text: string
  ): Promise<number[]>;
}