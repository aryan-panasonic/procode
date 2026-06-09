import { getEmbeddingProvider } from "../embeddings/EmbeddingFactory";
import { PgVectorStore, RetrievedChunk } from "../storage/PgVectorStore";

export class PgVectorRetriever {
  private store = new PgVectorStore();

  async retrieve(query: string, topK: number = 5): Promise<RetrievedChunk[]> {
    const provider = getEmbeddingProvider();
    const embedding = await provider.embed(query);

    return this.store.search(embedding, topK);
  }
}