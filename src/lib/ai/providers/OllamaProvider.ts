import ollama from "ollama";
import { LLMProvider } from "./LLMProvider";

export class OllamaProvider implements LLMProvider {
  async chat(messages: any[]) {
    const response = await ollama.chat({
      model: process.env.OLLAMA_MODEL!,
      messages
    });

    return response.message.content;
  }

  async *chatStream(messages: any[]): AsyncGenerator<string, void, unknown> {
    const stream = await ollama.chat({
      model: process.env.OLLAMA_MODEL!,
      messages,
      stream: true
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