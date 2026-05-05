import { Pool } from "pg";

const globalForPg = globalThis as typeof globalThis & {
  petCarePool?: Pool;
};

const connectionString =
  process.env.DATABASE_URL || process.env.SUPABASE_SESSION_POOL_URL;

export function getPool(): Pool {
  if (!connectionString) {
    throw new Error("Server database connection is not configured.");
  }

  const pool =
    globalForPg.petCarePool ??
    new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPg.petCarePool = pool;
  }

  return pool;
}
