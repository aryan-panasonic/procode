import { PgVectorStore }
from "../src/lib/rag/storage/PgVectorStore";

async function main() {

  const store =
    new PgVectorStore();

  console.log(
    await store.healthCheck()
  );

}

main();