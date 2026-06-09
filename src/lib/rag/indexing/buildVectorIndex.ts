import { buildIndex } from "./buildIndex";
import { getEmbeddingProvider } from "../embeddings/EmbeddingFactory";
import { PgVectorStore } from "../storage/PgVectorStore";

type IndexedChunk = {
  id: string;
  title: string;
  source: string;
  content: string;
};

export async function buildVectorIndex() {
  const provider = getEmbeddingProvider();
  const store = new PgVectorStore();

  const chunks = (await buildIndex()) as IndexedChunk[];

  console.log(`Loaded ${chunks.length} chunks`);

  const documentsBySource = new Map<
    string,
    { title: string; sourcePath: string }
  >();

  for (const chunk of chunks) {
    if (!documentsBySource.has(chunk.source)) {
      documentsBySource.set(chunk.source, {
        title: chunk.title,
        sourcePath: chunk.source,
      });
    }
  }

  const documentIds = new Map<string, string>();

  for (const doc of documentsBySource.values()) {
    const documentId = await store.createOrGetDocument({
      sourcePath: doc.sourcePath,
      title: doc.title,
      language: null,
    });

    documentIds.set(doc.sourcePath, documentId);
    await store.deleteDocumentChunks(documentId);
  }

  const chunkCounters = new Map<string, number>();

  for (const chunk of chunks) {
    const documentId = documentIds.get(chunk.source);

    if (!documentId) {
      continue;
    }

    const chunkIndex = chunkCounters.get(chunk.source) ?? 0;
    chunkCounters.set(chunk.source, chunkIndex + 1);

    console.log(
      `Embedding ${chunkIndex + 1}/${chunks.length}: ${chunk.title}`
    );

    const embedding = await provider.embed(chunk.content);

    await store.insertChunk(
      documentId,
      chunkIndex,
      chunk.content,
      embedding,
      {
        title: chunk.title,
        source: chunk.source,
        originalChunkId: chunk.id,
      }
    );
  }

  console.log(`Stored ${chunks.length} chunks in PostgreSQL`);
}