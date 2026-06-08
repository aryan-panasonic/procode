import { retrieve }
from "../src/lib/rag/vectorstore/retrieve";

async function main() {

  const results =
    await retrieve(
      "What image formats are supported?"
    );

  results.forEach(
    (result: any, index: number) => {

      console.log(
        `\n=== RESULT ${index + 1} ===`
      );

      console.log(
        "Score:",
        result.score
      );

      console.log(
        "Title:",
        result.title
      );

      console.log(
        result.content.slice(
          0,
          500
        )
      );
    }
  );
}

main();