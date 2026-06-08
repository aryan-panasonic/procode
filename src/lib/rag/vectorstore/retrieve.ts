import fs from "fs/promises";

import { getEmbeddingProvider }
from "../embeddings/EmbeddingFactory";

import { cosineSimilarity }
from "./cosineSimilarity";

export async function retrieve(
  query: string,
  topK = 5
) {

  const provider =
    getEmbeddingProvider();

  const queryEmbedding =
    await provider.embed(query);

  const raw =
    await fs.readFile(
      "data/vector-index.json",
      "utf8"
    );

  const chunks =
    JSON.parse(raw);

  const scored =
    chunks.map(
      (chunk: any) => ({
        ...chunk,

        score:
          cosineSimilarity(
            queryEmbedding,
            chunk.embedding
          )
      })
    );

  scored.sort(
    (a: any, b: any) =>
      b.score - a.score
  );

  return scored.slice(0, topK);
}