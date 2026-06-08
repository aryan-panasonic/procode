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

  async embed(text: string) {
    return [];
  }
}