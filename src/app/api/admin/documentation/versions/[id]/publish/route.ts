import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db/postgres";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { rows } = await pool.query(`SELECT status FROM doc_versions WHERE id = $1`, [id]);
    if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (rows[0].status === "published") {
      return NextResponse.json({ error: "Already published" }, { status: 400 });
    }

    const now = new Date().toISOString();

    await pool.query('BEGIN');
    await pool.query(`UPDATE doc_versions SET status = 'archived' WHERE status = 'published'`);
    await pool.query(`UPDATE doc_versions SET status = 'published', published_at = $1 WHERE id = $2`, [now, id]);
    await pool.query('COMMIT');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    await pool.query('ROLLBACK');
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
