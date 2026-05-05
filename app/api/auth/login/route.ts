import { compare, hash } from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
import { normalizeChinaPhone } from "../../../../lib/phone";
import {
  createUserSession,
  setSessionCookie,
} from "../../../../lib/server/auth";
import { getPool } from "../../../../lib/server/db";

export const runtime = "nodejs";

type LoginBody = {
  phone?: unknown;
  password?: unknown;
};

type LoginRow = {
  id: string;
  phone: string;
  customer_name: string | null;
  password_hash: string | null;
  encrypted_password: string | null;
};

export async function POST(request: NextRequest) {
  let body: LoginBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "请求内容格式不正确。" },
      { status: 400 },
    );
  }

  const phone = normalizeChinaPhone(body.phone);
  const password = cleanText(body.password);

  if (!phone || !password) {
    return NextResponse.json(
      { message: "请填写手机号和密码。" },
      { status: 400 },
    );
  }

  try {
    const pool = getPool();
    const result = await pool.query<LoginRow>(
      `select
        p.id,
        p.phone,
        p.customer_name,
        c.password_hash,
        u.encrypted_password
       from public.profiles p
       join auth.users u on u.id = p.id
       left join private.user_credentials c on c.user_id = p.id
       where p.phone = $1
       limit 1`,
      [phone],
    );

    if ((result.rowCount ?? 0) === 0) {
      return invalidLogin();
    }

    const user = result.rows[0];
    const verified = await verifyPasswordAndMigrate(user, password);

    if (!verified) {
      return invalidLogin();
    }

    const token = await createUserSession(pool, user.id);
    const response = NextResponse.json({
      user: {
        id: user.id,
        phone: user.phone,
        customerName: user.customer_name,
      },
    });

    setSessionCookie(response, token);

    return response;
  } catch (error) {
    console.error("Failed to log in user", error);

    return NextResponse.json(
      { message: "登录服务暂时不可用，请稍后再试。" },
      { status: 500 },
    );
  }
}

async function verifyPasswordAndMigrate(
  user: LoginRow,
  password: string,
): Promise<boolean> {
  const currentHash = user.password_hash;

  if (currentHash) {
    return compare(password, currentHash);
  }

  if (!user.encrypted_password) {
    return false;
  }

  const oldPasswordMatches = await compare(password, user.encrypted_password);

  if (!oldPasswordMatches) {
    return false;
  }

  const passwordHash = await hash(password, 12);

  await getPool().query(
    `insert into private.user_credentials (user_id, password_hash)
     values ($1, $2)
     on conflict (user_id) do update
     set password_hash = excluded.password_hash`,
    [user.id, passwordHash],
  );

  return true;
}

function invalidLogin() {
  return NextResponse.json(
    { message: "登录失败：手机号或密码不正确。" },
    { status: 401 },
  );
}

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
