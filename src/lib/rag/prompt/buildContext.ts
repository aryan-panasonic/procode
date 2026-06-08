export function buildContext(
  chunks: any[]
) {

  return chunks
    .map(
      chunk =>
`
DOCUMENT:
${chunk.title}

CONTENT:
${chunk.content}
`
    )
    .join("\n\n");
}