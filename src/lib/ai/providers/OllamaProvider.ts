import ollama from "ollama";
import { LLMProvider, ChatOptions } from "./LLMProvider";

export class OllamaProvider implements LLMProvider {
  async chat(messages: any[], options?: ChatOptions) {
    const response = await ollama.chat({
      model: process.env.OLLAMA_MODEL!,
      messages,
      ...(options?.responseFormat === "json_object" ? { format: "json" } : {}),
    });

    return response.message.content;
  }

  async *chatStream(messages: any[], options?: ChatOptions): AsyncGenerator<string, void, unknown> {
    const stream = await ollama.chat({
      model: process.env.OLLAMA_MODEL!,
      messages,
      stream: true,
      ...(options?.responseFormat === "json_object" ? { format: "json" } : {}),
    });

    for await (const chunk of stream) {
      if (chunk.message?.content) {
        yield chunk.message.content;
      }
    }
  }

  async embed(text: string) {
    return [];
  }
}