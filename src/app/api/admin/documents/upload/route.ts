// ─── /api/admin/documents/upload ─────────────────────────────────────────────
//
// Accepts multipart/form-data with a single `file` field.
// Supported types: .md, .txt, .pdf (needs pdf-parse), .docx (needs mammoth).
//
// Flow: receive → extract text → chunk → embed → store in PgVectorStore

import { pool } from "@/lib/db/postgres";
import { PgVectorStore }         from "@/lib/rag/storage/PgVectorStore";
import { getEmbeddingProvider }  from "@/lib/rag/embeddings/EmbeddingFactory";
import { chunkText }             from "@/lib/rag/chunking/chunkText";
import matter                    from "gray-matter";

// ─── Text extraction ──────────────────────────────────────────────────────────

async function extractText(
  filename: string,
  buffer:   Buffer
): Promise<{ text: string; title: string }> {

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";

  // ── Markdown / plain text ──
  if (ext === "md" || ext === "markdown") {
    const raw    = buffer.toString("utf-8");
    const parsed = matter(raw);
    return {
      text:  parsed.content,
      title: (parsed.data.title as string) ?? filename,
    };
  }

  if (ext === "txt") {
    return { text: buffer.toString("utf-8"), title: filename };
  }

  // ── PDF (optional — install: npm install pdf-parse) ──
  if (ext === "pdf") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
      const result   = await pdfParse(buffer);
      return { text: result.text, title: filename };
    } catch (e: any) {
      if (e.code === "MODULE_NOT_FOUND") {
        throw new Error(
          "PDF support requires: npm install pdf-parse\n" +
          "Run the install command and restart the server."
        );
      }
      throw e;
    }
  }

  // ── DOCX (optional — install: npm install mammoth) ──
  if (ext === "docx") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mammoth = require("mammoth") as {
        extractRawText: (opts: { buffer: Buffer }) => Promise<{ value: string }>;
      };
      const result = await mammoth.extractRawText({ buffer });
      return { text: result.value, title: filename };
    } catch (e: any) {
      if (e.code === "MODULE_NOT_FOUND") {
        throw new Error(
          "DOCX support requires: npm install mammoth\n" +
          "Run the install command and restart the server."
        );
      }
      throw e;
    }
  }

  throw new Error(
    `Unsupported file type: .${ext}. Supported: .md, .txt, .pdf, .docx`
  );
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file     = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "A file field is required" }, { status: 400 });
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_SIZE) {
      return Response.json({ error: "File too large (max 10 MB)" }, { status: 413 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer      = Buffer.from(arrayBuffer);

    // ── Extract text ──────────────────────────────────────────────────────────
    let extracted: { text: string; title: string };
    try {
      extracted = await extractText(file.name, buffer);
    } catch (err: any) {
      return Response.json({ error: err.message ?? "text extraction failed" }, { status: 422 });
    }

    const { text, title } = extracted;

    if (text.trim().length === 0) {
      return Response.json({ error: "No text content extracted from the file" }, { status: 422 });
    }

    // ── Chunk ─────────────────────────────────────────────────────────────────
    const chunks = chunkText(text, 1000, 150);

    // ── Upsert document record ────────────────────────────────────────────────
    const store      = new PgVectorStore();
    const sourcePath = `uploaded/${file.name}`;

    const visibility = formData.get("visibility") as string || "private";

    const documentId = await store.createOrGetDocument({
      sourcePath,
      title,
      language: null,
      visibility,
    });

    // Clear existing chunks so re-upload replaces content cleanly
    await store.deleteDocumentChunks(documentId);

    // Update metadata columns (added by migration 003)
    await pool.query(
      `UPDATE documents
       SET original_filename = $2,
           status            = 'indexing',
           file_size_bytes   = $3,
           uploaded_at       = now()
       WHERE id = $1`,
      [documentId, file.name, file.size]
    );

    // ── Embed & store chunks ───────────────────────────────────────────────────
    const provider = getEmbeddingProvider();

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await provider.embed(chunks[i]);
      await store.insertChunk(documentId, i, chunks[i], embedding, {
        title,
        source: sourcePath,
      });
    }

    // Mark complete
    await pool.query(
      `UPDATE documents
       SET status      = 'indexed',
           chunk_count = $2
       WHERE id = $1`,
      [documentId, chunks.length]
    );

    return Response.json({
      ok:          true,
      documentId,
      title,
      chunkCount:  chunks.length,
      fileSizeBytes: file.size,
    });

  } catch (err) {
    console.error("[admin/documents/upload] POST error:", err);
    return Response.json({ error: "internal error" }, { status: 500 });
  }
}
