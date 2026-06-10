import { buildVectorIndex } from "@/lib/rag/indexing/buildVectorIndex";

// ─── POST /api/admin/reindex ──────────────────────────────────────────────────
// Rebuilds the entire vector index from src/content/**/docs/**/*.md
// This is a long-running operation (~seconds per document).

export async function POST() {
  try {
    console.log("[admin/reindex] Starting full reindex...");
    await buildVectorIndex();
    console.log("[admin/reindex] Reindex complete.");

    return Response.json({ ok: true, message: "Index rebuilt successfully." });
  } catch (err: any) {
    console.error("[admin/reindex] Error:", err);
    return Response.json(
      { error: err?.message ?? "Reindex failed" },
      { status: 500 }
    );
  }
}
