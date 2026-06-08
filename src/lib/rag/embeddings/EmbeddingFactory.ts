import { OllamaEmbeddingProvider }
from "./OllamaEmbeddingProvider";

export function getEmbeddingProvider() {

  return new OllamaEmbeddingProvider();

}