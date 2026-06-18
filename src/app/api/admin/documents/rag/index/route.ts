import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db/postgres";
import { v4 as uuidv4 } from "uuid";
import { chunkText } from "@/lib/rag/chunking/chunkText";
import { getEmbeddingProvider } from "@/lib/rag/embeddings/EmbeddingFactory";
import { PgVectorStore } from "@/lib/rag/storage/PgVectorStore";

export async function POST(req: NextRequest) {
  try {
    const { versionId, pageIds } = await req.json();
    if (!versionId || !Array.isArray(pageIds) || pageIds.length === 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { rows: versionRows } = await pool.query(
      `SELECT version_name FROM doc_versions WHERE id = $1`,
      [versionId]
    );

    if (versionRows.length === 0) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    const versionName = versionRows[0].version_name;
    const provider = getEmbeddingProvider();
    const store = new PgVectorStore();
    const now = new Date().toISOString();

    const results = [];

    for (const pageId of pageIds) {
      const { rows: pageRows } = await pool.query(
        `SELECT * FROM doc_pages WHERE id = $1 AND version_id = $2`,
        [pageId, versionId]
      );

      if (pageRows.length === 0) continue;
      const page = pageRows[0];
      const sourcePath = `doc_pages:${page.id}`;

      // Mark old index entries as inactive if they exist
      await pool.query(
        `UPDATE doc_rag_index_entries SET active = false WHERE page_id = $1`,
        [pageId]
      );

      // Create document in vector store
      const documentId = await store.createOrGetDocument({
        sourcePath,
        title: page.title,
        language: "markdown",
      });

      // Delete existing chunks just in case
      await store.deleteDocumentChunks(documentId);

      // Chunk and embed
      const chunks = chunkText(page.content_md, 1000, 150);
      for (let i = 0; i < chunks.length; i++) {
        const content = chunks[i];
        const embedding = await provider.embed(content);
        
        await store.insertChunk(
          documentId,
          i,
          content,
          embedding,
          {
            version: versionName,
            page: page.title,
            visibility: page.visibility,
          }
        );
      }

      // Add to doc_rag_index_entries
      const entryId = uuidv4();
      await pool.query(
        `INSERT INTO doc_rag_index_entries (id, version_id, page_id, visibility, indexed_at, indexed_by, embedding_model, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
        [entryId, versionId, pageId, page.visibility, now, "admin", process.env.LLM_PROVIDER || "auto"]
      );

      results.push({ pageId, chunks: chunks.length });
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("Index to RAG error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
