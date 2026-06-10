import { getEmbeddingProvider } from "../embeddings/EmbeddingFactory";
import { PgVectorStore, RetrievedChunk } from "../storage/PgVectorStore";
import { RetrievalResult } from "../types/RetrievalResult";

export class PgVectorRetriever {
  private store = new PgVectorStore();

  async retrieve(
    query: string,
    topK: number = 15
  ): Promise<RetrievalResult> {

    const provider =
      getEmbeddingProvider();

    const embedding =
      await provider.embed(query);

    const results =
      await this.store.search(
        embedding,
        topK
      );

    const MIN_SIMILARITY = 0.35;

    const filtered =
      results.filter(
        chunk =>
          chunk.score >= MIN_SIMILARITY
      );

    if (filtered.length === 0) {
      return {
        chunks: [],
        averageScore: 0,
        maxScore: 0,
        confidence: "low",
        answerType: "NO_MATCH"
      };
    }

    const maxScore =
      Math.max(
        ...filtered.map(
          c => c.score
        )
      );

    const averageScore =
      filtered.reduce(
        (sum, c) =>
          sum + c.score,
        0
      ) / filtered.length;

    const confidence =
      maxScore > 0.8
        ? "high"
        : maxScore > 0.55
        ? "medium"
        : "low";

    return {
      chunks: filtered,
      averageScore,
      maxScore,
      confidence,
      answerType: "MATCH"
    };
  }
}