import fs from "fs/promises";

import { getEmbeddingProvider } from "../embeddings/EmbeddingFactory";

import { EmbeddedChunk } from "../types/EmbeddedChunk";

export async function buildVectorIndex() {

  const provider =
    getEmbeddingProvider();

  const raw =
    await fs.readFile(
      "data/index.json",
      "utf8"
    );

  const chunks =
    JSON.parse(raw);

  const embedded:
    EmbeddedChunk[] = [];

  for (const chunk of chunks) {

    console.log(
      `Embedding: ${chunk.title}`
    );

    const embedding =
      await provider.embed(
        chunk.content
      );

    embedded.push({
      ...chunk,
      embedding
    });
  }

  await fs.writeFile(
    "data/vector-index.json",
    JSON.stringify(
      embedded,
      null,
      2
    )
  );

  console.log(
    `Embedded ${embedded.length} chunks`
  );
}