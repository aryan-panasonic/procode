import ollama from "ollama";

import { EmbeddingProvider }
from "./EmbeddingProvider";

export class OllamaEmbeddingProvider
implements EmbeddingProvider {

  async embed(
    text: string
  ): Promise<number[]> {

    const response =
      await ollama.embed({
        model:
          process.env
            .OLLAMA_EMBED_MODEL ||
          "nomic-embed-text",

        input: text
      });

    return response.embeddings[0];
  }
}