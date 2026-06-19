import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db/postgres";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { rows } = await pool.query(`SELECT status FROM doc_versions WHERE id = $1`, [id]);
    if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (rows[0].status === "published") {
      return NextResponse.json({ error: "Cannot delete published version" }, { status: 400 });
    }

    await pool.query('BEGIN');
    await pool.query(`DELETE FROM doc_rag_index_entries WHERE page_id IN (SELECT id FROM doc_pages WHERE version_id = $1)`, [id]);
    await pool.query(`DELETE FROM doc_page_revisions WHERE page_id IN (SELECT id FROM doc_pages WHERE version_id = $1)`, [id]);
    await pool.query(`DELETE FROM doc_pages WHERE version_id = $1`, [id]);
    await pool.query(`DELETE FROM doc_versions WHERE id = $1`, [id]);
    await pool.query('COMMIT');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    await pool.query('ROLLBACK');
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
