import { NextResponse } from "next/server";
import { pool } from "@/lib/db/postgres";

export async function GET() {
  try {
    const { rows } = await pool.query(
      `SELECT page_id FROM doc_rag_index_entries WHERE active = true`
    );

    const indexedPageIds = rows.map(r => r.page_id);
    return NextResponse.json({ indexedPageIds });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
