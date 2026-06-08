import fs from "fs/promises";

import { buildIndex }
from "../src/lib/rag/indexing/buildIndex";

async function main() {

  const chunks =
    await buildIndex();

  await fs.mkdir(
    "data",
    { recursive: true }
  );

  await fs.writeFile(
    "data/index.json",
    JSON.stringify(
      chunks,
      null,
      2
    )
  );

  console.log(
    `Indexed ${chunks.length} chunks`
  );
}

main();