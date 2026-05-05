import { type NextRequest, NextResponse } from "next/server";
import { type PoolClient } from "pg";
import { normalizeChinaPhone } from "../../../lib/phone";
import { getUserFromRequest } from "../../../lib/server/auth";
import { getPool } from "../../../lib/server/db";

export const runtime = "nodejs";

type AppointmentData = {
  customerName: string;
  phone: string;
  petName: string;
  petType: string;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  notes: string;
};

const requiredFields = [
  "petName",
  "petType",
  "appointmentDate",
] satisfies Array<keyof AppointmentData>;

export async function GET(request: NextRequest) {
  let pool;

  try {
    pool = getPool();
  } catch {
    return NextResponse.json(
      { message: "Server database connection is not configured." },
      { status: 500 },
    );
  }

  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { message: "请先登录，再查看预约。" },
      { status: 401 },
    );
  }

  try {
    const result = await pool.query(
      `select
        id,
        pet_id,
        pet_name,
        pet_type,
        service_type,
        appointment_date,
        appointment_time,
        notes,
        status,
        created_at
      from public.appointments
      where user_id = $1
      order by created_at desc`,
      [user.id],
    );

    return NextResponse.json({ appointments: result.rows });
  } catch (error) {
    console.error("Failed to load appointments", error);

    return NextResponse.json(
      { message: "暂时无法读取预约记录。" },
      { status: 500 },
    );
  }
}

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

  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { message: "请先登录，再提交预约。" },
      { status: 401 },
    );
  }

  let body: {
    customerName?: unknown;
    phone?: unknown;
    petName?: unknown;
    petType?: unknown;
    serviceType?: unknown;
    appointmentDate?: unknown;
    appointmentTime?: unknown;
    notes?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const data: AppointmentData = {
    customerName: cleanText(body.customerName),
    phone: normalizeChinaPhone(body.phone) || user.phone,
    petName: cleanText(body.petName),
    petType: cleanText(body.petType),
    serviceType: cleanText(body.serviceType),
    appointmentDate: cleanText(body.appointmentDate),
    appointmentTime: cleanText(body.appointmentTime),
    notes: cleanText(body.notes),
  };

  const missingField = requiredFields.find((field) => !data[field]);

  if (missingField) {
    return NextResponse.json(
      { message: "请填写宠物名字、宠物类型和预约日期。" },
      { status: 400 },
    );
  }

  try {
    const client = await pool.connect();

    try {
      await client.query("begin");

      const petId = await findOrCreatePet(client, {
        userId: user.id,
        name: data.petName,
        petType: data.petType,
      });

      const result = await client.query(
        `insert into public.appointments (
          customer_name,
          user_id,
          pet_id,
          phone,
          pet_name,
          pet_type,
          service_type,
          appointment_date,
          appointment_time,
          notes
        ) values ($1, $2, $3, $4, $5, $6, $7, $8, nullif($9, '')::time, $10)
        returning id, pet_id, status, created_at`,
        [
          data.customerName || null,
          user.id,
          petId,
          data.phone,
          data.petName,
          data.petType,
          data.serviceType || null,
          data.appointmentDate,
          data.appointmentTime || "",
          data.notes || null,
        ],
      );

      await client.query("commit");

      return NextResponse.json(
        {
          appointment: result.rows[0],
          message: "预约已提交，门店会尽快联系你确认时间。",
        },
        { status: 201 },
      );
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Failed to create appointment", error);

    return NextResponse.json(
      { message: "暂时无法提交预约，请稍后再试。" },
      { status: 500 },
    );
  }
}

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function findOrCreatePet(
  client: PoolClient,
  {
    userId,
    name,
    petType,
  }: {
    userId: string;
    name: string;
    petType: string;
  },
): Promise<string> {
  const existing = await client.query<{ id: string }>(
    `select id
     from public.pets
     where user_id = $1
       and lower(name) = lower($2)
       and pet_type = $3
       and deleted_at is null
     order by created_at asc
     limit 1`,
    [userId, name, petType],
  );

  if ((existing.rowCount ?? 0) > 0) {
    return existing.rows[0].id;
  }

  const created = await client.query<{ id: string }>(
    `insert into public.pets (user_id, name, pet_type)
     values ($1, $2, $3)
     returning id`,
    [userId, name, petType],
  );

  return created.rows[0].id;
}
