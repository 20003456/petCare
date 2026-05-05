import { type NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/server/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Failed to load auth session", error);

    return NextResponse.json(
      { message: "暂时无法读取登录状态。", user: null },
      { status: 500 },
    );
  }
}
