import { PgVectorRetriever } from "../retrieval/PgVectorRetriever";

const retriever = new PgVectorRetriever();

export async function retrieve(query: string, topK: number = 5) {
  return retriever.retrieve(query, topK);
}