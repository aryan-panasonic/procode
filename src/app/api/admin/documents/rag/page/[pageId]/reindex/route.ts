import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db/postgres";
import { PgVectorStore } from "@/lib/rag/storage/PgVectorStore";
import { chunkText } from "@/lib/rag/chunking/chunkText";
import { getEmbeddingProvider } from "@/lib/rag/embeddings/EmbeddingFactory";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
  try {
    const { pageId } = await params;
    
    // Fetch page details
    const { rows: pageRows } = await pool.query(
      `SELECT p.*, v.version_name 
       FROM doc_pages p
       JOIN doc_versions v ON p.version_id = v.id
       WHERE p.id = $1`,
      [pageId]
    );

    if (pageRows.length === 0) return NextResponse.json({ error: "Page not found" }, { status: 404 });
    const page = pageRows[0];

    const store = new PgVectorStore();
    const provider = getEmbeddingProvider();
    const sourcePath = `doc_pages:${page.id}`;
    const now = new Date().toISOString();

    // Inactivate existing records
    await pool.query(
      `UPDATE doc_rag_index_entries SET active = false WHERE page_id = $1`,
      [pageId]
    );

    // Get documentId and delete chunks
    const documentId = await store.createOrGetDocument({
      sourcePath,
      title: page.title,
      language: "markdown",
      visibility: page.visibility,
    });
    await store.deleteDocumentChunks(documentId);

    // Rechunk and embed
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
          version: page.version_name,
          page: page.title,
          visibility: page.visibility,
        }
      );
    }

    // New active entry
    const entryId = uuidv4();
    await pool.query(
      `INSERT INTO doc_rag_index_entries (id, version_id, page_id, visibility, indexed_at, indexed_by, embedding_model, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
      [entryId, page.version_id, pageId, page.visibility, now, "admin", process.env.LLM_PROVIDER || "auto"]
    );

    return NextResponse.json({ success: true, chunks: chunks.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
