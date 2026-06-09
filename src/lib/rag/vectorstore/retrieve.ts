import fs from "fs/promises";
import { getEmbeddingProvider } from "../embeddings/EmbeddingFactory";
import { cosineSimilarity } from "./cosineSimilarity";

// Lowered from 0.45 → 0.30.
// 0.45 was too aggressive: paraphrased queries, Japanese queries, and questions
// about topics covered indirectly in docs frequently scored 0.30–0.44 and were
// silently dropped, triggering the (now-fixed) empty-chunks path.
// The LLM can discard low-relevance context; it cannot recover from having none.
const MIN_SIMILARITY_SCORE = 0.30;

export async function retrieve(query: string, topK = 5) {
  const provider = getEmbeddingProvider();
  const queryEmbedding = await provider.embed(query);

  const raw = await fs.readFile("data/vector-index.json", "utf8");
  const chunks = JSON.parse(raw);

  const scored = chunks.map((chunk: any) => ({
    ...chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  scored.sort((a: any, b: any) => b.score - a.score);

  return scored
    .filter((chunk: any) => chunk.score >= MIN_SIMILARITY_SCORE)
    .slice(0, topK);
}
