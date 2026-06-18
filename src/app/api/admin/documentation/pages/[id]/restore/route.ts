import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db/postgres";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { revisionId } = await req.json();

    if (!revisionId) return NextResponse.json({ error: "Missing revisionId" }, { status: 400 });

    const { rows: revRows } = await pool.query(
      `SELECT content_md FROM doc_page_revisions WHERE id = $1 AND page_id = $2`,
      [revisionId, id]
    );

    if (revRows.length === 0) return NextResponse.json({ error: "Revision not found" }, { status: 404 });
    const content = revRows[0].content_md;
    const now = new Date().toISOString();
    const newRevId = uuidv4();

    await pool.query('BEGIN');
    
    // Update page
    const { rows } = await pool.query(
      `UPDATE doc_pages SET content_md = $1, updated_at = $2 WHERE id = $3 RETURNING *`,
      [content, now, id]
    );

    // Create a new revision to track the restoration
    await pool.query(
      `INSERT INTO doc_page_revisions (id, page_id, content_md, change_note, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [newRevId, id, content, `Restored from revision ${revisionId}`, now]
    );

    await pool.query('COMMIT');
    return NextResponse.json({ page: rows[0] });
  } catch (err: any) {
    await pool.query('ROLLBACK');
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
