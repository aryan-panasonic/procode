import OpenAI from "openai";
import { LLMProvider } from "./LLMProvider";

export class AzureProvider
  implements LLMProvider
{
  private client: OpenAI;

  constructor() {

  this.client = new OpenAI({

    apiKey:
      process.env.AZURE_OPENAI_API_KEY,

    baseURL:
      process.env.AZURE_OPENAI_ENDPOINT
  });
}

  async chat(messages: any[]) {
    const response =
      await this.client.chat.completions.create({
        model:
          process.env
            .AZURE_OPENAI_CHAT_DEPLOYMENT!,
        messages
      });

    return (
      response.choices[0].message.content ??
      ""
    );
  }

  async *chatStream(messages: any[]): AsyncGenerator<string, void, unknown> {
    const stream =
      await this.client.chat.completions.create({
        model:
          process.env
            .AZURE_OPENAI_CHAT_DEPLOYMENT!,
        messages,
        stream: true
      });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  async embed(
    text: string
  ): Promise<number[]> {

    const response =
      await this.client.embeddings.create({

        model:
          process.env
            .AZURE_OPENAI_EMBED_DEPLOYMENT!,

        input: text
      });

    return response.data[0].embedding;
  }
}