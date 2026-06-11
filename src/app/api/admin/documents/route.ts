import { getPool } from "@/lib/db/postgres";

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

    return Response.json({ documents: result.rows });
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
