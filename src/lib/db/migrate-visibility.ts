import { pool } from "./postgres";
import fs from "fs";
import path from "path";

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, "migrations", "004_rag_visibility.sql"), "utf8");
  await pool.query(sql);
  console.log("Applied 004_rag_visibility.sql");
  process.exit(0);
}
run().catch(err => {
  console.error(err);
  process.exit(1);
});
