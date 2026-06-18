import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db/postgres";
import { v4 as uuidv4 } from "uuid";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const allowedFields = ["title", "slug", "visibility", "content_md"];
    const updates: string[] = [];
    const values: any[] = [id];
    let vIndex = 2;

    const { rows: pageRows } = await pool.query(`SELECT * FROM doc_pages WHERE id = $1`, [id]);
    if (pageRows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const oldPage = pageRows[0];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${vIndex}`);
        values.push(body[field]);
        vIndex++;
      }
    }

    if (updates.length === 0) return NextResponse.json({ success: true });

    updates.push(`updated_at = $${vIndex}`);
    const now = new Date().toISOString();
    values.push(now);

    await pool.query('BEGIN');

    const { rows } = await pool.query(
      `UPDATE doc_pages SET ${updates.join(", ")} WHERE id = $1 RETURNING *`,
      values
    );

    if (body.content_md !== undefined && body.content_md !== oldPage.content_md) {
      const revId = uuidv4();
      await pool.query(
        `INSERT INTO doc_page_revisions (id, page_id, content_md, change_note, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [revId, id, body.content_md, body.change_note || 'Updated content', now]
      );
    }

    await pool.query('COMMIT');
    return NextResponse.json({ page: rows[0] });
  } catch (err: any) {
    await pool.query('ROLLBACK');
    if (err.code === '23505') {
      return NextResponse.json({ error: "Slug already exists in this version" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const now = new Date().toISOString();
    
    await pool.query(
      `UPDATE doc_pages SET is_deleted = true, deleted_at = $1 WHERE id = $2`,
      [now, id]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
