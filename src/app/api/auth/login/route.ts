import { NextRequest, NextResponse } from "next/server";
import { setToken } from "@/lib/auth/session";
import { AuthResponse } from "@/lib/types";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:4000";

export async function POST(req: NextRequest) {
  const body = await req.text();

  const response = await fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  const authData = data as AuthResponse;
  await setToken(authData.accessToken);

  return NextResponse.json({ user: authData.user });
}
