import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db/postgres";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const versionId = searchParams.get("versionId");

    if (!versionId) return NextResponse.json({ error: "Missing versionId" }, { status: 400 });

    const { rows } = await pool.query(
      `SELECT * FROM doc_pages WHERE version_id = $1 AND is_deleted = false ORDER BY sort_order ASC, created_at ASC`,
      [versionId]
    );
    return NextResponse.json({ pages: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { versionId, title, slug, visibility } = await req.json();
    if (!versionId || !title || !slug || !visibility) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const newPageId = uuidv4();
    const now = new Date().toISOString();

    const { rows } = await pool.query(
      `INSERT INTO doc_pages (id, version_id, title, slug, visibility, content_md, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, '', $6, $6)
       RETURNING *`,
      [newPageId, versionId, title, slug, visibility, now]
    );

    return NextResponse.json({ page: rows[0] });
  } catch (err: any) {
    if (err.code === '23505') { // unique violation
      return NextResponse.json({ error: "Slug already exists in this version" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
