import { pool } from "./postgres";
import fs from "fs";
import path from "path";

async function main() {
  try {
    const sql = fs.readFileSync(path.join(process.cwd(), "src/lib/db/migrations/002_documentation.sql"), "utf8");
    await pool.query(sql);
    console.log("Migration 002 applied successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit(0);
  }
}

main();
