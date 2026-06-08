import { loadDocuments }
from "../loaders/markdownLoader";

import { chunkText }
from "../chunking/chunkText";

import { Chunk }
from "../types/Chunk";

export async function buildIndex() {

  const docs =
    await loadDocuments();

  const chunks: Chunk[] = [];

  for (const doc of docs) {

    const docChunks =
      chunkText(doc.content);

    docChunks.forEach(
      (content, index) => {

        chunks.push({
          id:
            `${doc.source}-${index}`,

          title: doc.title,

          source: doc.source,

          content
        });

      }
    );
  }

  return chunks;
}