import { type NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "../../../lib/server/auth";
import { getPool } from "../../../lib/server/db";

export const runtime = "nodejs";

type PetRow = {
  id: string;
  name: string;
  pet_type: string;
  sensitivity_notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ message: "请先登录。" }, { status: 401 });
  }

  try {
    const result = await getPool().query<PetRow>(
      `select id, name, pet_type, sensitivity_notes, created_at, updated_at
       from public.pets
       where user_id = $1
         and deleted_at is null
       order by created_at desc`,
      [user.id],
    );

    return NextResponse.json({ pets: result.rows.map(mapPet) });
  } catch (error) {
    console.error("Failed to load pets", error);

    return NextResponse.json(
      { message: "暂时无法读取宠物档案。" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ message: "请先登录。" }, { status: 401 });
  }

  let body: { name?: unknown; petType?: unknown; sensitivityNotes?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "请求内容格式不正确。" },
      { status: 400 },
    );
  }

  const data = cleanPetInput(body);

  if (!data.name || !data.petType) {
    return NextResponse.json(
      { message: "请填写宠物名字和宠物类型。" },
      { status: 400 },
    );
  }

  try {
    const result = await getPool().query<PetRow>(
      `insert into public.pets (user_id, name, pet_type, sensitivity_notes)
       values ($1, $2, $3, nullif($4, ''))
       returning id, name, pet_type, sensitivity_notes, created_at, updated_at`,
      [user.id, data.name, data.petType, data.sensitivityNotes],
    );

    return NextResponse.json(
      { pet: mapPet(result.rows[0]), message: "宠物档案已创建。" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create pet", error);

    return NextResponse.json(
      { message: "暂时无法创建宠物档案，请稍后再试。" },
      { status: 500 },
    );
  }
}

function cleanPetInput(body: {
  name?: unknown;
  petType?: unknown;
  sensitivityNotes?: unknown;
}) {
  return {
    name: cleanText(body.name),
    petType: cleanText(body.petType),
    sensitivityNotes: cleanText(body.sensitivityNotes),
  };
}

function mapPet(row: PetRow) {
  return {
    id: row.id,
    name: row.name,
    petType: row.pet_type,
    sensitivityNotes: row.sensitivity_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
