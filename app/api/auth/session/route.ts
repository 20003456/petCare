import { type NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/server/auth";
import {
  getDatabaseConfigErrorResponse,
  isDatabaseConfigError,
} from "../../../../lib/server/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Failed to load auth session", error);

    if (isDatabaseConfigError(error)) {
      return NextResponse.json(
        { ...getDatabaseConfigErrorResponse(error), user: null },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "暂时无法读取登录状态。", user: null },
      { status: 500 },
    );
  }
}
