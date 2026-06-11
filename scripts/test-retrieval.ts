import { retrieve } from "../src/lib/rag/vectorstore/retrieve";

async function main() {
  const retrievalResult = await retrieve(
    "What image formats are supported?"
  );

  console.log("\n=== RETRIEVAL SUMMARY ===");

  console.log(
    "Confidence:",
    retrievalResult.confidence
  );

  console.log(
    "Average Score:",
    retrievalResult.averageScore
  );

  console.log(
    "Max Score:",
    retrievalResult.maxScore
  );

  console.log(
    "Answer Type:",
    retrievalResult.answerType
  );

  retrievalResult.chunks.forEach(
    (chunk, index) => {
      console.log(
        `\n=== RESULT ${index + 1} ===`
      );

      console.log(
        "Score:",
        chunk.score
      );

      console.log(
        "Title:",
        chunk.title
      );

      console.log(
        chunk.content.slice(
          0,
          500
        )
      );
    }
  );
}

main().catch(console.error);