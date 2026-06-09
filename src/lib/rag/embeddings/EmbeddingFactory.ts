import { OllamaEmbeddingProvider }
from "./OllamaEmbeddingProvider";

import { AzureEmbeddingProvider }
from "./AzureEmbeddingProvider";

export function getEmbeddingProvider() {

  const mode =
    process.env.LLM_PROVIDER ?? "auto";

  if (mode === "azure") {
    return new AzureEmbeddingProvider();
  }

  if (mode === "ollama") {
    return new OllamaEmbeddingProvider();
  }

  const hasAzure =

    process.env.AZURE_OPENAI_API_KEY &&

    process.env.AZURE_OPENAI_ENDPOINT &&

    process.env.AZURE_OPENAI_EMBED_DEPLOYMENT;

  console.log(
    `[AI] Embedding Provider: ${
      hasAzure ? "Azure" : "Ollama"
    }`
  );

  return hasAzure
    ? new AzureEmbeddingProvider()
    : new OllamaEmbeddingProvider();
}