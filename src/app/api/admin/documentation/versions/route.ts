import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db/postgres";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM doc_versions ORDER BY created_at DESC`
    );
    return NextResponse.json({ versions: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { versionName, copyFromId } = await req.json();
    if (!versionName) return NextResponse.json({ error: "Missing version name" }, { status: 400 });

    const newVersionId = uuidv4();
    const now = new Date().toISOString();

    await pool.query('BEGIN');

    await pool.query(
      `INSERT INTO doc_versions (id, version_name, status, created_at, updated_at)
       VALUES ($1, $2, 'draft', $3, $3)`,
      [newVersionId, versionName, now]
    );

    if (copyFromId) {
      await pool.query(
        `INSERT INTO doc_pages (id, version_id, title, slug, visibility, content_md, sort_order, created_at, updated_at)
         SELECT gen_random_uuid(), $1, title, slug, visibility, content_md, sort_order, $2, $2
         FROM doc_pages
         WHERE version_id = $3 AND is_deleted = false`,
        [newVersionId, now, copyFromId]
      );
    }

    await pool.query('COMMIT');

    const { rows } = await pool.query(`SELECT * FROM doc_versions WHERE id = $1`, [newVersionId]);
    return NextResponse.json({ version: rows[0] });
  } catch (err: any) {
    await pool.query('ROLLBACK');
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
