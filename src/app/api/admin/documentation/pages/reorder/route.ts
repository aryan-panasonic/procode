import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db/postgres";

export async function POST(req: NextRequest) {
  try {
    const { orderedIds } = await req.json();
    if (!orderedIds || !Array.isArray(orderedIds)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await pool.query('BEGIN');
    
    // Process in batches or one by one
    for (let i = 0; i < orderedIds.length; i++) {
      await pool.query(
        `UPDATE doc_pages SET sort_order = $1 WHERE id = $2`,
        [i, orderedIds[i]]
      );
    }

    await pool.query('COMMIT');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    await pool.query('ROLLBACK');
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
