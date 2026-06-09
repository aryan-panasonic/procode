import { AzureProvider }
from "./AzureProvider";

import { OllamaProvider }
from "./OllamaProvider";

export function getProvider() {

  const mode =
    process.env.LLM_PROVIDER ?? "auto";

  if (mode === "azure") {
    return new AzureProvider();
  }

  if (mode === "ollama") {
    return new OllamaProvider();
  }

  const hasAzure =

    process.env.AZURE_OPENAI_API_KEY &&

    process.env.AZURE_OPENAI_ENDPOINT &&

    process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;

  console.log(
    `[AI] Chat Provider: ${
      hasAzure ? "Azure" : "Ollama"
    }`
  );

  return hasAzure
    ? new AzureProvider()
    : new OllamaProvider();
}