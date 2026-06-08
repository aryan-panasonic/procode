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
        `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_CHAT_DEPLOYMENT}`
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

  async embed(text: string) {
    return [];
  }
}