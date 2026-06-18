import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db/postgres";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { rows } = await pool.query(
      `SELECT * FROM doc_page_revisions WHERE page_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    return NextResponse.json({ revisions: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
