import path from "path";

// ─── Source path sanitisation ─────────────────────────────────────────────────
// Internal filesystem paths (e.g. /home/user/project/src/content/en/docs/api.md)
// must never reach the LLM context — they expose deployment layout and could be
// leveraged in prompt-injection attacks that try to reference or manipulate
// "known" file locations.
//
// We keep only the human-readable filename (without extension) joined with any
// meaningful parent directory for readability, e.g.:
//   /src/content/en/docs/getting-started.md  →  docs/getting-started
//   getting-started.md                        →  getting-started
//   undefined                                 →  documentation
function sanitizeSource(raw: string | undefined | null): string {
  if (!raw) return "documentation";

  // Normalise separators, then grab the last two meaningful segments
  const normalised = raw.replace(/\\/g, "/");
  const parts      = normalised.split("/").filter(Boolean);

  if (parts.length === 0) return "documentation";

  const file = path.basename(parts[parts.length - 1], path.extname(parts[parts.length - 1]));
  const dir  = parts.length > 1 ? parts[parts.length - 2] : null;

  return dir ? `${dir}/${file}` : file;
}

// ─── buildContext ─────────────────────────────────────────────────────────────
// Formats retrieved chunks into a structured context block for the LLM.
//
// Each chunk is numbered so the model can reference it.
// Source is sanitised — only a human-readable label is exposed, never a full path.
// Relevance score is intentionally omitted from the LLM context (S4: no internal
// details) but can be logged server-side for observability if needed.
// Content is trimmed to remove whitespace artefacts from splitting.
// Chunks are separated by a clear delimiter to reduce context bleed-through.
export function buildContext(chunks: any[]): string {
  if (chunks.length === 0) return "";

  return chunks
    .map((chunk, index) =>
      [
        `[CHUNK ${index + 1}]`,
        `Source: ${sanitizeSource(chunk.source)}`,
        `Title: ${chunk.title ?? "Untitled"}`,
        ``,
        chunk.content.trim(),
      ].join("\n")
    )
    .join("\n\n---\n\n");
}
