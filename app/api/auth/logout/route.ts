import { type NextRequest, NextResponse } from "next/server";
import {
  clearSessionCookie,
  deleteSessionFromRequest,
} from "../../../../lib/server/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await deleteSessionFromRequest(request);
  } catch (error) {
    console.error("Failed to log out user", error);
  }

  const response = NextResponse.json({ message: "已退出登录。" });
  clearSessionCookie(response);

  return response;
}
