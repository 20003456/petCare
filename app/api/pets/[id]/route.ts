import { type NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/server/auth";
import {
  getDatabaseConfigErrorResponse,
  getPool,
  isDatabaseConfigError,
} from "../../../../lib/server/db";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type PetRow = {
  id: string;
  name: string;
  pet_type: string;
  sensitivity_notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ message: "请先登录。" }, { status: 401 });
    }

    const { id } = await context.params;
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

    const result = await getPool().query<PetRow>(
      `update public.pets
       set name = $1,
           pet_type = $2,
           sensitivity_notes = nullif($3, ''),
           updated_at = now()
       where id = $4
         and user_id = $5
         and deleted_at is null
       returning id, name, pet_type, sensitivity_notes, created_at, updated_at`,
      [data.name, data.petType, data.sensitivityNotes, id, user.id],
    );

    if ((result.rowCount ?? 0) === 0) {
      return NextResponse.json(
        { message: "没有找到这份宠物档案。" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      pet: mapPet(result.rows[0]),
      message: "宠物档案已更新。",
    });
  } catch (error) {
    console.error("Failed to update pet", error);

    if (isDatabaseConfigError(error)) {
      return NextResponse.json(getDatabaseConfigErrorResponse(error), {
        status: 500,
      });
    }

    return NextResponse.json(
      { message: "暂时无法更新宠物档案，请稍后再试。" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ message: "请先登录。" }, { status: 401 });
    }

    const { id } = await context.params;

    const result = await getPool().query<{ id: string }>(
      `update public.pets
       set deleted_at = now(),
           updated_at = now()
       where id = $1
         and user_id = $2
         and deleted_at is null
       returning id`,
      [id, user.id],
    );

    if ((result.rowCount ?? 0) === 0) {
      return NextResponse.json(
        { message: "没有找到这份宠物档案。" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "宠物档案已删除。" });
  } catch (error) {
    console.error("Failed to delete pet", error);

    if (isDatabaseConfigError(error)) {
      return NextResponse.json(getDatabaseConfigErrorResponse(error), {
        status: 500,
      });
    }

    return NextResponse.json(
      { message: "暂时无法删除宠物档案，请稍后再试。" },
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
