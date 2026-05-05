import { Pool } from "pg";
import { readServerEnv } from "./env";

const globalForPg = globalThis as typeof globalThis & {
  petCarePool?: Pool;
};

const CONNECTION_STRING_ENV_NAMES = [
  "DATABASE_URL",
  "SUPABASE_SESSION_POOL_URL",
] as const;

const PG_ENV_NAMES = [
  "PGHOST",
  "PGUSER",
  "PGPASSWORD",
  "PGDATABASE",
] as const;

const PETCARE_DB_ENV_NAMES = [
  "PETCARE_DB_HOST",
  "PETCARE_DB_USER",
  "PETCARE_DB_PASSWORD",
  "PETCARE_DB_NAME",
] as const;

export class DatabaseConfigError extends Error {
  readonly missingConnectionStringEnv: string[];
  readonly missingPgEnv: string[];
  readonly missingPetcareDbEnv: string[];

  constructor(status: DatabaseConfigStatus) {
    super(
      "服务器数据库连接未配置完整。请在 Netlify 当前站点配置 DATABASE_URL 或 SUPABASE_SESSION_POOL_URL；如果使用拆分配置，请补齐 PGHOST、PGUSER、PGPASSWORD、PGDATABASE。",
    );
    this.name = "DatabaseConfigError";
    this.missingConnectionStringEnv = status.missingConnectionStringEnv;
    this.missingPgEnv = status.missingPgEnv;
    this.missingPetcareDbEnv = status.missingPetcareDbEnv;
  }
}

type DatabaseConfigStatus = {
  hasConnectionString: boolean;
  hasPgConfig: boolean;
  hasPetcareDbConfig: boolean;
  missingConnectionStringEnv: string[];
  missingPgEnv: string[];
  missingPetcareDbEnv: string[];
};

export function getPool(): Pool {
  const connectionString = getConnectionString();
  const pgConfig = getPgConfig();

  if (!connectionString && !pgConfig) {
    throw new DatabaseConfigError(getDatabaseConfigStatus());
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

export function isDatabaseConfigError(
  error: unknown,
): error is DatabaseConfigError {
  return error instanceof DatabaseConfigError;
}

export function getDatabaseConfigStatus(): DatabaseConfigStatus {
  const missingConnectionStringEnv = missingEnv(CONNECTION_STRING_ENV_NAMES);
  const missingPgEnv = missingEnv(PG_ENV_NAMES);
  const missingPetcareDbEnv = missingEnv(PETCARE_DB_ENV_NAMES);

  return {
    hasConnectionString:
      missingConnectionStringEnv.length < CONNECTION_STRING_ENV_NAMES.length,
    hasPgConfig: missingPgEnv.length === 0,
    hasPetcareDbConfig: missingPetcareDbEnv.length === 0,
    missingConnectionStringEnv,
    missingPgEnv,
    missingPetcareDbEnv,
  };
}

export function getDatabaseConfigErrorResponse(error: DatabaseConfigError) {
  return {
    message: error.message,
    missingConnectionStringEnv: error.missingConnectionStringEnv,
    missingPgEnv: error.missingPgEnv,
    missingPetcareDbEnv: error.missingPetcareDbEnv,
  };
}

function getConnectionString() {
  return (
    readServerEnv("DATABASE_URL") || readServerEnv("SUPABASE_SESSION_POOL_URL")
  );
}

function getPgConfig() {
  const host = readServerEnv("PGHOST") || readServerEnv("PETCARE_DB_HOST");
  const user = readServerEnv("PGUSER") || readServerEnv("PETCARE_DB_USER");
  const password =
    readServerEnv("PGPASSWORD") || readServerEnv("PETCARE_DB_PASSWORD");
  const database =
    readServerEnv("PGDATABASE") || readServerEnv("PETCARE_DB_NAME");
  const port = Number(
    readServerEnv("PGPORT") || readServerEnv("PETCARE_DB_PORT") || 5432,
  );

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

function missingEnv(names: readonly string[]) {
  return names.filter((name) => !readServerEnv(name));
}
