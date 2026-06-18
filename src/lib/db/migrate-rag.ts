import { pool } from "./postgres";
import fs from "fs";
import path from "path";

async function main() {
  try {
    const sql = fs.readFileSync(path.join(process.cwd(), "src/lib/db/migrations/003_doc_rag.sql"), "utf8");
    await pool.query(sql);
    console.log("Migration 003 applied successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit(0);
  }
}

main();
