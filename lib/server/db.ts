import { Pool } from "pg";

const globalForPg = globalThis as typeof globalThis & {
  petCarePool?: Pool;
};

const connectionString =
  process.env.DATABASE_URL || process.env.SUPABASE_SESSION_POOL_URL;

export function getPool(): Pool {
  const pgConfig = getPgConfig();

  if (!connectionString && !pgConfig) {
    throw new Error("Server database connection is not configured.");
  }

  const pool =
    globalForPg.petCarePool ??
    new Pool(
      connectionString
        ? {
            connectionString,
            ssl: { rejectUnauthorized: false },
            max: 5,
          }
        : {
            ...pgConfig,
            ssl: { rejectUnauthorized: false },
            max: 5,
          },
    );

  if (process.env.NODE_ENV !== "production") {
    globalForPg.petCarePool = pool;
  }

  return pool;
}

function getPgConfig() {
  const host = process.env.PGHOST;
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD;
  const database = process.env.PGDATABASE;
  const port = Number(process.env.PGPORT || 5432);

  if (!host || !user || !password || !database) {
    return null;
  }

  return {
    host,
    user,
    password,
    database,
    port,
  };
}
