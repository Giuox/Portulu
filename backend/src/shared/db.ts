import { Pool } from "pg";
import { env } from "./config";

let pool: Pool | null = null;

export function getPgPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: env.PGHOST,
      port: Number(env.PGPORT),
      database: env.PGDATABASE,
      user: env.PGUSER,
      password: env.PGPASSWORD,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false
    });
  }
  return pool;
}

