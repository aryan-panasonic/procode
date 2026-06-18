import { pool } from "@/lib/db/postgres";

// ─── GET /api/admin/documents — list all documents ────────────────────────────
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        d.id,
        d.title,
        d.source_path,
        d.original_filename,
        d.language,
        d.status,
        d.file_size_bytes,
        d.uploaded_at,
        COUNT(c.id)::int AS chunk_count
      FROM documents d
      LEFT JOIN chunks c ON c.document_id = d.id
      GROUP BY d.id
      ORDER BY d.uploaded_at DESC NULLS LAST, d.id DESC
    `);

    const docs = result.rows;

    // Post-process to enrich doc_pages with their path
    for (const doc of docs) {
      if (doc.source_path && doc.source_path.startsWith("doc_pages:")) {
        const pageId = doc.source_path.split(":")[1];
        const pageQuery = await pool.query(`
          SELECT p.visibility, v.version_name 
          FROM doc_pages p
          JOIN doc_versions v ON p.version_id = v.id
          WHERE p.id = $1
        `, [pageId]);
        if (pageQuery.rows.length > 0) {
          const p = pageQuery.rows[0];
          doc.original_filename = `${p.version_name}/${p.visibility}/${doc.title}`;
        }
      }
    }

    return Response.json({ documents: docs });
  } catch (err) {
    console.error("[admin/documents] GET error:", err);
    return Response.json({ error: "internal error" }, { status: 500 });
  }
}

// ─── DELETE /api/admin/documents?id=xxx ────────────────────────────────────────
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "id is required" }, { status: 400 });
    }

    // Check if it's a doc_page and deactivate in doc_rag_index_entries
    const docQuery = await pool.query(`SELECT source_path FROM documents WHERE id = $1`, [id]);
    if (docQuery.rows.length > 0) {
      const sourcePath = docQuery.rows[0].source_path;
      if (sourcePath && sourcePath.startsWith("doc_pages:")) {
        const pageId = sourcePath.split(":")[1];
        await pool.query(`UPDATE doc_rag_index_entries SET active = false WHERE page_id = $1`, [pageId]);
      }
    }

    // Chunks are cascade-deleted via FK
    const result = await pool.query(
      `DELETE FROM documents WHERE id = $1 RETURNING id, title`,
      [id]
    );

    if (result.rowCount === 0) {
      return Response.json({ error: "document not found" }, { status: 404 });
    }

    return Response.json({ ok: true, deleted: result.rows[0] });
  } catch (err) {
    console.error("[admin/documents] DELETE error:", err);
    return Response.json({ error: "internal error" }, { status: 500 });
  }
}
