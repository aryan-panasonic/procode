import { pool } from "@/lib/db/postgres";

async function main() {
  const result =
    await pool.query("SELECT NOW()");

  console.log(result.rows);
}

main()
  .then(() => process.exit(0))
  .catch(console.error);