import { PgVectorRetriever }
from "../src/lib/rag/retrieval/PgVectorRetriever";

async function main() {

  const retriever =
    new PgVectorRetriever();

  const results =
    await retriever.retrieve(
      "What is Oracle Retail?",
      5
    );

  console.dir(results, {
    depth: null
  });

}

main();