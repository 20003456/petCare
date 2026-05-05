import { createHash, randomBytes } from "crypto";
import { type NextRequest, NextResponse } from "next/server";
import { type Pool, type PoolClient } from "pg";
import { getPool } from "./db";

export const SESSION_COOKIE = "petcare_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type AppUser = {
  id: string;
  phone: string;
  customerName: string | null;
};

type SessionUserRow = {
  id: string;
  phone: string;
  customer_name: string | null;
};

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createUserSession(
  client: Pool | PoolClient,
  userId: string,
): Promise<string> {
  const token = createSessionToken();
  const sessionHash = hashSessionToken(token);

  await client.query(
    `insert into private.user_sessions (user_id, session_hash, expires_at)
     values ($1, $2, now() + ($3::int * interval '1 second'))`,
    [userId, sessionHash, SESSION_MAX_AGE_SECONDS],
  );

  return token;
}

export async function getUserFromRequest(
  request: NextRequest,
): Promise<AppUser | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const sessionHash = hashSessionToken(token);
  const pool = getPool();
  const result = await pool.query<SessionUserRow>(
    `select p.id, p.phone, p.customer_name
     from private.user_sessions s
     join public.profiles p on p.id = s.user_id
     where s.session_hash = $1
       and s.expires_at > now()
     limit 1`,
    [sessionHash],
  );

  if ((result.rowCount ?? 0) === 0) {
    return null;
  }

  await pool.query(
    `update private.user_sessions
     set last_seen_at = now()
     where session_hash = $1`,
    [sessionHash],
  );

  return mapUserRow(result.rows[0]);
}

export async function deleteSessionFromRequest(
  request: NextRequest,
): Promise<void> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return;
  }

  await getPool().query(
    "delete from private.user_sessions where session_hash = $1",
    [hashSessionToken(token)],
  );
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

function mapUserRow(row: SessionUserRow): AppUser {
  return {
    id: row.id,
    phone: row.phone,
    customerName: row.customer_name,
  };
}
