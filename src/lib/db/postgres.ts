import { Pool } from "pg";
import "dotenv/config";

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.LOCAL_POSTGRES_URL ||
  "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export const pool = new Pool({
  connectionString,

  ssl:
    process.env.POSTGRES_SSL === "true"
      ? {
          rejectUnauthorized: false,
        }
      : undefined,

  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});