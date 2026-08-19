import { NextResponse } from "next/server";
import { clearToken } from "@/lib/auth/session";

export async function POST() {
  await clearToken();
  return NextResponse.json({ success: true });
}
