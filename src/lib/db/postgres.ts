import { Pool } from "pg";
import "dotenv/config";

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.LOCAL_POSTGRES_URL;

if (!connectionString) {
  throw new Error(
    "Set POSTGRES_URL (cloud) or LOCAL_POSTGRES_URL (local)"
  );
}

export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl:
    process.env.POSTGRES_SSL === "true"
      ? { rejectUnauthorized: false }
      : undefined,
});