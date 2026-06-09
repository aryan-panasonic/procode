// Formats retrieved chunks into a structured context block for the LLM.
//
// Changes from original:
// - Each chunk is numbered so the model can reference them.
// - Relevance score is included so the model can weight evidence strength.
// - Source path is included so the model knows which document the content
//   came from and can cite it accurately.
// - Content is trimmed to remove leading/trailing whitespace from splits.
// - Chunks are separated by a clear delimiter to reduce bleed-through.
export function buildContext(chunks: any[]): string {
  if (chunks.length === 0) return "";

  return chunks
    .map(
      (chunk, index) =>
        [
          `[CHUNK ${index + 1}]`,
          `Source: ${chunk.source ?? "documentation"}`,
          `Relevance: ${chunk.score != null ? chunk.score.toFixed(3) : "n/a"}`,
          `Title: ${chunk.title}`,
          ``,
          chunk.content.trim(),
        ].join("\n")
    )
    .join("\n\n---\n\n");
}
