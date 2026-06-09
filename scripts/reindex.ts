import { buildVectorIndex }
from "../src/lib/rag/indexing/buildVectorIndex";

buildVectorIndex()
  .then(() => {
    console.log("Done");
    process.exit(0);
  })
  .catch(console.error);