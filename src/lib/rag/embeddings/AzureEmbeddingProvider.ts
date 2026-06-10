import OpenAI from "openai";

import { EmbeddingProvider }
from "./EmbeddingProvider";

export class AzureEmbeddingProvider
implements EmbeddingProvider {

  private client: OpenAI;

  constructor() {

    this.client = new OpenAI({

      apiKey:
        process.env.AZURE_OPENAI_API_KEY,

      baseURL:
        process.env.AZURE_OPENAI_ENDPOINT,

      defaultHeaders: {
        "api-key":
          process.env.AZURE_OPENAI_API_KEY!
      }
    });
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