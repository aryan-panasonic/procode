import { getPool } from "./db/postgres";

export async function validateDatabase() {
  await pool.query("SELECT 1");
}