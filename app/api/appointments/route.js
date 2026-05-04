import { NextResponse } from "next/server";
import pg from "pg";

export const runtime = "nodejs";

const { Pool } = pg;

const globalForPg = globalThis;
const connectionString =
  process.env.DATABASE_URL || process.env.SUPABASE_SESSION_POOL_URL;

const pool =
  globalForPg.appointmentsPool ??
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.appointmentsPool = pool;
}

const requiredFields = ["phone", "petName", "petType", "appointmentDate"];

export async function POST(request) {
  if (!connectionString) {
    return NextResponse.json(
      { message: "Server database connection is not configured." },
      { status: 500 },
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const data = {
    customerName: cleanText(body.customerName),
    phone: cleanText(body.phone),
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
      { message: "Please complete all required appointment fields." },
      { status: 400 },
    );
  }

  try {
    const result = await pool.query(
      `insert into public.appointments (
        customer_name,
        phone,
        pet_name,
        pet_type,
        service_type,
        appointment_date,
        appointment_time,
        notes
      ) values ($1, $2, $3, $4, $5, $6, nullif($7, '')::time, $8)
      returning id, status, created_at`,
      [
        data.customerName || null,
        data.phone,
        data.petName,
        data.petType,
        data.serviceType || null,
        data.appointmentDate,
        data.appointmentTime || "",
        data.notes || null,
      ],
    );

    return NextResponse.json(
      {
        appointment: result.rows[0],
        message: "Appointment request created.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create appointment", error);

    return NextResponse.json(
      { message: "Unable to create appointment right now." },
      { status: 500 },
    );
  }
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}
