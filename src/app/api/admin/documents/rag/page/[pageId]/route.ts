import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db/postgres";
import { PgVectorStore } from "@/lib/rag/storage/PgVectorStore";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
  try {
    const { pageId } = await params;
    const store = new PgVectorStore();
    const sourcePath = `doc_pages:${pageId}`;

    // Get documentId
    const { rows: docRows } = await pool.query(
      `SELECT id FROM documents WHERE source_path = $1`,
      [sourcePath]
    );

    if (docRows.length > 0) {
      await store.deleteDocumentChunks(docRows[0].id);
    }

    await pool.query(
      `UPDATE doc_rag_index_entries SET active = false WHERE page_id = $1`,
      [pageId]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
