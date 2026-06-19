import OpenAI from "openai";
import { LLMProvider, ChatOptions } from "./LLMProvider";
import { AIError } from "../errors/AIError";

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

  async chat(messages: any[], options?: ChatOptions) {
    const response =
      await this.client.chat.completions.create({
        model:
          process.env
            .AZURE_OPENAI_CHAT_DEPLOYMENT!,
        messages,
        ...(options?.responseFormat === "json_object" ? { response_format: { type: "json_object" } } : {}),
        ...(options?.maxTokens ? { max_completion_tokens: options.maxTokens } : {}),
      });

    return (
      response.choices[0].message.content ??
      ""
    );
  }

  async *chatStream(
    messages: any[],
    options?: ChatOptions
  ): AsyncGenerator<string> {

    try {

      const stream =
        await this.client.chat.completions.create({
          model:
            process.env
              .AZURE_OPENAI_CHAT_DEPLOYMENT!,
          messages,
          stream: true,
          ...(options?.responseFormat === "json_object" ? { response_format: { type: "json_object" } } : {}),
          ...(options?.maxTokens ? { max_completion_tokens: options.maxTokens } : {}),
        });

      for await (const chunk of stream) {

        const content =
          chunk.choices?.[0]
            ?.delta?.content;

        if (content) {
          yield content;
        }
      }

    } catch (error: any) {

      console.error(
        "[AzureProvider]",
        error
      );

      if (
        error?.code ===
        "content_filter"
      ) {

        throw new AIError(
          "CONTENT_FILTER",
          "Request blocked by Azure safety policies"
        );
      }

      throw new AIError(
        "AZURE_ERROR",
        "Azure provider failure"
      );
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