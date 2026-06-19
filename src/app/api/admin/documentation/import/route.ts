import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db/postgres";
import { v4 as uuidv4 } from "uuid";
import { PgVectorStore } from "@/lib/rag/storage/PgVectorStore";
import { chunkText } from "@/lib/rag/chunking/chunkText";
import { getEmbeddingProvider } from "@/lib/rag/embeddings/EmbeddingFactory";

type ImportPage = {
  fileName: string;
  title: string;
  slug: string;
  visibility: "public" | "private";
  content: string;
  duplicateAction?: "skip" | "replace" | "rename";
};

async function indexPage(page: { id: string; title: string; content_md: string; visibility: string; version_id: string; version_name: string }) {
  const store = new PgVectorStore();
  const provider = getEmbeddingProvider();
  const sourcePath = `doc_pages:${page.id}`;
  const now = new Date().toISOString();

  await pool.query(`UPDATE doc_rag_index_entries SET active = false WHERE page_id = $1`, [page.id]);

  const documentId = await store.createOrGetDocument({
    sourcePath,
    title: page.title,
    language: "markdown",
    visibility: page.visibility,
  });
  await store.deleteDocumentChunks(documentId);

  const chunks = chunkText(page.content_md, 1000, 150);
  for (let i = 0; i < chunks.length; i++) {
    const content = chunks[i];
    const embedding = await provider.embed(content);
    await store.insertChunk(documentId, i, content, embedding, {
      version: page.version_name,
      page: page.title,
      visibility: page.visibility,
    });
  }

  const entryId = uuidv4();
  await pool.query(
    `INSERT INTO doc_rag_index_entries (id, version_id, page_id, visibility, indexed_at, indexed_by, embedding_model, active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
    [entryId, page.version_id, page.id, page.visibility, now, "admin", process.env.LLM_PROVIDER || "auto"]
  );
}

async function resolveSlug(versionId: string, slug: string): Promise<string> {
  const { rows } = await pool.query(`SELECT slug FROM doc_pages WHERE version_id = $1 AND is_deleted = false`, [versionId]);
  const taken = new Set(rows.map(r => r.slug));
  if (!taken.has(slug)) return slug;
  let n = 2;
  while (taken.has(`${slug}-${n}`)) n++;
  return `${slug}-${n}`;
}

export async function POST(req: NextRequest) {
  try {
    const { versionId, pages, autoIndex } = await req.json() as { versionId: string; pages: ImportPage[]; autoIndex?: boolean };

    if (!versionId || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json({ error: "Missing versionId or pages" }, { status: 400 });
    }

    const { rows: verRows } = await pool.query(`SELECT * FROM doc_versions WHERE id = $1`, [versionId]);
    if (verRows.length === 0) return NextResponse.json({ error: "Version not found" }, { status: 404 });
    const versionName = verRows[0].version_name;

    const created: any[] = [];
    const skipped: { fileName: string; reason: string }[] = [];
    const now = new Date().toISOString();

    for (const p of pages) {
      if (!p.title || !p.slug || !p.visibility || p.content === undefined) {
        skipped.push({ fileName: p.fileName, reason: "Missing fields" });
        continue;
      }

      const { rows: existingRows } = await pool.query(
        `SELECT * FROM doc_pages WHERE version_id = $1 AND slug = $2 AND is_deleted = false`,
        [versionId, p.slug]
      );
      const existing = existingRows[0];
      const action = p.duplicateAction || "rename";

      let pageRow: any;

      if (existing && action === "skip") {
        skipped.push({ fileName: p.fileName, reason: "Duplicate slug skipped" });
        continue;
      }

      if (existing && action === "replace") {
        await pool.query("BEGIN");
        const { rows } = await pool.query(
          `UPDATE doc_pages SET title = $1, visibility = $2, content_md = $3, updated_at = $4 WHERE id = $5 RETURNING *`,
          [p.title, p.visibility, p.content, now, existing.id]
        );
        await pool.query(
          `INSERT INTO doc_page_revisions (id, page_id, content_md, change_note, created_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [uuidv4(), existing.id, p.content, `Replaced via import (${p.fileName})`, now]
        );
        await pool.query("COMMIT");
        pageRow = rows[0];
      } else {
        const slug = existing ? await resolveSlug(versionId, p.slug) : p.slug;
        const newPageId = uuidv4();
        const { rows } = await pool.query(
          `INSERT INTO doc_pages (id, version_id, title, slug, visibility, content_md, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
           RETURNING *`,
          [newPageId, versionId, p.title, slug, p.visibility, p.content, now]
        );
        pageRow = rows[0];
      }

      if (autoIndex) {
        try {
          await indexPage({ ...pageRow, version_id: versionId, version_name: versionName });
        } catch (indexErr: any) {
          skipped.push({ fileName: p.fileName, reason: `Imported but indexing failed: ${indexErr.message}` });
        }
      }

      created.push(pageRow);
    }

    return NextResponse.json({ pages: created, skipped });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
