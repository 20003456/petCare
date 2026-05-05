import { hash } from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
import { normalizeChinaPhone } from "../../../../lib/phone";
import { validatePasswordStrength } from "../../../../lib/password";
import { getPool } from "../../../../lib/server/db";
import { createSupabaseAdminClient } from "../../../../lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let pool;

  try {
    pool = getPool();
  } catch {
    return NextResponse.json(
      { message: "Server database connection is not configured." },
      { status: 500 },
    );
  }

  let body: {
    customerName?: unknown;
    phone?: unknown;
    password?: unknown;
  };

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
  const customerName = cleanText(body.customerName);

  if (!phone || !password || !customerName) {
    return NextResponse.json(
      { message: "请填写姓名、手机号和密码。" },
      { status: 400 },
    );
  }

  const passwordStrength = validatePasswordStrength(password);

  if (!passwordStrength.isValid) {
    return NextResponse.json(
      { message: passwordStrength.message },
      { status: 400 },
    );
  }

  try {
    const existing = await pool.query<{ id: string }>(
      "select id from public.profiles where phone = $1 limit 1",
      [phone],
    );

    if ((existing.rowCount ?? 0) > 0) {
      return NextResponse.json(
        { message: "这个手机号已经注册过了，请直接登录。" },
        { status: 409 },
      );
    }

    let supabase;

    try {
      supabase = createSupabaseAdminClient();
    } catch {
      return NextResponse.json(
        {
          message:
            "注册服务缺少 SUPABASE_SERVICE_ROLE_KEY 配置。请在 .env.local 里填入 Supabase 的 service_role key，然后重启项目。",
        },
        { status: 500 },
      );
    }

    const { data, error } = await supabase.auth.admin.createUser({
      phone,
      password,
      phone_confirm: true,
      user_metadata: { customer_name: customerName },
    });

    if (error) {
      const status = error.status || 500;
      const duplicate =
        status === 422 || /already|registered|exists/i.test(error.message);

      return NextResponse.json(
        {
          message: duplicate
            ? "这个手机号已经注册过了，请直接登录。"
            : "账号创建失败，请稍后再试。",
        },
        { status: duplicate ? 409 : 500 },
      );
    }

    const passwordHash = await hash(password, 12);
    const client = await pool.connect();

    try {
      await client.query("begin");

      await client.query(
        `insert into public.profiles (id, phone, customer_name)
         values ($1, $2, $3)
         on conflict (id) do update
         set phone = excluded.phone,
             customer_name = excluded.customer_name`,
        [data.user.id, phone, customerName],
      );

      await client.query(
        `insert into private.user_credentials (user_id, password_hash)
         values ($1, $2)
         on conflict (user_id) do update
         set password_hash = excluded.password_hash`,
        [data.user.id, passwordHash],
      );

      await client.query("commit");
    } catch (profileError) {
      await client.query("rollback");
      console.error("Failed to create profile for new user", profileError);

      const { error: rollbackError } = await supabase.auth.admin.deleteUser(
        data.user.id,
      );

      if (rollbackError) {
        console.error(
          "Failed to rollback auth user after profile error",
          rollbackError,
        );
      }

      return NextResponse.json(
        { message: "账号资料保存失败，请稍后重新注册。" },
        { status: 500 },
      );
    } finally {
      client.release();
    }

    return NextResponse.json(
      { message: "账号创建成功。", phone },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to register user", error);

    return NextResponse.json(
      { message: "账号创建失败，请稍后再试。" },
      { status: 500 },
    );
  }
}

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
